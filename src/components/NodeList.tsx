import React from 'react';
import { Server, Activity, Memory, HardDrive } from 'lucide-react';
import type { Node } from '../types/cluster';

interface Props {
  nodes: Node[];
  onSelect?: (node: Node) => void;
}

export function NodeList({ nodes, onSelect }: Props) {
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Cluster Nodes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nodes.map((node) => (
          <div
            key={node.name}
            onClick={() => onSelect?.(node)}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Server className={`w-6 h-6 ${node.running ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <h3 className="font-medium text-gray-900">{node.name}</h3>
                <p className="text-sm text-gray-500">{node.type} node</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">CPU Usage</span>
                </div>
                <span className="text-sm font-medium">{node.metrics.cpuUsage.toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Memory className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Memory</span>
                </div>
                <span className="text-sm font-medium">{formatMemory(node.metrics.memoryUsage)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Disk Free</span>
                </div>
                <span className="text-sm font-medium">{formatMemory(node.metrics.diskFree)}</span>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">{formatUptime(node.uptime)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Erlang Processes</span>
                  <span className="font-medium">{node.metrics.erlangProcesses}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}