import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'admin',
    host: process.env.POSTGRES_HOST || 'postgres',
    database: process.env.POSTGRES_DB || 'jira_tracker_db',
    password: process.env.POSTGRES_PASSWORD || 'secure_password',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS time_entries (
                id VARCHAR(255) PRIMARY KEY,
                ticket_id VARCHAR(255) NOT NULL,
                description TEXT,
                duration_minutes INTEGER NOT NULL,
                timestamp BIGINT NOT NULL
            );
        `);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database', err);
    }
};
