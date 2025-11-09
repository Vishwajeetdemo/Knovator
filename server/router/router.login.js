import express from 'express';
import { createAuthLogin, loginUser, getAuthLogins } from '../Controller/authLogin.js';

const router = express.Router();
router.post('/register', createAuthLogin);
router.post('/login', loginUser);
router.get('/users', getAuthLogins);
export default router;