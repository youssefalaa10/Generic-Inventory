import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    
    console.log(`📤 ${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

export default requestLogger;
