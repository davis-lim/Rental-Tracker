import express from 'express';
import cors from 'cors';
import db from './db.js';
import router from './routes.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
