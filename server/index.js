import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage
const mockQueues = new Map();
const mockExchanges = new Map();
const mockConnections = new Map();

app.use(cors());
app.use(express.json());

// Overview endpoint
app.get('/api/overview', (req, res) => {
  res.json({
    management_version: '1.0.0',
    rabbitmq_version: '3.12.0',
    erlang_version: '25.0',
    cluster_name: 'rabbit@localhost',
    queue_totals: {
      messages: Array.from(mockQueues.values()).reduce((sum, q) => sum + q.messages, 0),
      messages_ready: Array.from(mockQueues.values()).reduce((sum, q) => sum + q.messages_ready, 0),
      messages_unacknowledged: Array.from(mockQueues.values()).reduce((sum, q) => sum + q.messages_unacknowledged, 0)
    },
    object_totals: {
      connections: mockConnections.size,
      channels: Array.from(mockConnections.values()).reduce((sum, c) => sum + c.channels, 0),
      exchanges: mockExchanges.size,
      queues: mockQueues.size
    },
    message_stats: {
      publish: Math.floor(Math.random() * 1000),
      publish_details: { rate: Math.floor(Math.random() * 100) },
      deliver_get: Math.floor(Math.random() * 800),
      deliver_get_details: { rate: Math.floor(Math.random() * 80) }
    }
  });
});

// Queues endpoints
app.get('/api/queues', (req, res) => {
  res.json(Array.from(mockQueues.values()));
});

app.post('/api/queues/:vhost/:name', (req, res) => {
  const { vhost, name } = req.params;
  const { durable = true, auto_delete = false } = req.body;

  if (mockQueues.has(name)) {
    return res.status(409).json({ error: 'Queue already exists' });
  }

  mockQueues.set(name, {
    name,
    vhost,
    durable,
    auto_delete,
    messages: 0,
    messages_ready: 0,
    messages_unacknowledged: 0,
    consumers: 0,
    state: 'running',
    memory: Math.floor(Math.random() * 1024 * 1024)
  });

  res.status(201).json({ status: 'created' });
});

app.delete('/api/queues/:vhost/:name', (req, res) => {
  const { name } = req.params;
  mockQueues.delete(name);
  res.status(204).send();
});

// Connections endpoints
app.get('/api/connections', (req, res) => {
  res.json(Array.from(mockConnections.values()));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize some mock data
mockQueues.set('default', {
  name: 'default',
  vhost: '/',
  durable: true,
  auto_delete: false,
  messages: 0,
  messages_ready: 0,
  messages_unacknowledged: 0,
  consumers: 0,
  state: 'running',
  memory: 1024 * 1024
});

mockExchanges.set('amq.direct', {
  name: 'amq.direct',
  type: 'direct',
  durable: true,
  auto_delete: false
});

mockConnections.set('connection1', {
  name: 'connection1',
  state: 'running',
  channels: 1,
  received_bytes: 1024,
  sent_bytes: 2048
});

app.listen(port, () => {
  console.log(`Mock RabbitMQ API Server running on port ${port}`);
});