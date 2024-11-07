import { db } from './db/index.js';
import logger from './logger.js';

export async function healthCheck() {
  logger.info('Performing health check');
  
  try {
    // Test database connection
    const result = db.prepare('SELECT 1').get();
    logger.info('Health check passed', { dbResult: result });
    return true;
  } catch (error) {
    logger.error('Health check failed:', error);
    return false;
  }
}