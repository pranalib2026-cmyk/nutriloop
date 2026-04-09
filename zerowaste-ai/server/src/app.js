import express   from 'express';
import cors      from 'cors';
import morgan    from 'morgan';
import helmet    from 'helmet';
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
  origin:         process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials:    true,
  methods:        ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/food',     foodRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/match',    matchRoutes);
app.use('/api/v1/admin',    adminRoutes);

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${res.statusCode}`);
  next();
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

connectDB();
export default app;
