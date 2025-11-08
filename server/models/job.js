// models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: String,
    link: String,
    category: String,
    description: String,
    pubDate: Date,
});

export default mongoose.model("Job", jobSchema);
