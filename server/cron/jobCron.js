import cron from "node-cron";
import { importDataAIP } from "../Controller/importData.js";

// Run every 6 hours
cron.schedule("0 */6 * * *", async () => {
    console.log("Cron job started: Fetching new job feeds...");
    await importDataAIP(); 
});
