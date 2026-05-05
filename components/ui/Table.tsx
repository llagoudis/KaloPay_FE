import { cn } from "@/lib/utils/cn";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  /** Applied to the inner <table> so full table can force horizontal scroll */
  tableClassName?: string;
  /** If false, no outer border on the scroll wrapper; body rows use transparent bg (for dark dashboards). */
  bordered?: boolean;
  /**
   * When true, rule under header + horizontal dividers between body rows (admin-table-row-dividers).
   * Default false: no row lines (clean layout like Documents tab).
   */
  rowDividers?: boolean;
  /** When false, body rows do not change background on hover (overrides dashboard table hover CSS). */
  rowHover?: boolean;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
  className,
  tableClassName,
  bordered = true,
  rowDividers = false,
  rowHover = true,
}: TableProps<T>) {
  const bodyRowClass = rowDividers
    ? cn(
        "bg-transparent transition-colors",
        rowHover && "hover:bg-gray-50/90 table-dark-row-hover"
      )
    : cn(
        "transition-colors",
        bordered ? "bg-white table-dark-row" : "bg-transparent table-dark-row",
        rowHover && (bordered ? "hover:bg-gray-50 table-dark-row-hover" : "hover:bg-white/[0.06] table-dark-row-hover")
      );

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg",
        bordered && "border border-gray-200 table-dark-container",
        className
      )}
    >
      <table className={cn("w-full min-w-max border-collapse text-sm text-left text-gray-700", tableClassName)}>
        <thead className="bg-transparent text-xs font-medium text-gray-500">
          <tr className={cn(rowDividers && "border-b border-gray-200")}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn("px-4 py-3 font-medium", col.headerClassName ?? col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(rowDividers && "admin-table-row-dividers")}>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-gray-400">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className={bodyRowClass}>
                {columns.map((col) => (
                  <td key={String(col.key)} className={cn("px-4 py-3", col.className)}>
                    {col.render
                      ? col.render(row[col.key as keyof T], row)
                      : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}