import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

const ClientTable = ({ clients, onView, onEdit, onDelete }) => {
  const { user } = useAuth();
  
  const canEdit = hasPermission(user?.role, PERMISSIONS.EDIT_CLIENT);
  const canDelete = hasPermission(user?.role, PERMISSIONS.DELETE_CLIENT);

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-500">No clients found. Create your first client to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="divide-y divide-gray-200 min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id || client._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900 text-sm">{client.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900 text-sm">{client.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-500 text-sm">{client.company || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-500 text-sm">{client.phone || '-'}</div>
                </td>
                <td className="px-6 py-4 font-medium text-sm text-right whitespace-nowrap">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      onClick={() => onView(client.id || client._id)}
                      className="hover:bg-blue-50 p-1 rounded text-blue-600 hover:text-blue-900 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {canEdit && (
                      <button
                        onClick={() => onEdit(client)}
                        className="hover:bg-rose-50 p-1 rounded text-rose-600 hover:text-rose-900 transition-colors"
                        title="Edit client"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    {canDelete && (
                      <button
                        onClick={() => onDelete(client.id || client._id)}
                        className="hover:bg-red-50 p-1 rounded text-red-600 hover:text-red-900 transition-colors"
                        title="Delete client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientTable;