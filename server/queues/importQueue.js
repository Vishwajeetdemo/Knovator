import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

export const importQueue = new Queue("importQueue", { connection });
