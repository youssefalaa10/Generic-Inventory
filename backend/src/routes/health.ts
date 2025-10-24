import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || 'v1',
  });
});

// Detailed health check with database status
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.API_VERSION || 'v1',
      database: {
        status: dbStates[dbState as keyof typeof dbStates],
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Readiness check (for Kubernetes)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;
    
    if (dbState === 1) { // Connected
      res.json({
        status: 'READY',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        reason: 'Database not connected',
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      reason: 'Health check failed',
    });
  }
});

// Liveness check (for Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
