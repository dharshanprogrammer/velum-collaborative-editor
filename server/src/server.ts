import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { authRouter } from './routes/auth.js';
import { documentsRouter } from './routes/documents.js';
import { commentsRouter } from './routes/comments.js';
import { usersRouter } from './routes/users.js';
import { setupWebSocketServer } from './websocket/wsServer.js';
import { flushAllRooms } from './websocket/roomManager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin === CLIENT_URL
    ) {
      return callback(null, true);
    }
    // Allow for deployed instances
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'velum-server', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/users', usersRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const server = http.createServer(app);

// Attach WebSocket CRDT server
setupWebSocketServer(server);

// Start Server
async function start() {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  🚀 Velum Studio Server active on http://localhost:${PORT}`);
    console.log(`  ⚡ WebSocket endpoint: ws://localhost:${PORT}/ws`);
    console.log(`======================================================\n`);
  });
}

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  await flushAllRooms();
  server.close(() => {
    console.log('[Server] HTTP and WS servers closed cleanly.');
    process.exit(0);
  });

  // Force exit after 10s if stuck
  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

start().catch((err) => {
  console.error('Failed to start server:', err);
});
