import { useState } from "react";
import type { AggModule, ModuleEntry } from "@/lib/parseModules";

interface AggregateProps {
  mode: "aggregate";
  allModules: AggModule[];
  totalStudents: number;
  totalNoCode?: number;
  totalCode?: number;
  trackFilter?: "nocode" | "code" | "all";
}

interface IndividualProps {
  mode: "individual";
  allModules: AggModule[];
  studentEntries: ModuleEntry[];
  trackFilter?: "nocode" | "code" | "all";
}

type Props = AggregateProps | IndividualProps;

const TOTAL_WEEKS = 8;
const AVAILABLE_WEEKS = 3;
const PLACEHOLDER_WEEKS = Array.from(
  { length: TOTAL_WEEKS - AVAILABLE_WEEKS },
  (_, i) => i + AVAILABLE_WEEKS + 1
);

function interpolate(ratio: number): string {
  if (ratio <= 0) return "#e5e7eb";
  const r1 = 229, g1 = 231, b1 = 235;
  const r2 = 237, g2 = 242, b2 = 95;
  return `rgb(${Math.round(r1 + (r2 - r1) * ratio)},${Math.round(g1 + (g2 - g1) * ratio)},${Math.round(b1 + (b2 - b1) * ratio)})`;
}

function WeekColumn({
  week,
  modules,
  onEnter,
  onMove,
  onLeave,
  dotStyle,
  tipText,
}: {
  week: number;
  modules: AggModule[];
  onEnter: (e: React.MouseEvent, m: AggModule) => void;
  onMove: (e: React.MouseEvent) => void;
  onLeave: () => void;
  dotStyle: (m: AggModule) => React.CSSProperties;
  tipText: (m: AggModule) => string;
}) {
  const cols = Math.max(Math.ceil(Math.sqrt(modules.length)), 1);
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold"
        style={{ fontFamily: "'PT Mono', monospace" }}
      >
        Sem {week}
      </span>
      <div
        className="flex flex-wrap gap-[3px]"
        style={{ maxWidth: `${cols * 18}px` }}
      >
        {modules.map((m, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-[3px] cursor-help transition-transform hover:scale-125 hover:z-10"
            style={dotStyle(m)}
            onMouseEnter={(e) => onEnter(e, m)}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          />
        ))}
      </div>
    </div>
  );
}

function PlaceholderWeek({ week }: { week: number }) {
  const [showTip, setShowTip] = useState(false);
  const DOTS = 8;
  return (
    <div
      className="flex flex-col gap-1 relative"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {showTip && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-50 text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
          Próximamente
        </div>
      )}
      <span
        className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold flex items-center gap-0.5"
        style={{ fontFamily: "'PT Mono', monospace" }}
      >
        Sem {week}
        <svg className="w-2 h-2" viewBox="0 0 12 12" fill="currentColor">
          <rect x="2" y="5" width="8" height="7" rx="1.5" />
          <path d="M4 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </svg>
      </span>
      <div className="flex flex-wrap gap-[3px]" style={{ maxWidth: `${3 * 18}px` }}>
        {Array.from({ length: DOTS }).map((_, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-[3px] border border-dashed border-gray-300 bg-gray-50"
          />
        ))}
      </div>
    </div>
  );
}

function TrackRow({
  label,
  trackColor,
  modules,
  props,
  tooltip,
  setTooltip,
}: {
  label: string;
  trackColor: string;
  modules: AggModule[];
  props: Props;
  tooltip: { text: string; x: number; y: number } | null;
  setTooltip: React.Dispatch<React.SetStateAction<{ text: string; x: number; y: number } | null>>;
}) {
  const weeks = [...new Set(modules.map((m) => m.week))].sort((a, b) => a - b);

  const entryMap =
    props.mode === "individual"
      ? new Map(props.studentEntries.map((e) => [`${e.week}::${e.title}`, e]))
      : null;

  function dotStyle(m: AggModule): React.CSSProperties {
    if (props.mode === "aggregate") {
      const total =
        m.track === "code"
          ? (props as AggregateProps).totalCode ?? props.totalStudents
          : (props as AggregateProps).totalNoCode ?? props.totalStudents;
      const rate = total > 0 ? m.completedCount / total : 0;
      return { backgroundColor: interpolate(rate) };
    }
    const entry = entryMap!.get(`${m.week}::${m.title}`);
    if (!entry) return { backgroundColor: "#e5e7eb" };
    if (entry.status === "completed") return { backgroundColor: "#EDF25F" };
    return { backgroundColor: "#A9A0EC" };
  }

  function tipText(m: AggModule): string {
    if (props.mode === "aggregate") {
      const total =
        m.track === "code"
          ? (props as AggregateProps).totalCode ?? props.totalStudents
          : (props as AggregateProps).totalNoCode ?? props.totalStudents;
      const pct = total > 0 ? Math.round((m.completedCount / total) * 100) : 0;
      return `${m.title} · ${pct}% (${m.completedCount}/${total} completaron)`;
    }
    const entry = entryMap!.get(`${m.week}::${m.title}`);
    const status = !entry
      ? "No iniciado"
      : entry.status === "completed"
      ? "Completado ✓"
      : "En progreso";
    return `${m.title} · ${status}`;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ backgroundColor: trackColor }}
        />
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex gap-5 flex-wrap">
        {weeks.map((week) => (
          <WeekColumn
            key={week}
            week={week}
            modules={modules.filter((m) => m.week === week)}
            onEnter={(e, m) => setTooltip({ text: tipText(m), x: e.clientX, y: e.clientY })}
            onMove={(e) => setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))}
            onLeave={() => setTooltip(null)}
            dotStyle={dotStyle}
            tipText={tipText}
          />
        ))}
        {PLACEHOLDER_WEEKS.map((w) => (
          <PlaceholderWeek key={w} week={w} />
        ))}
      </div>
    </div>
  );
}

export default function ModuleHeatmap(props: Props) {
  const { allModules, trackFilter } = { trackFilter: "all" as const, ...props };
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
      const pct = props.totalStudents > 0
        ? Math.round((m.completedCount / props.totalStudents) * 100)
        : 0;
      return `${m.title} · ${pct}% (${m.completedCount}/${props.totalStudents} completaron)`;
    }
    const entry = entryMap!.get(`${m.week}::${m.title}`);
    const label = !entry ? "No iniciado" : entry.status === "completed" ? "Completado ✓" : "En progreso";
    return `${m.title} · ${label}`;
  }

  const showBothTracks = !trackFilter || trackFilter === "all";

  const noCodeModules = allModules.filter(
    (m) => m.track === "nocode" || m.track === "both"
  );
  const codeModules = allModules.filter(
    (m) => m.track === "code" || m.track === "both"
  );
  const filteredSingleTrack = trackFilter === "code" ? codeModules : noCodeModules;

  const legend =
    props.mode === "aggregate" ? (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">0%</span>
        <div className="flex gap-[2px]">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
            <div key={v} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: interpolate(v) }} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">100%</span>
        <span className="ml-2 text-[10px] text-gray-300 flex items-center gap-0.5">
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="5" width="8" height="7" rx="1.5" />
            <path d="M4 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </svg>
          Próximamente
        </span>
      </div>
    ) : (
      <div className="flex items-center gap-3 flex-wrap">
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
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-[2px] border border-dashed border-gray-300 bg-gray-50" />
          <span className="text-[10px] text-gray-400">Próximamente</span>
        </div>
      </div>
    );

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

      {showBothTracks ? (
        <div className="flex flex-col gap-5">
          <TrackRow
            label="No-Code"
            trackColor="#EDF25F"
            modules={noCodeModules}
            props={props}
            tooltip={tooltip}
            setTooltip={setTooltip}
          />
          <div className="border-t border-gray-100" />
          <TrackRow
            label="Código"
            trackColor="#A9A0EC"
            modules={codeModules}
            props={props}
            tooltip={tooltip}
            setTooltip={setTooltip}
          />
        </div>
      ) : (
        <div className="flex gap-5 flex-wrap">
          {weeks.map((week) => {
            const weekModules = filteredSingleTrack.filter((m) => m.week === week);
            return (
              <WeekColumn
                key={week}
                week={week}
                modules={weekModules}
                onEnter={(e, m) => setTooltip({ text: tipText(m), x: e.clientX, y: e.clientY })}
                onMove={(e) => setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))}
                onLeave={() => setTooltip(null)}
                dotStyle={dotStyle}
                tipText={tipText}
              />
            );
          })}
          {PLACEHOLDER_WEEKS.map((w) => (
            <PlaceholderWeek key={w} week={w} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 flex-wrap">{legend}</div>
    </div>
  );
}
