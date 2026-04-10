import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import router from './routes.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Middleware
app.use(cors());
app.use(express.json());

// Access code protection (set ACCESS_CODE env var to enable)
const ACCESS_CODE = process.env.ACCESS_CODE;
if (ACCESS_CODE) {
  app.use('/api', (req, res, next) => {
    if (req.path === '/auth' && req.method === 'POST') return next();
    if (req.path === '/health') return next();
    const code = req.headers['x-access-code'];
    if (code !== ACCESS_CODE) return res.status(401).json({ error: 'Invalid access code' });
    next();
  });
}

// API routes
app.use('/api', router);

// Serve built React app in production
app.use(express.static(distDir));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
