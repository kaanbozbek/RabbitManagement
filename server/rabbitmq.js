import express from 'express';
import cors from 'cors';
import amqp from 'amqplib';
import logger from './logger.js';

const app = express();
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const MANAGEMENT_PORT = process.env.RABBITMQ_MANAGEMENT_PORT || 15672;
const RABBITMQ_USER = process.env.RABBITMQ_DEFAULT_USER || 'guest';
const RABBITMQ_PASS = process.env.RABBITMQ_DEFAULT_PASS || 'guest';

app.use(cors());
app.use(express.json());

let connection = null;
let channel = null;

async function setupRabbitMQ() {
  try {
    logger.info('Initializing RabbitMQ connection', {
      host: 'localhost',
      port: RABBITMQ_PORT,
      user: RABBITMQ_USER,
      managementPort: MANAGEMENT_PORT
    });

    // Connect to RabbitMQ using environment variables
    connection = await amqp.connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@localhost:${RABBITMQ_PORT}`);
    logger.info('Successfully connected to RabbitMQ');

    channel = await connection.createChannel();
    logger.info('Successfully created RabbitMQ channel');

    // Enable management plugin
    await channel.assertExchange('amq.management', 'direct', { durable: true });
    logger.info('Management plugin exchange asserted');

    logger.info('RabbitMQ server and management plugin started successfully', {
      amqpPort: RABBITMQ_PORT,
      managementPort: MANAGEMENT_PORT,
      credentials: `${RABBITMQ_USER}/${RABBITMQ_PASS}`
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      try {
        logger.info('Received SIGINT signal, initiating graceful shutdown');
        
        if (channel) {
          await channel.close();
          logger.info('Successfully closed RabbitMQ channel');
        }
        
        if (connection) {
          await connection.close();
          logger.info('Successfully closed RabbitMQ connection');
        }
      } catch (err) {
        logger.error('Error during graceful shutdown:', err);
      }
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to setup RabbitMQ:', error);
    process.exit(1);
  }
}

// Middleware to log all requests
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip
  });
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Express error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const server = app.listen(3000, async () => {
  logger.info('RabbitMQ setup server running on port 3000');
  await setupRabbitMQ();
});