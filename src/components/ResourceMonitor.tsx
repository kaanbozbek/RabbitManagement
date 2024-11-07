import React, { useState, useEffect } from 'react';
import { RefreshCw, Cpu, HardDrive, Network } from 'lucide-react';

interface Props {
  clusterId: string;
  onRefresh: () => void;
}

interface ResourceStats {
  cpuUsage: number;
  memoryUsage: number;
  networkIO: {
    bytesIn: number;
    bytesOut: number;
  };
  diskUsage: number;
}

const initialStats: ResourceStats = {
  cpuUsage: 45,
  memoryUsage: 62,
  networkIO: {
    bytesIn: 1024 * 1024 * 50, // 50MB
    bytesOut: 1024 * 1024 * 30, // 30MB
  },
  diskUsage: 75
};

export function ResourceMonitor({ clusterId, onRefresh }: Props) {
  const [stats, setStats] = useState<ResourceStats>(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() * 10 - 5))),
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() * 10 - 5))),
        networkIO: {
          bytesIn: prev.networkIO.bytesIn + Math.random() * 1024 * 1024,
          bytesOut: prev.networkIO.bytesOut + Math.random() * 1024 * 1024
        },
        diskUsage: Math.min(100, Math.max(0, prev.diskUsage + (Math.random() * 5 - 2.5)))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
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
        <h3 className="text-lg font-medium text-gray-900">System Resources</h3>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cpu className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">CPU Usage</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{ width: `${stats.cpuUsage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{stats.cpuUsage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Memory Usage</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2"
                style={{ width: `${stats.memoryUsage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{stats.memoryUsage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Network className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">Network I/O</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">↓ {formatBytes(stats.networkIO.bytesIn)}</div>
            <div className="text-sm text-gray-600">↑ {formatBytes(stats.networkIO.bytesOut)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">Disk Usage</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 rounded-full h-2"
                style={{ width: `${stats.diskUsage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{stats.diskUsage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}