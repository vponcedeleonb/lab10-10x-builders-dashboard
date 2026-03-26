import { useState } from "react";
import type { AggModule, ModuleEntry } from "@/lib/parseModules";

interface AggregateProps {
  mode: "aggregate";
  allModules: AggModule[];
  totalStudents: number;
}

interface IndividualProps {
  mode: "individual";
  allModules: AggModule[];
  studentEntries: ModuleEntry[];
}

type Props = AggregateProps | IndividualProps;

function interpolate(ratio: number): string {
  if (ratio <= 0) return "#e5e7eb";
  const r1 = 229, g1 = 231, b1 = 235;
  const r2 = 237, g2 = 242, b2 = 95;
  return `rgb(${Math.round(r1 + (r2 - r1) * ratio)},${Math.round(g1 + (g2 - g1) * ratio)},${Math.round(b1 + (b2 - b1) * ratio)})`;
}

export default function ModuleHeatmap(props: Props) {
  const { allModules } = props;
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const entryMap =
    props.mode === "individual"
      ? new Map(props.studentEntries.map((e) => [`${e.week}::${e.title}`, e]))
      : null;

  const weeks = [...new Set(allModules.map((m) => m.week))].sort((a, b) => a - b);

  function dotStyle(m: AggModule): React.CSSProperties {
    if (props.mode === "aggregate") {
      const rate = props.totalStudents > 0 ? m.completedCount / props.totalStudents : 0;
      return { backgroundColor: interpolate(rate) };
    }
    const entry = entryMap!.get(`${m.week}::${m.title}`);
    if (!entry) return { backgroundColor: "#e5e7eb" };
    if (entry.status === "completed") return { backgroundColor: "#EDF25F" };
    return { backgroundColor: "#A9A0EC" };
  }

  function tipText(m: AggModule): string {
    if (props.mode === "aggregate") {
      const pct =
        props.totalStudents > 0
          ? Math.round((m.completedCount / props.totalStudents) * 100)
          : 0;
      return `${m.title} · ${pct}% (${m.completedCount}/${props.totalStudents} completaron)`;
    }
    const entry = entryMap!.get(`${m.week}::${m.title}`);
    const label = !entry
      ? "No iniciado"
      : entry.status === "completed"
      ? "Completado ✓"
      : "En progreso";
    return `${m.title} · ${label}`;
  }

  return (
    <div className="relative">
      {tooltip && (
        <div
          className="fixed z-[9999] text-xs bg-gray-900 text-white px-2 py-1 rounded pointer-events-none whitespace-nowrap shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 36 }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="flex gap-5 flex-wrap">
        {weeks.map((week) => {
          const weekModules = allModules.filter((m) => m.week === week);
          return (
            <div key={week} className="flex flex-col gap-1.5">
              <span
                className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold"
                style={{ fontFamily: "'PT Mono', monospace" }}
              >
                Sem {week}
              </span>
              <div className="flex flex-wrap gap-[3px]" style={{ maxWidth: `${Math.ceil(Math.sqrt(weekModules.length)) * 18}px` }}>
                {weekModules.map((m, i) => (
                  <div
                    key={i}
                    className="w-3.5 h-3.5 rounded-[3px] cursor-help transition-transform hover:scale-125 hover:z-10"
                    style={dotStyle(m)}
                    onMouseEnter={(e) =>
                      setTooltip({ text: tipText(m), x: e.clientX, y: e.clientY })
                    }
                    onMouseMove={(e) =>
                      setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
                    }
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {props.mode === "aggregate" ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">0%</span>
            <div className="flex gap-[2px]">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
                <div
                  key={v}
                  className="w-3 h-3 rounded-[2px]"
                  style={{ backgroundColor: interpolate(v) }}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">100%</span>
          </div>
        ) : (
          <>
            {[
              { color: "#EDF25F", label: "Completado" },
              { color: "#A9A0EC", label: "En progreso" },
              { color: "#e5e7eb", label: "No iniciado" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
