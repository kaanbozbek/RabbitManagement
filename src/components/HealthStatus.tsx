import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { ClusterHealth } from '../types/cluster';

interface Props {
  health: ClusterHealth;
}

export function HealthStatus({ health }: Props) {
  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Health Status</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="capitalize">{health.status}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Response Time</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{health.responseTime}ms</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Version</span>
          <span>{health.version}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Last Check</span>
          <span>{new Date(health.lastCheck).toLocaleString()}</span>
        </div>

        {health.issues && health.issues.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-red-600 mb-2">Issues</h4>
            <ul className="space-y-1">
              {health.issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-600">
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}