import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { connectDB } from './config/db.js';
import authRoutes    from './routes/auth.routes.js';
import foodRoutes    from './routes/food.routes.js';
import requestRoutes from './routes/request.routes.js';
import matchRoutes   from './routes/match.routes.js';
import adminRoutes   from './routes/admin.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // In development, accept any localhost port (5173, 5174, etc.)
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    // In production, check against FRONTEND_URL
    const allowed = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (origin === allowed) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check — no auth required
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// API routes
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/food',     foodRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/match',    matchRoutes);
app.use('/api/v1/admin',    adminRoutes);

// 404 — must call next(err) so errorHandler fires
app.use((req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.path}`);
  err.status = 404;
  next(err);
});

// Global error handler — must be last
app.use(errorHandler);

// Connect DB
connectDB();

export default app;
