-- Clusters table
CREATE TABLE IF NOT EXISTS clusters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  vhost TEXT DEFAULT '/',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Queue statistics
CREATE TABLE IF NOT EXISTS queue_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cluster_id TEXT NOT NULL,
  queue_name TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  consumer_count INTEGER DEFAULT 0,
  memory_usage INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE CASCADE
);

-- Connection history
CREATE TABLE IF NOT EXISTS connection_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cluster_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  disconnected_at DATETIME,
  bytes_received INTEGER DEFAULT 0,
  bytes_sent INTEGER DEFAULT 0,
  FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE CASCADE
);

-- Resource metrics
CREATE TABLE IF NOT EXISTS resource_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cluster_id TEXT NOT NULL,
  cpu_usage REAL,
  memory_usage REAL,
  disk_usage REAL,
  network_in_bytes INTEGER,
  network_out_bytes INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE CASCADE
);

-- User permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cluster_id TEXT NOT NULL,
  username TEXT NOT NULL,
  configure_regex TEXT,
  write_regex TEXT,
  read_regex TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE CASCADE
);