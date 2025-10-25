import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import jobsRouter from './routes/jobs.js';
import cvsRouter from './routes/cvs.js';
import matchRouter from './routes/match.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

app.use('/jobs', jobsRouter);
app.use('/cvs', cvsRouter);
app.use('/match', matchRouter);
app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
