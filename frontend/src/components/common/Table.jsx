import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const Table = ({
  columns,
  data,
  onSort,
  sortColumn,
  sortDirection,
  emptyMessage = 'No data available'
}) => {
  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  // ✅ FIX: ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-gray-200 border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-200 select-none' : ''
                }`}
                onClick={() => handleSort(column)}
                style={{ width: column.width }}
              >
                <div className="flex justify-between items-center">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="ml-2">
                      {sortColumn === column.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-gray-500 text-center">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            safeData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-gray-50 border-gray-200 border-b transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-gray-900 text-sm">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
