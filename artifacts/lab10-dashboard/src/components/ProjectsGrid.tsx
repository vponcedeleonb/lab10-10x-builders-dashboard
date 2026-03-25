import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import type { StudentWithMeta } from "@/lib/types";
import { Clock } from "lucide-react";

interface Props {
  students: StudentWithMeta[];
}

export default function ProjectsGrid({ students }: Props) {
  const withProjects = students.filter(
    (s) => s.project_title || s.project_status
  );

  const now = new Date();

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 shadcn-card">
      <h2 className="text-lg font-semibold text-foreground mb-4">Proyectos Finales</h2>
      {withProjects.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sin proyectos registrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {withProjects.map((s) => {
            const daysSinceUpdate = s.project_last_updated
              ? differenceInDays(now, parseISO(s.project_last_updated))
              : null;
            const isStale = daysSinceUpdate !== null && daysSinceUpdate > 7;

            return (
              <div
                key={s.email}
                className={`rounded-lg p-4 border flex flex-col gap-2 ${
                  isStale
                    ? "border-[#f87171]/25 bg-[#f87171]/5"
                    : "border-card-border bg-background"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground text-sm leading-tight">
                    {s.project_title || "Sin título"}
                  </p>
                  {isStale && (
                    <Clock className="w-3.5 h-3.5 text-[#f87171] shrink-0 mt-0.5" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{s.display_name}</p>
                <div className="flex items-center justify-between mt-auto pt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded border capitalize ${
                      s.project_status === "submitted"
                        ? "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {s.project_status || "—"}
                  </span>
                  {s.project_last_updated && (
                    <span
                      className={`text-xs ${isStale ? "text-[#f87171]" : "text-muted-foreground"}`}
                    >
                      {format(parseISO(s.project_last_updated), "d MMM", { locale: es })}
                    </span>
                  )}
                </div>
                {isStale && (
                  <p className="text-[10px] text-[#f87171]">
                    Sin actualizar en {daysSinceUpdate} días
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
