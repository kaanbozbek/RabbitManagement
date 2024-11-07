import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import logger from '../logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'rabbitwatch.db');

logger.info('Initializing database', { path: DB_PATH });

// Initialize database
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
logger.info('Database initialized with foreign keys enabled');

// Load and execute schema
try {
  const schema = fs.readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
  logger.info('Database schema loaded and executed successfully');
} catch (error) {
  logger.error('Failed to load or execute database schema:', error);
  throw error;
}

// Prepare statements with logging
const createLoggingStatement = (stmt, name) => {
  const wrapped = (...args) => {
    try {
      logger.debug(`Executing SQL statement: ${name}`, { args });
      const result = stmt.run(...args);
      logger.debug(`SQL statement completed: ${name}`, { changes: result.changes });
      return result;
    } catch (error) {
      logger.error(`SQL statement failed: ${name}`, { error, args });
      throw error;
    }
  };
  return wrapped;
};

// Prepare statements
const statements = {
  // Clusters
  insertCluster: createLoggingStatement(
    db.prepare(`
      INSERT INTO clusters (id, name, host, port, username, password, vhost)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `),
    'insertCluster'
  ),
  
  getCluster: createLoggingStatement(
    db.prepare('SELECT * FROM clusters WHERE id = ?'),
    'getCluster'
  ),
  
  getAllClusters: createLoggingStatement(
    db.prepare('SELECT * FROM clusters'),
    'getAllClusters'
  ),
  
  deleteCluster: createLoggingStatement(
    db.prepare('DELETE FROM clusters WHERE id = ?'),
    'deleteCluster'
  ),
  
  // Queue stats
  insertQueueStats: createLoggingStatement(
    db.prepare(`
      INSERT INTO queue_stats (cluster_id, queue_name, message_count, consumer_count, memory_usage)
      VALUES (?, ?, ?, ?, ?)
    `),
    'insertQueueStats'
  ),
  
  getQueueStats: createLoggingStatement(
    db.prepare(`
      SELECT * FROM queue_stats 
      WHERE cluster_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `),
    'getQueueStats'
  ),
  
  // Resource metrics
  insertResourceMetrics: createLoggingStatement(
    db.prepare(`
      INSERT INTO resource_metrics (
        cluster_id, cpu_usage, memory_usage, disk_usage, 
        network_in_bytes, network_out_bytes
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    'insertResourceMetrics'
  ),
  
  getLatestResourceMetrics: createLoggingStatement(
    db.prepare(`
      SELECT * FROM resource_metrics 
      WHERE cluster_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `),
    'getLatestResourceMetrics'
  ),
  
  // Connection history
  insertConnection: createLoggingStatement(
    db.prepare(`
      INSERT INTO connection_history (
        cluster_id, client_id, bytes_received, bytes_sent
      )
      VALUES (?, ?, ?, ?)
    `),
    'insertConnection'
  ),
  
  updateConnectionDisconnect: createLoggingStatement(
    db.prepare(`
      UPDATE connection_history 
      SET disconnected_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND disconnected_at IS NULL
    `),
    'updateConnectionDisconnect'
  ),
  
  getActiveConnections: createLoggingStatement(
    db.prepare(`
      SELECT * FROM connection_history 
      WHERE cluster_id = ? AND disconnected_at IS NULL
    `),
    'getActiveConnections'
  )
};

logger.info('Database statements prepared successfully');

export { db, statements };