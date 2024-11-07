import React from 'react';
import { Rabbit } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Rabbit className="w-8 h-8 text-blue-600" />
        {/* Glasses */}
        <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center">
            <div className="w-2 h-2 border-2 border-gray-800 rounded-full bg-transparent"></div>
            <div className="w-1 h-0.5 bg-gray-800"></div>
            <div className="w-2 h-2 border-2 border-gray-800 rounded-full bg-transparent"></div>
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </div>
      <span className="text-xl font-bold text-gray-900">RabbitWatch</span>
    </div>
  );
}