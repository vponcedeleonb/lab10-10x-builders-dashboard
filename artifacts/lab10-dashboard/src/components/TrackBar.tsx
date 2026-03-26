interface Props {
  codeCount: number;
  noCodeCount: number;
  activeFilter: "code" | "nocode" | null;
  onFilter: (f: "code" | "nocode" | null) => void;
}

export default function TrackBar({ codeCount, noCodeCount, activeFilter, onFilter }: Props) {
  const total = codeCount + noCodeCount;
  const codePercent = total > 0 ? (codeCount / total) * 100 : 50;
  const noCodePercent = 100 - codePercent;

  const handleClick = (track: "code" | "nocode") => {
    onFilter(activeFilter === track ? null : track);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Distribución de Tracks
        </span>
        {activeFilter && (
          <button
            onClick={() => onFilter(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Ver todos
          </button>
        )}
      </div>

      <div className="flex rounded-lg overflow-hidden h-9 w-full border border-border" style={{ cursor: "pointer" }}>
        <button
          onClick={() => handleClick("code")}
          className="flex items-center justify-center gap-2 transition-all duration-300 group"
          style={{
            width: `${codePercent}%`,
            backgroundColor: activeFilter === "nocode"
              ? "#e5e7eb"
              : activeFilter === "code"
              ? "#1d4ed8"
              : "#3b82f6",
            opacity: activeFilter === "nocode" ? 0.4 : 1,
          }}
          title={`Code: ${codeCount} estudiantes — clic para filtrar`}
        >
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: activeFilter === "nocode" ? "#9ca3af" : "white", fontFamily: "'PT Mono', monospace" }}
          >
            Code
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: activeFilter === "nocode" ? "#9ca3af" : "rgba(255,255,255,0.9)", fontFamily: "'PT Mono', monospace" }}
          >
            {codeCount}
          </span>
        </button>

        <button
          onClick={() => handleClick("nocode")}
          className="flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            width: `${noCodePercent}%`,
            backgroundColor: activeFilter === "code"
              ? "#e5e7eb"
              : activeFilter === "nocode"
              ? "#7c3aed"
              : "#8b5cf6",
            opacity: activeFilter === "code" ? 0.4 : 1,
          }}
          title={`No-Code: ${noCodeCount} estudiantes — clic para filtrar`}
        >
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: activeFilter === "code" ? "#9ca3af" : "white", fontFamily: "'PT Mono', monospace" }}
          >
            No-Code
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: activeFilter === "code" ? "#9ca3af" : "rgba(255,255,255,0.9)", fontFamily: "'PT Mono', monospace" }}
          >
            {noCodeCount}
          </span>
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground mt-1">
        {activeFilter
          ? `Mostrando solo estudiantes de ${activeFilter === "code" ? "Code" : "No-Code"} · Haz clic en el mismo segmento para quitar el filtro`
          : "Haz clic en un segmento para filtrar el dashboard"}
      </p>
    </div>
  );
}
