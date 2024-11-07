import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface Connection {
  id: string;
  client: string;
  state: 'running' | 'blocked' | 'closed';
  channels: number;
  receivedBytes: number;
  sentBytes: number;
  connectedAt: string;
}

interface Props {
  clusterId: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const mockConnections: Connection[] = [
  {
    id: 'conn_1',
    client: 'application_1',
    state: 'running',
    channels: 5,
    receivedBytes: 1024000,
    sentBytes: 512000,
    connectedAt: new Date().toISOString()
  }
];

export function ConnectionManager({ clusterId, onRefresh, isRefreshing }: Props) {
  const [connections, setConnections] = useState<Connection[]>(mockConnections);

  const handleClose = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Connections</h2>
        <button
          onClick={onRefresh}
          className={`p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Channels
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Connected Since
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Transfer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {connections.map((connection) => (
              <tr key={connection.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {connection.client}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    connection.state === 'running' ? 'bg-green-100 text-green-800' :
                    connection.state === 'blocked' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {connection.state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {connection.channels}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(connection.connectedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>↓ {formatBytes(connection.receivedBytes)}</div>
                  <div>↑ {formatBytes(connection.sentBytes)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleClose(connection.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Close Connection"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {connections.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No active connections
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}