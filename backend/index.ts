import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/config/database';
import { errorHandler, notFound } from './src/middleware/errorHandler';
import { requestLogger } from './src/middleware/requestLogger';
import inventoryRoutes from './src/routes/inventory';
import movementRoutes from './src/routes/movements';
import scanRoutes from './src/routes/scans';
import orderRoutes from './src/routes/orders';
import supplyChainRoutes from './src/routes/supplyChain';
import healthRoutes from './src/routes/health';
import requisitionRoutes from './src/routes/requisitions';
import voucherRoutes from './src/routes/vouchers';
import productRoutes from './src/routes/products';

const app = express();
const PORT = Number(process.env.PORT || 4100);
const HOST = process.env.HOST || 'localhost';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.LOG_FORMAT || 'combined'));
}
app.use(requestLogger);

// Health check route
app.use('/health', healthRoutes);

// API routes
const API_PREFIX = process.env.API_PREFIX || '/api';
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/movements`, movementRoutes);
app.use(`${API_PREFIX}/scans`, scanRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/supply-chain`, supplyChainRoutes);
app.use(`${API_PREFIX}/requisitions`, requisitionRoutes);
app.use(`${API_PREFIX}/vouchers`, voucherRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Generic Inventory Management API',
    version: process.env.API_VERSION || 'v1',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      inventory: '/api/inventory',
      movements: '/api/movements',
      scans: '/api/scans',
      orders: '/api/orders',
      supplyChain: '/api/supply-chain',
      requisitions: '/api/requisitions',
      vouchers: '/api/vouchers'
      ,products: '/api/products'
    },
    note: 'MongoDB connection required for full functionality'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Health check available at http://${HOST}:${PORT}/health`);
      console.log(`🔗 API endpoints available at http://${HOST}:${PORT}${API_PREFIX}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;
