export function TableSkeleton({rows = 6, cols = 6}: {rows?: number; cols?: number}) {
  return (
    <div className="w-full overflow-hidden">
      <div className="divide-y divide-slate-100">
        {Array.from({length: rows}).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
            {Array.from({length: cols}).map((__, cIdx) => (
              <div
                key={cIdx}
                className={`h-3.5 rounded bg-slate-100 ${cIdx === 1 ? 'w-36' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
