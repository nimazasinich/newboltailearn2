import { Router, Request, Response } from 'express';
import { ErrorHandler } from '../middleware/errorHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import Database from 'better-sqlite3';

const router = Router();

// Initialize error handler
const errorHandler = new ErrorHandler(Database('./persian_legal_ai.db'));

/**
 * Log error from client
 */
router.post('/log', async (req: Request, res: Response) => {
  try {
    const { message, stack, componentStack, timestamp, userAgent, url, category } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create error object
    const error = new Error(message);
    error.stack = stack;

    // Log error
    await errorHandler.logError(
      error,
      category || 'client_error',
      (req as any).user?.id,
      (req as any).requestId
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging client error:', error);
    res.status(500).json({ error: 'Failed to log error' });
  }
});

/**
 * Get error logs (admin only)
 */
router.get('/logs', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  try {
    const {
      limit = 100,
      offset = 0,
      level,
      category,
      userId
    } = req.query;

    const logs = errorHandler.getErrorLogs(
      parseInt(limit as string),
      parseInt(offset as string),
      level as string,
      category as string,
      userId ? parseInt(userId as string) : undefined
    );

    res.json({ logs });
  } catch (error) {
    console.error('Error getting error logs:', error);
    res.status(500).json({ error: 'Failed to get error logs' });
  }
});

/**
 * Get error statistics (admin only)
 */
router.get('/stats', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const stats = errorHandler.getErrorStats(parseInt(days as string));
    res.json({ stats });
  } catch (error) {
    console.error('Error getting error stats:', error);
    res.status(500).json({ error: 'Failed to get error statistics' });
  }
});

/**
 * Clean old error logs (admin only)
 */
router.delete('/clean', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const deletedCount = errorHandler.cleanOldLogs(parseInt(days as string));
    res.json({ deletedCount, message: `Cleaned ${deletedCount} old error logs` });
  } catch (error) {
    console.error('Error cleaning old logs:', error);
    res.status(500).json({ error: 'Failed to clean old logs' });
  }
});

export default router;