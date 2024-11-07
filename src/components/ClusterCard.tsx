import React from 'react';
import { Activity, MessageSquare, Users, Database } from 'lucide-react';
import type { RabbitMQCluster, ClusterStats } from '../types/cluster';

interface Props {
  cluster: RabbitMQCluster;
  stats?: ClusterStats;
  onSelect: (cluster: RabbitMQCluster) => void;
  isSelected?: boolean;
}

export function ClusterCard({ cluster, stats, onSelect, isSelected }: Props) {
  const defaultStats: ClusterStats = {
    totalQueues: 0,
    totalConnections: 0,
    publishRate: 0,
    consumeRate: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div 
      onClick={() => onSelect(cluster)}
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{cluster.name}</h3>
        <div className="flex items-center space-x-2">
          <span className={`h-2 w-2 rounded-full ${
            cluster.health?.status === 'healthy' ? 'bg-green-500' :
            cluster.health?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></span>
          <span className="text-sm text-gray-600">
            {cluster.health?.status || 'Unknown'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Queues</p>
            <p className="font-semibold">{currentStats.totalQueues}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm text-gray-600">Connections</p>
            <p className="font-semibold">{currentStats.totalConnections}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm text-gray-600">Publish Rate</p>
            <p className="font-semibold">{currentStats.publishRate}/s</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-sm text-gray-600">Consume Rate</p>
            <p className="font-semibold">{currentStats.consumeRate}/s</p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>{cluster.host}:{cluster.port}</p>
      </div>
    </div>
  );
}