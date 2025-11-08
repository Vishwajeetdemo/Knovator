import mongoose from "mongoose";

const importLogSchema = new mongoose.Schema({
    source: String,                   
    totalFetched: Number,             
    totalImported: Number,            
    totalFailed: Number,              
    importDate: { type: Date, default: Date.now }, 
});

export default mongoose.model("ImportLog", importLogSchema);
