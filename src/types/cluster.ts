export interface RabbitMQCluster {
  id: string;
  name: string;
  host: string;
  port: number;
  managementPort: number;
  username: string;
  password: string;
  vhost?: string;
  nodes?: Node[];
  health?: ClusterHealth;
}

export interface Node {
  name: string;
  type: 'disc' | 'ram';
  running: boolean;
  uptime: number;
  metrics: NodeMetrics;
}

export interface NodeMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskFree: number;
  fdUsage: number;
  socketUsage: number;
  erlangProcesses: number;
}

export interface QueueInfo {
  name: string;
  messages: number;
  consumers: number;
  state: string;
  memory: number;
  messageStats: {
    publishRate: number;
    deliverRate: number;
    ackRate: number;
    redeliverRate: number;
  };
}

export interface ClusterStats {
  totalQueues: number;
  totalConnections: number;
  publishRate: number;
  consumeRate: number;
  nodes: number;
  runningNodes: number;
}

export interface ClusterHealth {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime: number;
  version: string;
  lastCheck: string;
  issues?: string[];
}

export interface Exchange {
  name: string;
  type: 'direct' | 'fanout' | 'topic' | 'headers';
  durable: boolean;
  autoDelete: boolean;
  internal: boolean;
  bindings: Binding[];
}

export interface Binding {
  source: string;
  destination: string;
  routingKey: string;
  destinationType: 'queue' | 'exchange';
}

export interface Connection {
  id: string;
  client: string;
  state: 'running' | 'blocked' | 'closed';
  channels: number;
  receivedBytes: number;
  sentBytes: number;
  connectedAt: string;
  peerHost: string;
  peerPort: number;
  ssl: boolean;
}

export interface User {
  username: string;
  tags: string[];
  permissions: {
    configure: string;
    write: string;
    read: string;
    vhost: string;
  };
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  component: string;
  message: string;
}