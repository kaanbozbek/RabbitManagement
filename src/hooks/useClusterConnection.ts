import { useState, useEffect } from 'react';
import { rabbitMQService } from '../services/rabbitmq';
import type { RabbitMQCluster, ClusterHealth } from '../types/cluster';

export function useClusterConnection(cluster: RabbitMQCluster | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<ClusterHealth>('unknown');

  useEffect(() => {
    if (!cluster) {
      setIsConnected(false);
      setError(null);
      return;
    }

    const connectToCluster = async () => {
      try {
        setIsConnecting(true);
        setError(null);
        const connected = await rabbitMQService.connect(cluster);
        setIsConnected(connected);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to cluster');
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToCluster();

    return () => {
      if (cluster.id) {
        rabbitMQService.disconnect(cluster.id);
      }
    };
  }, [cluster]);

  return {
    isConnected,
    isConnecting,
    error,
    health
  };
}