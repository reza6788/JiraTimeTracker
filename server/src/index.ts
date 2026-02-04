import express from 'express';
import cors from 'cors';
import { query, initDb } from './db';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database Table
initDb();

// Types 
// (Duplicated from frontend for simplicity in this setup, ideally shared)
interface TimeEntry {
    id: string;
    ticketId: string;
    description: string;
    durationMinutes: number;
    timestamp: number;
}

// Routes
app.get('/api/entries', async (req, res) => {
    try {
        const result = await query('SELECT * FROM time_entries ORDER BY timestamp DESC');
        // Map DB columns to API response (snake_case to camelCase)
        const entries = result.rows.map((row: any) => ({
            id: row.id,
            ticketId: row.ticket_id,
            description: row.description,
            durationMinutes: row.duration_minutes,
            timestamp: parseInt(row.timestamp)
        }));
        res.json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/entries', async (req, res) => {
    const entry: TimeEntry = req.body;
    try {
        await query(
            'INSERT INTO time_entries (id, ticket_id, description, duration_minutes, timestamp) VALUES ($1, $2, $3, $4, $5)',
            [entry.id, entry.ticketId, entry.description, entry.durationMinutes, entry.timestamp]
        );
        res.status(201).json(entry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/entries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM time_entries WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
