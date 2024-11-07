## RabbitWatch - RabbitMQ Management Dashboard

### CORS Configuration

To use RabbitWatch with your RabbitMQ server, you need to enable CORS. Add the following to your rabbitmq.conf:

```conf
management.cors.allow_origins.1 = *
management.cors.max_age = 3600
```

Or if you're using the Docker image, add these environment variables:

```bash
RABBITMQ_MANAGEMENT_CORS_ALLOW_ORIGINS=*
RABBITMQ_MANAGEMENT_CORS_MAX_AGE=3600
```

### Management Port

Make sure your RabbitMQ Management plugin is enabled and the management port (default: 15672) is accessible.