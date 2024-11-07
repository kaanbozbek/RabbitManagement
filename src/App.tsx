import React, { useState, useEffect } from 'react';
import { Rabbit, Plus, Search } from 'lucide-react';
import { ClusterCard } from './components/ClusterCard';
import { QueueList } from './components/QueueList';
import { AddClusterModal } from './components/AddClusterModal';
import { LogViewer } from './components/LogViewer';
import { ResourceMonitor } from './components/ResourceMonitor';
import { ConnectionManager } from './components/ConnectionManager';
import { UserManager } from './components/UserManager';
import { rabbitMQService } from './services/rabbitmq';
import type { RabbitMQCluster, ClusterStats } from './types/cluster';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  const [clusters, setClusters] = useLocalStorage<RabbitMQCluster[]>('rabbitwatch_clusters', []);
  const [selectedCluster, setSelectedCluster] = useState<RabbitMQCluster | null>(null);
  const [clusterStats, setClusterStats] = useState<Record<string, ClusterStats>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const stats: Record<string, ClusterStats> = {};
      for (const cluster of clusters) {
        try {
          const connected = await rabbitMQService.connect(cluster);
          if (connected) {
            stats[cluster.id] = await rabbitMQService.getClusterStats(cluster.id);
          }
        } catch (err) {
          console.error('Failed to connect to cluster:', err);
          stats[cluster.id] = {
            totalQueues: 0,
            totalConnections: 0,
            publishRate: 0,
            consumeRate: 0
          };
        }
      }
      setClusterStats(stats);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [clusters]);

  const handleAddCluster = async (newCluster: Omit<RabbitMQCluster, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cluster: RabbitMQCluster = {
        ...newCluster,
        id: crypto.randomUUID()
      };

      const connected = await rabbitMQService.connect(cluster);
      if (!connected) {
        throw new Error('Failed to connect to cluster');
      }

      setClusters(prev => [...prev, cluster]);
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add cluster');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCluster = async (clusterId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await rabbitMQService.disconnect(clusterId);
      setClusters(prev => prev.filter(cluster => cluster.id !== clusterId));
      if (selectedCluster?.id === clusterId) {
        setSelectedCluster(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete cluster');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClusters = clusters.filter(cluster => 
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cluster.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Rabbit className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">RabbitWatch</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clusters..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Cluster
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <ErrorBoundary>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredClusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                stats={clusterStats[cluster.id]}
                onSelect={setSelectedCluster}
                onDelete={handleDeleteCluster}
                isSelected={selectedCluster?.id === cluster.id}
              />
            ))}
          </div>

          {selectedCluster && (
            <div className="space-y-8">
              <ResourceMonitor 
                clusterId={selectedCluster.id}
                onRefresh={() => {
                  rabbitMQService.getClusterStats(selectedCluster.id)
                    .then(stats => {
                      setClusterStats(prev => ({
                        ...prev,
                        [selectedCluster.id]: stats
                      }));
                    })
                    .catch(err => {
                      console.error('Failed to refresh stats:', err);
                    });
                }}
              />
              <QueueList clusterId={selectedCluster.id} />
              <ConnectionManager clusterId={selectedCluster.id} />
              <UserManager clusterId={selectedCluster.id} />
              <LogViewer clusterId={selectedCluster.id} />
            </div>
          )}
        </ErrorBoundary>
      </main>

      <AddClusterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCluster}
      />
    </div>
  );
}