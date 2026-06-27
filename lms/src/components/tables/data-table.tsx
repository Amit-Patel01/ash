type Row = Record<string, string | number>;

export function DataTable({ rows }: { rows: Row[] }) {
  const columns = Object.keys(rows[0] ?? {});

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr className="border-t border-border" key={index}>
                {columns.map((column) => (
                  <td className="px-4 py-3" key={column}>
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
