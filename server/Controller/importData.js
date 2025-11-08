import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import Job from "../models/job.js";
import ImportLog from "../models/ImportLog.js";
import Redis from "ioredis";

const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
});

const API_URLS = [
    { url: "https://jobicy.com/?feed=job_feed", source: "Jobicy-All" },
    { url: "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time", source: "Jobicy-SMM" },
    { url: "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia", source: "Jobicy-Design" },
    { url: "https://jobicy.com/?feed=job_feed&job_categories=data-science", source: "Jobicy-DataScience" },
    { url: "https://jobicy.com/?feed=job_feed&job_categories=copywriting", source: "Jobicy-Copywriting" },
    { url: "https://jobicy.com/?feed=job_feed&job_categories=business", source: "Jobicy-Business" },
    { url: "https://jobicy.com/?feed=job_feed&job_categories=management", source: "Jobicy-Management" },
    { url: "https://www.higheredjobs.com/rss/articleFeed.cfm", source: "HigherEdJobs" }
];

export const importDataAIP = async (req, res) => {
    try {
        const parser = new XMLParser();
        let logs = [];

        for (const api of API_URLS) {
            try {
                const cacheKey = `feed:${api.source}`;
                const cachedData = await redis.get(cacheKey);

                let items;

                if (cachedData) {
                    //console.log(` Using cached data for ${api.source}`);
                    items = JSON.parse(cachedData);
                } else {
                    console.log(` Fetching new data for ${api.source}`);
                    const response = await axios.get(api.url.trim(), { headers: { Accept: "application/xml" } });
                    const jsonData = parser.parse(response.data);
                    items = jsonData?.rss?.channel?.item || jsonData?.feed?.entry || [];

                    // Store in Redis for 10 minutes
                    await redis.setex(cacheKey, 600, JSON.stringify(items));
                }

                const totalFetched = items.length;

                // Normalize data
                const jobs = items.map(item => ({
                    title: item.title || item["title"]?.["#text"] || "Untitled",
                    link: item.link?.href || item.link || "",
                    description: item.description || item.summary || "",
                    category: item.category || "",
                    pubDate: new Date(item.pubDate || item.updated || Date.now()),
                    source: api.source,
                }));

                // Remove duplicates
                const uniqueJobs = Array.from(new Map(jobs.map(j => [j.link, j])).values());

                let totalImported = 0;
                let totalFailed = 0;

                try {
                    const result = await Job.insertMany(uniqueJobs, { ordered: false });
                    totalImported = result.length;
                } catch (err) {
                    const insertedCount = err?.result?.result?.nInserted || 0;
                    totalImported = insertedCount;
                    totalFailed = uniqueJobs.length - insertedCount;
                }

                const log = await ImportLog.create({
                    source: api.source,
                    totalFetched,
                    totalImported,
                    totalFailed,
                });

                logs.push(log);
            } catch (err) {
                //console.error(` Failed fetching ${api.source}:`, err.message);
                const failLog = await ImportLog.create({
                    source: api.source,
                    totalFetched: 0,
                    totalImported: 0,
                    totalFailed: 1,
                });
                logs.push(failLog);
            }
        }

        res.json({
            message: "All data fetched and saved successfully (with caching)!",
            summary: logs.map(l => ({
                fileName: l.source,
                importDateTime: l.importDate,
                totalFetched: l.totalFetched,
                totalImported: l.totalImported,
                totalFailed: l.totalFailed,
                totalNewRecords: l.totalImported,
            })),
        });
    } catch (error) {
        console.error("Error fetching/saving data:", error.message);
        res.status(500).json({ message: "Error fetching or saving data" });
    }
};

export const getImportLogs = async (req, res) => {
    try {
        const cacheKey = "importLogs";

        // 1️ Check cache first
        const cachedLogs = await redis.get(cacheKey);
        if (cachedLogs) {
            //console.log("Returning cached import logs");
            return res.json(JSON.parse(cachedLogs));
        }

        // 2️ Fetch from DB if not cached
        console.log(" Fetching logs from MongoDB...");
        const logs = await ImportLog.find().sort({ importDate: -1 });

        const formattedLogs = logs.map(log => ({
            fileName: log.source,
            importDateTime: log.importDate,
            totalFetched: log.totalFetched,
            totalImported: log.totalImported,
            totalFailed: log.totalFailed,
            totalNewRecords: log.totalImported,
        }));

        // 3️ Store logs in Redis cache for 5 minutes (300 seconds)
        await redis.setex(cacheKey, 300, JSON.stringify(formattedLogs));

        res.json(formattedLogs);
    } catch (error) {
        console.error(" Error fetching import logs:", error.message);
        res.status(500).json({ message: "Error fetching import logs" });
    }
};


// import { importQueue } from "../queues/importQueue.js";
// import ImportLog from "../models/ImportLog.js";
// import Redis from "ioredis";

// const redis = new Redis({ host: "127.0.0.1", port: 6379 });

// const API_URLS = [
//     { url: "https://jobicy.com/?feed=job_feed", source: "Jobicy-All" },
//     { url: "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time", source: "Jobicy-SMM" },
//     { url: "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia", source: "Jobicy-Design" },
//     { url: "https://jobicy.com/?feed=job_feed&job_categories=data-science", source: "Jobicy-DataScience" },
//     { url: "https://jobicy.com/?feed=job_feed&job_categories=copywriting", source: "Jobicy-Copywriting" },
//     { url: "https://jobicy.com/?feed=job_feed&job_categories=business", source: "Jobicy-Business" },
//     { url: "https://jobicy.com/?feed=job_feed&job_categories=management", source: "Jobicy-Management" },
//     { url: "https://www.higheredjobs.com/rss/articleFeed.cfm", source: "HigherEdJobs" },
// ];

// //  Trigger background job for each API
// export const importDataAIP = async (req, res) => {
//     try {
//         for (const api of API_URLS) {
//             await importQueue.add("importJob", { api });
//         }

//         res.json({
//             message: "Import jobs added to queue successfully 🚀",
//             totalJobs: API_URLS.length,
//         });
//     } catch (error) {
//         console.error("Error adding jobs to queue:", error.message);
//         res.status(500).json({ message: "Error adding jobs to queue" });
//     }
// };

// //  Cached logs endpoint
// export const getImportLogs = async (req, res) => {
//     try {
//         const cacheKey = "importLogs";
//         const cachedLogs = await redis.get(cacheKey);
//         if (cachedLogs) {
//             console.log("Returning cached import logs");
//             return res.json(JSON.parse(cachedLogs));
//         }

//         console.log("Fetching logs from MongoDB...");
//         const logs = await ImportLog.find().sort({ importDate: -1 });

//         const formattedLogs = logs.map((log) => ({
//             fileName: log.source,
//             importDateTime: log.importDate,
//             totalFetched: log.totalFetched,
//             totalImported: log.totalImported,
//             totalFailed: log.totalFailed,
//             totalNewRecords: log.totalImported,
//         }));

//         await redis.setex(cacheKey, 300, JSON.stringify(formattedLogs));

//         res.json(formattedLogs);
//     } catch (error) {
//         console.error("Error fetching import logs:", error.message);
//         res.status(500).json({ message: "Error fetching import logs" });
//     }
// };
