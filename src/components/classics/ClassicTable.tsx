import React from "react";

interface ClassicTableColumn {
  key: string;
  label: string;
  className?: string;
}

interface ClassicTableProps<T> {
  columns: ClassicTableColumn[];
  data: T[];
  renderCell: (item: T, columnKey: string) => React.ReactNode;
  keyField: keyof T;
  className?: string;
}

/**
 * WordPress admin list table using `wp-list-table`, `widefat`, `striped`.
 */
export function ClassicTable<T>({
  columns,
  data,
  renderCell,
  keyField,
  className = "",
}: ClassicTableProps<T>) {
  return (
    <table className={`wp-list-table widefat striped ${className}`}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className={col.className || ""}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>No items found.</td>
          </tr>
        ) : (
          data.map((item) => (
            <tr key={String(item[keyField])}>
              {columns.map((col) => (
                <td key={col.key} className={col.className || ""}>
                  {renderCell(item, col.key)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
