import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import route from './router/route.import.js';
import connectDB from './config/db.js';
import './cron/jobCron.js';

const app = express()
dotenv.config();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
connectDB();

app.use('/api', route);


app.listen(process.env.PORT, () => console.log(`Server start ${process.env.PORT} in ${process.env.NODE_ENV}!`))