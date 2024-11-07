import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { RabbitMQCluster } from '../types/cluster';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cluster: Omit<RabbitMQCluster, 'id'>) => void;
}

export function AddClusterModal({ isOpen, onClose, onAdd }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '5672', // Changed to string to avoid NaN warning
    username: '',
    password: '',
    vhost: '/'
  });

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form data
    if (!formData.name.trim()) {
      setError('Cluster name is required');
      return;
    }
    if (!formData.host.trim()) {
      setError('Host is required');
      return;
    }
    if (!formData.port || isNaN(Number(formData.port))) {
      setError('Valid port number is required');
      return;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    onAdd({
      name: formData.name.trim(),
      host: formData.host.trim(),
      port: parseInt(formData.port, 10),
      username: formData.username.trim(),
      password: formData.password.trim(),
      vhost: formData.vhost.trim() || '/'
    });

    // Reset form
    setFormData({
      name: '',
      host: '',
      port: '5672',
      username: '',
      password: '',
      vhost: '/'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Cluster</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Cluster Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Production Cluster"
            />
          </div>

          <div>
            <label htmlFor="host" className="block text-sm font-medium text-gray-700">
              Host
            </label>
            <input
              id="host"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.host}
              onChange={e => setFormData(prev => ({ ...prev, host: e.target.value }))}
              placeholder="rabbitmq.example.com"
            />
          </div>

          <div>
            <label htmlFor="port" className="block text-sm font-medium text-gray-700">
              Port
            </label>
            <input
              id="port"
              type="text"
              required
              pattern="[0-9]*"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.port}
              onChange={e => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setFormData(prev => ({ ...prev, port: value }));
              }}
              placeholder="5672"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.username}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="vhost" className="block text-sm font-medium text-gray-700">
              Virtual Host
            </label>
            <input
              id="vhost"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.vhost}
              onChange={e => setFormData(prev => ({ ...prev, vhost: e.target.value }))}
              placeholder="/"
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
              Add Cluster
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}