import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || undefined,
});

pool.on('error', (err) => {
  console.error('PostgreSQL Pool error:', err.message);
});

export const testDbConnection = async () => {
  try {
    const { rows } = await pool.query('SELECT current_database() AS db, current_user AS usr');
    console.log(`Connected to DB: ${rows[0].db} | User: ${rows[0].usr}`);
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    if (error.code) console.error(`  Code:   ${error.code}`);
    if (error.detail) console.error(`  Detail: ${error.detail}`);
  }
};