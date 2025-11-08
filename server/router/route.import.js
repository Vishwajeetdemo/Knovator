import express from 'express';
import { importDataAIP, getImportLogs } from '../Controller/importData.js';

const router = express.Router();

router.get('/fetch-data', importDataAIP);
router.get('/import-logs', getImportLogs);

export default router;