import React from 'react';
import { TableSkeleton } from './Skeleton';

const Table = ({ 
  columns, 
  data, 
  isLoading = false, 
  loadingRows = 5,
  emptyState = null,
  onRowClick,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-border animate-fade-in ${className}`}>
        <div className="p-6">
          <TableSkeleton rows={loadingRows} columns={columns.length} />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-border flex items-center justify-center p-8 animate-fade-in ${className}`}>
        {emptyState || <p className="text-surface-500">No data available.</p>}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-border overflow-hidden animate-fade-in ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border relative">
          <thead className="bg-surface-50">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={col.key || index} 
                  scope="col" 
                  className={`px-6 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                    ${col.stickyRight ? 'sticky right-0 bg-surface-50 border-l border-border z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.02)]' : ''}
                  `}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || row._id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`group transition-colors duration-200 ${onRowClick ? 'cursor-pointer hover:bg-primary-50/30' : 'hover:bg-surface-50/50'}`}
              >
                {columns.map((col, colIndex) => {
                  const content = col.render ? col.render(row, rowIndex) : row[col.key];
                  return (
                    <td 
                      key={`${rowIndex}-${col.key || colIndex}`} 
                      className={`px-6 py-4 text-sm text-surface-700
                        ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                        ${col.stickyRight ? 'sticky right-0 bg-white group-hover:bg-surface-50/50 border-l border-border transition-colors duration-200 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.02)]' : ''}
                      `}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
