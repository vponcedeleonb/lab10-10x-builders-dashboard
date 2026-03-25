import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { StudentWithMeta } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface Props {
  students: StudentWithMeta[];
}

export default function AtRiskSection({ students }: Props) {
  const atRisk = students.filter((s) => s.is_at_risk);

  if (atRisk.length === 0) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-6 shadcn-card">
        <h2 className="text-lg font-semibold text-[#EDF25F] mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Estudiantes en Riesgo
        </h2>
        <p className="text-muted-foreground text-sm">Sin estudiantes en riesgo detectados.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-[#f87171]/30 rounded-xl p-6 shadcn-card">
      <h2 className="text-lg font-semibold text-[#f87171] mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Estudiantes en Riesgo ({atRisk.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {atRisk.map((s) => (
          <div
            key={s.email}
            className="bg-background border border-[#f87171]/25 rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground text-sm truncate">{s.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.email}</p>
              </div>
              {s.learning_path && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap shrink-0">
                  {s.learning_path.includes("No-Code") || s.learning_path.includes("No Code") ? "No-Code" : "Code"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {s.risk_reasons.map((reason) => (
                <span
                  key={reason}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20"
                >
                  {reason}
                </span>
              ))}
            </div>
            {s.last_submission_at && (
              <p className="text-xs text-muted-foreground">
                Última actividad:{" "}
                {format(parseISO(s.last_submission_at), "d MMM yyyy", { locale: es })}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
