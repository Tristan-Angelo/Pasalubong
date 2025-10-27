import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Basic security, gzip, CORS, and logging
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev'));

// Parse JSON bodies for APIs
app.use(express.json({ limit: '1mb' }));

// Static assets - serve React build in production, Vite dev server in development
const isProduction = process.env.NODE_ENV === 'production';
const projectRoot = path.resolve(__dirname, '..');

// Serve uploaded files
app.use('/uploads', express.static(path.join(projectRoot, 'public/uploads')));

if (isProduction) {
  // In production, serve the built React app
  const buildDir = path.join(projectRoot, 'dist');
  app.use(express.static(buildDir, { maxAge: '1d', etag: true }));
} else {
  // In development, proxy to Vite dev server
  app.use('/assets', express.static(path.join(projectRoot, 'public')));
}

// Healthcheck
app.use('/health', (await import('./routes/health.js')).default);

// API v1
app.use('/api/v1', (await import('./routes/api/index.js')).default);

// In production, serve React app for all non-API routes
if (isProduction) {
  app.get('*', (req, res) => {
    // Check if it's an API request
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Check if it's a static asset request
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      return res.status(404).json({ error: 'Static asset not found' });
    }
    
    // For all other requests, serve the React app
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Avoid leaking internal errors in production
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
  if (!isProduction) {
    console.log(`React dev server should be running on http://localhost:5173`);
  }
});
