import React, { useState } from 'react';
import { AlertCircle, Info, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import type { LogEntry } from '../types/cluster';

interface Props {
  clusterId: string;
  clusterName: string;
}

// Mock log data - In a real app, this would come from your backend
const mockLogs: LogEntry[] = [
  {
    timestamp: new Date(Date.now() - 30000).toISOString(),
    level: 'info',
    component: 'connection',
    message: 'New client connection established'
  },
  {
    timestamp: new Date(Date.now() - 60000).toISOString(),
    level: 'warning',
    component: 'queue',
    message: 'Queue "orders.processing" is reaching memory threshold'
  },
  {
    timestamp: new Date(Date.now() - 90000).toISOString(),
    level: 'error',
    component: 'auth',
    message: 'Failed authentication attempt from IP 192.168.1.100'
  }
];

const LogIcon = ({ level }: { level: LogEntry['level'] }) => {
  switch (level) {
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

export function LogViewer({ clusterId, clusterName }: Props) {
  const [filter, setFilter] = useState<LogEntry['level'] | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleDownload = () => {
    const logText = mockLogs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()} [${log.component}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clusterName.toLowerCase().replace(/\s+/g, '-')}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = mockLogs.filter(
    log => filter === 'all' || log.level === filter
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Cluster Logs</h3>
          <div className="flex items-center space-x-4">
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as LogEntry['level'] | 'all')}
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredLogs.map((log, index) => (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 pt-1">
                <LogIcon level={log.level} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    [{log.component}]
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{log.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}