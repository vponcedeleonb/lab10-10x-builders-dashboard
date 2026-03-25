import React, { useState } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import type { StudentWithMeta } from "@/lib/types";
import { Clock, FolderOpen, X } from "lucide-react";

interface Props {
  students: StudentWithMeta[];
}

interface ProjectModalProps {
  student: StudentWithMeta;
  onClose: () => void;
}

function ProjectModal({ student: s, onClose }: ProjectModalProps) {
  const now = new Date();
  const daysSinceUpdate = s.project_last_updated
    ? differenceInDays(now, parseISO(s.project_last_updated))
    : null;
  const isStale = daysSinceUpdate !== null && daysSinceUpdate > 7;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary shrink-0" />
            <h3 className="font-semibold text-foreground text-base leading-tight">
              {s.project_title || "Sin título"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estudiante</span>
            <span className="text-foreground font-medium">{s.display_name || s.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Track</span>
            <span className="text-foreground">{s.learning_path || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado</span>
            <span
              className={`text-xs px-2 py-0.5 rounded border capitalize ${
                s.project_status === "submitted"
                  ? "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {s.project_status || "—"}
            </span>
          </div>
          {s.project_last_updated && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Última actualización</span>
              <span className={isStale ? "text-[#f87171]" : "text-foreground"}>
                {format(parseISO(s.project_last_updated), "d 'de' MMMM, yyyy", { locale: es })}
                {isStale && (
                  <span className="ml-1 text-[#f87171] text-xs">
                    ({daysSinceUpdate} días sin cambios)
                  </span>
                )}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Progreso general</span>
            <span className="text-foreground">
              {s.modules_completed} / {s.total_modules} módulos ({Math.round(s.completion_rate * 100)}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Puntaje AI promedio</span>
            <span
              className={
                s.avg_ai_score >= 85
                  ? "text-[#4ade80] font-semibold"
                  : s.avg_ai_score >= 75
                  ? "text-foreground font-semibold"
                  : "text-[#f87171] font-semibold"
              }
            >
              {s.avg_ai_score > 0 ? s.avg_ai_score.toFixed(1) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsGrid({ students }: Props) {
  const withProjects = students.filter(
    (s) => s.project_title || s.project_status
  );

  const [openStudent, setOpenStudent] = useState<StudentWithMeta | null>(null);
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
                  <p className="text-xs text-muted-foreground leading-tight">
                    {s.display_name || s.email}
                  </p>
                  {isStale && (
                    <Clock className="w-3.5 h-3.5 text-[#f87171] shrink-0 mt-0.5" />
                  )}
                </div>
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
                <button
                  onClick={() => setOpenStudent(s)}
                  className="mt-1 w-full text-xs py-1.5 rounded border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium"
                >
                  Ver proyecto
                </button>
              </div>
            );
          })}
        </div>
      )}

      {openStudent && (
        <ProjectModal student={openStudent} onClose={() => setOpenStudent(null)} />
      )}
    </div>
  );
}
