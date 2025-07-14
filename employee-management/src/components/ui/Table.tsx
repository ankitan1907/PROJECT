import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TableColumn<T> {
  title: string;
  field: keyof T | ((row: T) => React.ReactNode);
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyField: keyof T;
  sortColumn?: keyof T | null;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: keyof T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

function Table<T>({
  data,
  columns,
  keyField,
  sortColumn,
  sortDirection,
  onSort,
  isLoading = false,
  emptyMessage = 'No data available',
  actions,
}: TableProps<T>) {
  const renderHeader = (column: TableColumn<T>) => {
    const isFieldSortable = column.sortable && typeof column.field === 'string';
    const isCurrentSortColumn = sortColumn === column.field;

    return (
      <th
        key={column.title}
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
          isFieldSortable ? 'cursor-pointer hover:bg-gray-50' : ''
        }`}
        onClick={() => {
          if (isFieldSortable && onSort && typeof column.field === 'string') {
            onSort(column.field);
          }
        }}
      >
        <div className="flex items-center space-x-1">
          <span>{column.title}</span>
          {isFieldSortable && isCurrentSortColumn && (
            <>
              {sortDirection === 'asc' ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </>
          )}
        </div>
      </th>
    );
  };

  const renderCell = (row: T, column: TableColumn<T>) => {
    const key = column.field;
    let value;
    
    if (typeof key === 'function') {
      value = key(row);
    } else {
      value = row[key];
    }

    return column.render ? column.render(value, row) : value;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white overflow-hidden rounded-lg shadow-card">
        <div className="p-8 flex justify-center items-center">
          <div className="animate-pulse flex flex-col space-y-4 w-full">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white overflow-hidden rounded-lg shadow-card">
        <div className="p-8 flex justify-center items-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white overflow-hidden rounded-lg shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(renderHeader)}
              {actions && <th className="px-6 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr 
                key={String(row[keyField])}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column, index) => (
                  <td 
                    key={`${String(row[keyField])}-${index}`} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;