import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import type { RabbitMQCluster } from '../types/cluster';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clusters: RabbitMQCluster[];
  onDeleteCluster: (clusterId: string) => void;
}

export function SettingsModal({ isOpen, onClose, clusters, onDeleteCluster }: Props) {
  const [clusterToDelete, setClusterToDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeleteConfirm = (clusterId: string) => {
    onDeleteCluster(clusterId);
    setClusterToDelete(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Clusters</h3>
            <div className="border rounded-lg divide-y">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="p-4">
                  {clusterToDelete === cluster.id ? (
                    <div className="flex items-center justify-between bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-600">Delete {cluster.name}?</p>
                          <p className="text-sm text-red-500">This action cannot be undone.</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDeleteConfirm(cluster.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setClusterToDelete(null)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{cluster.name}</h4>
                        <p className="text-sm text-gray-500">
                          {cluster.host}:{cluster.port} ({cluster.username})
                        </p>
                      </div>
                      <button
                        onClick={() => setClusterToDelete(cluster.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-Refresh</h3>
            <div className="flex items-center space-x-4">
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                defaultValue="30"
              >
                <option value="0">Disabled</option>
                <option value="10">Every 10 seconds</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every minute</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}