import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { QueueInfo } from '../types/cluster';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (queue: Omit<QueueInfo, 'memory' | 'state'>) => void;
}

export function AddQueueModal({ isOpen, onClose, onAdd }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    messages: 0,
    consumers: 0
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', messages: 0, consumers: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Queue</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Queue Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="my-queue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Initial Messages</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.messages}
              onChange={e => setFormData(prev => ({ ...prev, messages: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Initial Consumers</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.consumers}
              onChange={e => setFormData(prev => ({ ...prev, consumers: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}