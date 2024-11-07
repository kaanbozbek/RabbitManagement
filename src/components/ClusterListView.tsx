import React from 'react';
import { Activity, MessageSquare, Users } from 'lucide-react';
import type { RabbitMQCluster, ClusterStats } from '../types/cluster';

interface Props {
  clusters: RabbitMQCluster[];
  stats: Record<string, ClusterStats>;
  onSelect: (cluster: RabbitMQCluster) => void;
  selectedClusterId?: string;
}

export function ClusterListView({ clusters, stats, onSelect, selectedClusterId }: Props) {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cluster
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Queues
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Connections
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message Rate
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clusters.map((cluster) => (
            <tr
              key={cluster.id}
              onClick={() => onSelect(cluster)}
              className={`cursor-pointer hover:bg-gray-50 ${
                selectedClusterId === cluster.id ? 'bg-blue-50' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{cluster.name}</div>
                  <div className="text-sm text-gray-500">{cluster.host}:{cluster.port}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  cluster.health?.status === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : cluster.health?.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cluster.health?.status || 'unknown'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                  {stats[cluster.id]?.totalQueues || 0}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  {stats[cluster.id]?.totalConnections || 0}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-gray-400" />
                  {stats[cluster.id]?.publishRate || 0}/s
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}