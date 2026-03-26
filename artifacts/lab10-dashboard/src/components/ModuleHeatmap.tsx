import { useState } from "react";
import type { AggModule, ModuleEntry } from "@/lib/parseModules";
import { X } from "lucide-react";

export interface StudentInfo {
  displayName: string;
  completionRate: number;
  track: "nocode" | "code";
}

interface AggregateProps {
  mode: "aggregate";
  allModules: AggModule[];
  totalStudents: number;
  totalNoCode?: number;
  totalCode?: number;
  trackFilter?: "nocode" | "code" | "all";
  studentInfoMap?: Map<string, StudentInfo>;
}

interface IndividualProps {
  mode: "individual";
  allModules: AggModule[];
  studentEntries: ModuleEntry[];
  trackFilter?: "nocode" | "code" | "all";
}

type Props = AggregateProps | IndividualProps;

interface ModalModule {
  module: AggModule;
  totalForTrack: number;
}

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

const STATUS_CONFIG = {
  completed:   { color: "#EDF25F", label: "Completado",  border: "#d4dc00" },
  in_progress: { color: "#A9A0EC", label: "En progreso", border: "#7c72d8" },
  not_started: { color: "#e5e7eb", label: "No iniciado", border: "#d1d5db" },
} as const;

function ModuleModal({
  data,
  studentInfoMap,
  onClose,
}: {
  data: ModalModule;
  studentInfoMap: Map<string, StudentInfo>;
  onClose: () => void;
}) {
  const { module, totalForTrack } = data;
  const completedSet = new Set(module.completedEmails);
  const inProgressSet = new Set(module.inProgressEmails);

  const trackStudents = [...studentInfoMap.entries()].filter(
    ([, info]) => info.track === module.track
  );

  const rows = trackStudents
    .map(([email, info]) => {
      const status: keyof typeof STATUS_CONFIG = completedSet.has(email)
        ? "completed"
        : inProgressSet.has(email)
        ? "in_progress"
        : "not_started";
      return { email, displayName: info.displayName, status };
    })
    .sort((a, b) => {
      const order = { completed: 0, in_progress: 1, not_started: 2 };
      return order[a.status] - order[b.status] || a.displayName.localeCompare(b.displayName);
    });

  const completedPct = totalForTrack > 0 ? Math.round((module.completedCount / totalForTrack) * 100) : 0;
  const trackLabel = module.track === "code" ? "Code" : "No-Code";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
              {trackLabel} · Sem {module.week}
            </p>
            <h3 className="text-sm font-bold text-gray-900 leading-snug pr-4">{module.title}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {module.completedCount}/{totalForTrack} completaron · {completedPct}%
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ul className="overflow-y-auto max-h-72 divide-y divide-gray-50 px-1 py-1">
          {rows.map(({ email, displayName, status }) => {
            const cfg = STATUS_CONFIG[status];
            return (
              <li key={email} className="flex items-center gap-3 px-4 py-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 border"
                  style={{ backgroundColor: cfg.color, borderColor: cfg.border }}
                />
                <span className="flex-1 text-sm text-gray-800 truncate">{displayName}</span>
                <span
                  className="text-[11px] font-medium shrink-0"
                  style={{ color: status === "not_started" ? "#9ca3af" : cfg.border }}
                >
                  {cfg.label}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4">
          {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map((key) => {
            const cfg = STATUS_CONFIG[key];
            return (
              <div key={key} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full border" style={{ backgroundColor: cfg.color, borderColor: cfg.border }} />
                <span className="text-[10px] text-gray-400">{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekColumn({
  week,
  modules,
  onEnter,
  onMove,
  onLeave,
  onClick,
  dotStyle,
  tipText,
}: {
  week: number;
  modules: AggModule[];
  onEnter: (e: React.MouseEvent, m: AggModule) => void;
  onMove: (e: React.MouseEvent) => void;
  onLeave: () => void;
  onClick?: (m: AggModule) => void;
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
            className={`w-3.5 h-3.5 rounded-[3px] transition-transform hover:scale-125 hover:z-10 ${onClick ? "cursor-pointer" : "cursor-help"}`}
            style={dotStyle(m)}
            onMouseEnter={(e) => onEnter(e, m)}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onClick={() => onClick?.(m)}
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
  setTooltip,
  onDotClick,
}: {
  label: string;
  trackColor: string;
  modules: AggModule[];
  props: Props;
  setTooltip: React.Dispatch<React.SetStateAction<{ text: string; x: number; y: number } | null>>;
  onDotClick?: (m: AggModule, trackTotal: number) => void;
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
      return `${m.title} · ${pct}% · clic para ver estudiantes`;
    }
    const entry = entryMap!.get(`${m.week}::${m.title}`);
    const status = !entry ? "No iniciado" : entry.status === "completed" ? "Completado ✓" : "En progreso";
    return `${m.title} · ${status}`;
  }

  function getTrackTotal(m: AggModule): number {
    if (props.mode !== "aggregate") return 0;
    return m.track === "code"
      ? (props as AggregateProps).totalCode ?? props.totalStudents
      : (props as AggregateProps).totalNoCode ?? props.totalStudents;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: trackColor }} />
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
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
            onClick={onDotClick ? (m) => onDotClick(m, getTrackTotal(m)) : undefined}
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
  const [modalData, setModalData] = useState<ModalModule | null>(null);

  const studentInfoMap = props.mode === "aggregate" ? props.studentInfoMap : undefined;

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
      const pct = props.totalStudents > 0 ? Math.round((m.completedCount / props.totalStudents) * 100) : 0;
      return `${m.title} · ${pct}% · clic para ver estudiantes`;
    }
    const entry = entryMap!.get(`${m.week}::${m.title}`);
    const label = !entry ? "No iniciado" : entry.status === "completed" ? "Completado ✓" : "En progreso";
    return `${m.title} · ${label}`;
  }

  const showBothTracks = !trackFilter || trackFilter === "all";

  const noCodeModules = allModules.filter((m) => m.track === "nocode");
  const codeModules = allModules.filter((m) => m.track === "code");
  const filteredSingleTrack = trackFilter === "code" ? codeModules : noCodeModules;

  function handleDotClick(m: AggModule, totalForTrack: number) {
    if (props.mode !== "aggregate" || !studentInfoMap) return;
    setTooltip(null);
    setModalData({ module: m, totalForTrack });
  }

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
        {studentInfoMap && (
          <span className="ml-2 text-[10px] text-gray-400">· clic en cada cuadro para ver el detalle</span>
        )}
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
          className="fixed z-[9998] text-xs bg-gray-900 text-white px-2 py-1 rounded pointer-events-none whitespace-nowrap shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 36 }}
        >
          {tooltip.text}
        </div>
      )}

      {modalData && studentInfoMap && (
        <ModuleModal
          data={modalData}
          studentInfoMap={studentInfoMap}
          onClose={() => setModalData(null)}
        />
      )}

      {showBothTracks ? (
        <div className="flex flex-col gap-5">
          <TrackRow
            label="No-Code"
            trackColor="#EDF25F"
            modules={noCodeModules}
            props={props}
            setTooltip={setTooltip}
            onDotClick={props.mode === "aggregate" && studentInfoMap ? handleDotClick : undefined}
          />
          <div className="border-t border-gray-100" />
          <TrackRow
            label="Código"
            trackColor="#A9A0EC"
            modules={codeModules}
            props={props}
            setTooltip={setTooltip}
            onDotClick={props.mode === "aggregate" && studentInfoMap ? handleDotClick : undefined}
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
                onClick={
                  props.mode === "aggregate" && studentInfoMap
                    ? (m) => handleDotClick(m, trackFilter === "code"
                        ? ((props as AggregateProps).totalCode ?? props.totalStudents)
                        : ((props as AggregateProps).totalNoCode ?? props.totalStudents))
                    : undefined
                }
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
