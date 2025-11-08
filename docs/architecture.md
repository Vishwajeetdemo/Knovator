# 🏗️ Architecture – Scalable Job Importer (Artha Job Board)

## 🚀 Overview

This system implements a **Scalable Job Importer** that fetches job listings from multiple external XML APIs, converts them to JSON, and imports them into **MongoDB** using a **queue-based background processing system** powered by **Redis** and **BullMQ**.

The goal is to ensure scalability, modularity, and traceability through **import history tracking**, so administrators can monitor each import run (total fetched, inserted, updated, and failed records).

---

## 🧩 High-Level Architecture


---

## 🧠 Key Components

### 1. **Job Source API Integration**
- Fetches data from multiple XML-based APIs (e.g., Jobicy, HigherEdJobs).
- Converts XML → JSON using `xml2js`.
- Stores fetched data in MongoDB (insert or update by job ID).
- Can run via **Cron Job** (every hour) to automate imports.

### 2. **Queue-Based Background Processing**
- Uses **Redis** as the queue store.
- Implements **BullMQ** for job management and concurrency control.
- Each job import task (API fetch + DB insert/update) is pushed to the queue.
- Worker processes handle these jobs asynchronously for scalability.
- Failed jobs are retried automatically with exponential backoff (configurable).

### 3. **Import History Tracking**
- Every import operation logs:
  - `timestamp`
  - `totalFetched`
  - `newJobs`
  - `updatedJobs`
  - `failedJobs`
  - `failedReasons`
- These are stored in a dedicated MongoDB collection: `import_logs`.
- The frontend dashboard displays this data in a table view.

---

## ⚙️ Technologies Used

| Layer | Technology | Purpose |
|-------|-------------|----------|
| Frontend | Next.js | Admin UI for viewing Import History |
| Backend | Node.js + Express | REST API + job scheduling endpoints |
| Database | MongoDB (Mongoose) | Store jobs and import logs |
| Queue | BullMQ | Background job management |
| Queue Store | Redis (via Docker) | Message broker and queue persistence |
| Utilities | xml2js, cron | XML parsing and scheduling |

---

## 🗂️ Folder Structure

project-root/
│
├── client/frontend-app # Next.js frontend
│ ├── src/pages
│ ├── components/Navbar
│ └── admin/Login
│
├── server/ # Express backend
│ ├── src/
│ │ ├── config/ # MongoDB, Redis connections, .env setup
│ │ ├── jobs/ # Job queue and worker setup
│ │ ├── models/ # Mongoose models (Job, ImportLog)
│ │ ├── routes/ # Express routes (API endpoints)
│ │ ├── cron/
│ │ └── consroller/
│ ├── docker-compose.yml # Redis service setup
│ └── .env # Environment variables
│
├── docs/
│ └── architecture.md # This file
│
└── README.md # Setup instructions and usage


---

## 🧮 Data Flow Explanation

1. **Cron Trigger / Manual Import**
   - A scheduled job runs every hour (or manually via API call).
   - It fetches XML data from the given job APIs.

2. **XML to JSON Conversion**
   - Each XML feed is parsed using `xml2js` and normalized into a job schema.

3. **Queueing Jobs**
   - Parsed jobs are sent to the **BullMQ queue**.
   - Redis stores the queue and handles concurrency and retry logic.

4. **Worker Processing**
   - The **worker** listens to the queue.
   - For each job:
     - If the job already exists in MongoDB → update.
     - Otherwise → insert as a new record.
   - Failures are logged and retried based on configuration.

5. **Logging**
   - After processing, a record is added to the `import_logs` collection.
   - The frontend fetches and displays this via REST API.

---

## 🧰 Scalability & Design Choices

### ✅ Modular Design
- Services and workers are decoupled.
- Future microservice migration is easy — each component (API, worker, UI) can run independently.

### ✅ Queue-Based Load Management
- BullMQ allows horizontal scaling by increasing worker concurrency.
- Redis enables job persistence and high throughput.

### ✅ Fault Tolerance
- Failed jobs are retried automatically.
- Import logs store detailed failure reasons for debugging.

### ✅ Configurability
- Batch size, concurrency, and retry limits are environment-driven (`.env`).
- Redis and Mongo URIs are configurable for local or cloud setups.

---

## 🧱 Future Enhancements

- **Real-time Import Logs** via Socket.IO or Server-Sent Events.
- **Dynamic API Feed Management** (store and manage job feed URLs in MongoDB).
- **Error Notification System** (Slack/email alerts on repeated failures).
- **Dockerized Deployment** using Vercel (frontend) + Render (backend).

---

## 🌐 Deployment Notes

- **MongoDB Atlas** and **Redis Cloud** are used for production-ready scalability.
- The backend (`server`) runs on port `7000` by default.
- Docker automatically starts the Redis container defined in `docker-compose.yml`.
- Frontend can be deployed independently (Vercel or Netlify).

---

