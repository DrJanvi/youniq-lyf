/** Smooth line chart rendered as inline SVG (no chart dependency). */
export function ActivityChart({ points, unit }: { points: { label: string; value: number }[]; unit: string }) {
  const w = 600, h = 200, padX = 24, padY = 20;
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = (w - padX * 2) / Math.max(1, points.length - 1);
  const xy = points.map((p, i) => [padX + i * step, h - padY - (p.value / max) * (h - padY * 2)] as const);
  const path = xy.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = xy[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");
  const peak = points.reduce((a, b, i) => (b.value > points[a].value ? i : a), 0);
  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-2 overflow-hidden">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="block h-auto w-full max-w-full"
        style={{ width: "100%", height: "auto" }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Activity: ${unit} per day`}
      >
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={padX} x2={w - padX} y1={padY + t * (h - padY * 2)} y2={padY + t * (h - padY * 2)} className="stroke-border" strokeWidth="1" />
        ))}
        <path d={path} fill="none" className="stroke-highlight" strokeWidth="4" strokeLinecap="round" />
        <circle cx={xy[peak][0]} cy={xy[peak][1]} r="7" className="fill-highlight stroke-card" strokeWidth="3" />
        <text x={xy[peak][0]} y={Math.max(14, xy[peak][1] - 14)} textAnchor="middle" className="fill-foreground text-[13px] font-semibold">
          {points[peak].value} {unit}
        </text>
      </svg>
      <div className="grid min-w-0 grid-cols-7 gap-1 px-1 text-center text-[11px] text-muted-foreground">
        {points.map((p) => (
          <span key={p.label} className="min-w-0 truncate">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
