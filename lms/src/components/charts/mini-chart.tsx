export function MiniChart({ bars = [35, 45, 30, 60, 75, 55, 70, 90, 80, 85, 95, 100] }: { bars?: number[] }) {
  return (
    <div className="flex h-36 items-end gap-2 rounded-lg border border-border bg-card p-4">
      {bars.length > 0 ? (
        bars.map((value, index) => (
          <div
            aria-label={`Month ${index + 1}: ${value}%`}
            className="flex-1 rounded-t-md bg-teal-600 dark:bg-teal-500 hover:bg-teal-500 dark:hover:bg-teal-400 transition-all duration-300 cursor-pointer"
            key={index}
            style={{ height: `${value}%` }}
          />
        ))
      ) : (
        <div className="w-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
      )}
    </div>
  );
}
