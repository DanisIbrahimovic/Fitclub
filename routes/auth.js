import express from 'express';
import { register, login, changePassword } from '../controllers/auth.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/password', verifyToken, changePassword);

export default router;
