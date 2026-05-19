import express from 'express';
import cookieParser from 'cookie-parser';
import { pool } from './config/db.js';

import authRoutes       from './routes/auth.js';
import activitiesRoutes from './routes/activities.js';
import coursesRoutes    from './routes/courses.js';
import publicRoutes     from './routes/public.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: "FitClub API is running" });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 AS ok');
    res.status(200).json({ status: 'ok', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/public', publicRoutes);

export default app;
