import type { RabbitMQCluster, QueueInfo, ClusterStats, NodeStats } from '../types/cluster';

class MockRabbitMQService {
  private queues: Map<string, QueueInfo[]> = new Map();
  private stats: Map<string, ClusterStats> = new Map();
  private connected: Set<string> = new Set();

  async connect(cluster: RabbitMQCluster): Promise<boolean> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!this.queues.has(cluster.id)) {
      this.queues.set(cluster.id, [
        {
          name: 'default',
          messages: 0,
          consumers: 0,
          state: 'running',
          memory: 1024 * 1024
        }
      ]);
    }

    if (!this.stats.has(cluster.id)) {
      this.stats.set(cluster.id, {
        totalQueues: 1,
        totalConnections: 1,
        publishRate: 0,
        consumeRate: 0
      });
    }

    this.connected.add(cluster.id);
    return true;
  }

  async disconnect(clusterId: string): Promise<void> {
    this.connected.delete(clusterId);
  }

  async getQueues(clusterId: string): Promise<QueueInfo[]> {
    if (!this.connected.has(clusterId)) {
      throw new Error('Not connected to cluster');
    }
    return this.queues.get(clusterId) || [];
  }

  async getClusterStats(clusterId: string): Promise<ClusterStats> {
    if (!this.connected.has(clusterId)) {
      throw new Error('Not connected to cluster');
    }

    const stats = this.stats.get(clusterId) || {
      totalQueues: 0,
      totalConnections: 0,
      publishRate: 0,
      consumeRate: 0
    };

    // Simulate some activity
    return {
      ...stats,
      publishRate: Math.floor(Math.random() * 100),
      consumeRate: Math.floor(Math.random() * 80)
    };
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }

  // Helper method to add a queue
  async addQueue(clusterId: string, queue: QueueInfo): Promise<void> {
    if (!this.connected.has(clusterId)) {
      throw new Error('Not connected to cluster');
    }

    const queues = this.queues.get(clusterId) || [];
    queues.push(queue);
    this.queues.set(clusterId, queues);

    const stats = this.stats.get(clusterId);
    if (stats) {
      stats.totalQueues = queues.length;
      this.stats.set(clusterId, stats);
    }
  }

  // Helper method to remove a queue
  async removeQueue(clusterId: string, queueName: string): Promise<void> {
    if (!this.connected.has(clusterId)) {
      throw new Error('Not connected to cluster');
    }

    const queues = this.queues.get(clusterId) || [];
    const filteredQueues = queues.filter(q => q.name !== queueName);
    this.queues.set(clusterId, filteredQueues);

    const stats = this.stats.get(clusterId);
    if (stats) {
      stats.totalQueues = filteredQueues.length;
      this.stats.set(clusterId, stats);
    }
  }
}

export const mockRabbitMQService = new MockRabbitMQService();