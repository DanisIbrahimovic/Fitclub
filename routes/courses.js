import express from 'express';
import { getCourses, bookCourse } from '../controllers/courses.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCourses);
router.post('/book', verifyToken, bookCourse);

export default router;
