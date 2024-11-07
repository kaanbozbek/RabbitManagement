import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userData: {
    username: string;
    password: string;
    tags: string[];
    permissions: {
      configure: string;
      write: string;
      read: string;
      vhost?: string;
    };
  }) => void;
}

const RABBITMQ_TAGS = [
  {
    value: 'administrator',
    label: 'Administrator',
    description: 'Full access to all features'
  },
  {
    value: 'monitoring',
    label: 'Monitoring',
    description: 'View-only access to all resources'
  },
  {
    value: 'policymaker',
    label: 'Policy Maker',
    description: 'Manage policies and parameters'
  },
  {
    value: 'management',
    label: 'Management',
    description: 'User management without policy changes'
  },
  {
    value: 'impersonator',
    label: 'Impersonator',
    description: 'Impersonate other users'
  }
];

const PERMISSION_PRESETS = {
  full: { configure: '.*', write: '.*', read: '.*' },
  readOnly: { configure: '^$', write: '^$', read: '.*' },
  writeOnly: { configure: '^$', write: '.*', read: '^$' },
  custom: { configure: '', write: '', read: '' }
};

export function AddUserModal({ isOpen, onClose, onAdd }: Props) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    tags: ['monitoring'],
    permissions: PERMISSION_PRESETS.readOnly,
    vhost: '/'
  });

  const [permissionPreset, setPermissionPreset] = useState('readOnly');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      username: formData.username,
      password: formData.password,
      tags: formData.tags,
      permissions: {
        ...formData.permissions,
        vhost: formData.vhost
      }
    });
    setFormData({
      username: '',
      password: '',
      tags: ['monitoring'],
      permissions: PERMISSION_PRESETS.readOnly,
      vhost: '/'
    });
  };

  const handlePermissionPresetChange = (preset: keyof typeof PERMISSION_PRESETS) => {
    setPermissionPreset(preset);
    setFormData(prev => ({
      ...prev,
      permissions: PERMISSION_PRESETS[preset]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.username}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Virtual Host</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.vhost}
              onChange={e => setFormData(prev => ({ ...prev, vhost: e.target.value }))}
              placeholder="/"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Tags</label>
            <div className="space-y-2">
              {RABBITMQ_TAGS.map(tag => (
                <div key={tag.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tag-${tag.value}`}
                    checked={formData.tags.includes(tag.value)}
                    onChange={e => {
                      const newTags = e.target.checked
                        ? [...formData.tags, tag.value]
                        : formData.tags.filter(t => t !== tag.value);
                      setFormData(prev => ({ ...prev, tags: newTags }));
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`tag-${tag.value}`} className="ml-2 flex items-center">
                    <span className="text-sm text-gray-700">{tag.label}</span>
                    <HelpCircle className="w-4 h-4 ml-1 text-gray-400" title={tag.description} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permission Preset</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={permissionPreset}
              onChange={e => handlePermissionPresetChange(e.target.value as keyof typeof PERMISSION_PRESETS)}
            >
              <option value="readOnly">Read Only</option>
              <option value="writeOnly">Write Only</option>
              <option value="full">Full Access</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {permissionPreset === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Configure Permission (regex)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.permissions.configure}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    permissions: { ...prev.permissions, configure: e.target.value }
                  }))}
                  placeholder="^$"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Write Permission (regex)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.permissions.write}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    permissions: { ...prev.permissions, write: e.target.value }
                  }))}
                  placeholder="^$"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Read Permission (regex)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.permissions.read}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    permissions: { ...prev.permissions, read: e.target.value }
                  }))}
                  placeholder=".*"
                />
              </div>
            </div>
          )}

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
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}