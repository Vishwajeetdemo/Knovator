import { Worker } from "bullmq";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import Job from "../models/job.js";
import ImportLog from "../models/ImportLog.js";
import Redis from "ioredis";
import connectDB from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

connectDB();
const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

const parser = new XMLParser();

const worker = new Worker(
    "importQueue",
    async (job) => {
        const { api } = job.data;
        console.log(`🧩 Processing: ${api.source}`);

        try {
            const cacheKey = `feed:${api.source}`;
            const cachedData = await redis.get(cacheKey);
            let items;

            if (cachedData) {
                console.log(`✅ Using cached data for ${api.source}`);
                items = JSON.parse(cachedData);
            } else {
                console.log(`🌐 Fetching new data for ${api.source}`);
                const response = await axios.get(api.url.trim(), {
                    headers: { Accept: "application/xml" },
                });
                const jsonData = parser.parse(response.data);
                items = jsonData?.rss?.channel?.item || jsonData?.feed?.entry || [];

                await redis.setex(cacheKey, 600, JSON.stringify(items));
            }

            const totalFetched = items.length;

            const jobs = items.map((item) => ({
                title: item.title || item["title"]?.["#text"] || "Untitled",
                link: item.link?.href || item.link || "",
                description: item.description || item.summary || "",
                category: item.category || "",
                pubDate: new Date(item.pubDate || item.updated || Date.now()),
                source: api.source,
            }));

            const uniqueJobs = Array.from(
                new Map(jobs.map((j) => [j.link, j])).values()
            );

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

            await ImportLog.create({
                source: api.source,
                totalFetched,
                totalImported,
                totalFailed,
            });

            console.log(`✅ Completed: ${api.source}`);
        } catch (err) {
            console.error(`❌ Error in worker for ${api.source}:`, err.message);
        }
    },
    { connection: redis }
);

worker.on("completed", (job) => {
    console.log(`🎉 Job ${job.id} completed for ${job.data.api.source}`);
});

worker.on("failed", (job, err) => {
    console.log(`💥 Job ${job.id} failed: ${err.message}`);
});
