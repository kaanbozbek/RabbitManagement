import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Plus } from 'lucide-react';
import { mockRabbitMQService as rabbitMQService } from '../services/mock-rabbitmq';
import { AddQueueModal } from './AddQueueModal';
import type { QueueInfo } from '../types/cluster';

interface Props {
  clusterId: string;
}

export function QueueList({ clusterId }: Props) {
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueues = async () => {
    try {
      setError(null);
      setIsRefreshing(true);
      const fetchedQueues = await rabbitMQService.getQueues(clusterId);
      setQueues(fetchedQueues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch queues');
      setQueues([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    // Set up polling interval
    const interval = setInterval(fetchQueues, 30000);
    return () => clearInterval(interval);
  }, [clusterId]);

  const handleDelete = async (queueName: string) => {
    try {
      setError(null);
      await rabbitMQService.removeQueue(clusterId, queueName);
      await fetchQueues();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete queue');
    }
  };

  const handleAddQueue = async (queue: Omit<QueueInfo, 'memory' | 'state'>) => {
    try {
      setError(null);
      await rabbitMQService.addQueue(clusterId, {
        ...queue,
        memory: 0,
        state: 'running'
      });
      await fetchQueues();
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add queue');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Queue List</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Queue
          </button>
          <button
            onClick={fetchQueues}
            className={`p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Queue Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Messages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consumers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Memory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queues.map((queue) => (
              <tr key={queue.name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {queue.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {queue.messages.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {queue.consumers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    queue.state === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {queue.state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(queue.memory / 1024 / 1024).toFixed(2)} MB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDelete(queue.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {queues.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No queues found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddQueueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddQueue}
      />
    </div>
  );
}