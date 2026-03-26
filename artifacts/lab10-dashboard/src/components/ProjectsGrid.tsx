import React, { useState } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import type { StudentWithMeta } from "@/lib/types";
import type { ProjectData } from "@/lib/parseProjects";
import { Clock, FolderOpen, X, FileText } from "lucide-react";

function deriveTitle(content: string, fallback: string): string {
  if (!content || content.trim().length < 20) return fallback || "Proyecto en desarrollo";
  const segments = content
    .split(/\s*\|\s*/)
    .map((s) => s.replace(/^##\s*[\w\sÀ-ÿ]+/, "").trim())
    .filter((s) => s.length > 20);
  const first = segments[0] ?? "";
  const sentence = first.split(/\.\s+/)[0]?.trim() ?? first;
  if (!sentence) return fallback || "Proyecto en desarrollo";
  return sentence.length <= 72 ? sentence : sentence.slice(0, 69) + "…";
}

interface Props {
  students: StudentWithMeta[];
  projects?: ProjectData[];
}

interface ModalProject {
  project: ProjectData;
  student?: StudentWithMeta;
}

function ProjectModal({ project: p, student: s, onClose }: ModalProject & { onClose: () => void }) {
  const now = new Date();
  const daysSinceUpdate = p.project_updated_at
    ? differenceInDays(now, parseISO(p.project_updated_at))
    : null;
  const isStale = daysSinceUpdate !== null && daysSinceUpdate > 7;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="font-semibold text-gray-900 text-base leading-tight">
              {p.project_title || "Sin título"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Estudiante</span>
            <span className="text-gray-900 font-medium">{p.display_name || p.email}</span>
          </div>
          {s?.learning_path && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Track</span>
              <span className="text-gray-700">{s.learning_path}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Estado</span>
            <span
              className={`text-xs px-2 py-0.5 rounded border capitalize ${
                p.project_status === "submitted"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-500 border-gray-200"
              }`}
              style={{ fontFamily: "'PT Mono', monospace" }}
            >
              {p.project_status || "—"}
            </span>
          </div>
          {p.project_created_at && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Creado</span>
              <span className="text-gray-700">
                {format(parseISO(p.project_created_at), "d 'de' MMMM, yyyy", { locale: es })}
              </span>
            </div>
          )}
          {p.project_updated_at && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Última actualización</span>
              <span className={isStale ? "text-red-500" : "text-gray-700"}>
                {format(parseISO(p.project_updated_at), "d 'de' MMMM, yyyy", { locale: es })}
                {isStale && (
                  <span className="ml-1 text-red-500 text-xs">
                    ({daysSinceUpdate}d sin cambios)
                  </span>
                )}
              </span>
            </div>
          )}
          {s && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Progreso general</span>
                <span className="text-gray-700">
                  {s.modules_completed} / {s.total_modules} módulos ({Math.round(s.completion_rate * 100)}%)
                </span>
              </div>
              {s.avg_ai_score > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Puntaje AI promedio</span>
                  <span
                    className={
                      s.avg_ai_score >= 85
                        ? "text-green-600 font-semibold"
                        : s.avg_ai_score >= 75
                        ? "text-gray-700 font-semibold"
                        : "text-red-500 font-semibold"
                    }
                  >
                    {s.avg_ai_score.toFixed(1)}
                  </span>
                </div>
              )}
            </>
          )}
          {p.project_content_text && p.project_content_text.length > 20 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Descripción del proyecto</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-5">
                {p.project_content_text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsGrid({ students, projects = [] }: Props) {
  const [openModal, setOpenModal] = useState<ModalProject | null>(null);
  const now = new Date();

  const studentsByEmail = Object.fromEntries(students.map((s) => [s.email.toLowerCase(), s]));

  const displayProjects: (ProjectData & { student?: StudentWithMeta })[] = projects.length > 0
    ? projects.map((p) => ({
        ...p,
        student: studentsByEmail[p.email.toLowerCase()],
      }))
    : students
        .filter((s) => s.project_title || s.project_status)
        .map((s) => ({
          email: s.email,
          display_name: s.display_name || "",
          project_title: s.project_title || "",
          project_status: s.project_status || "",
          project_created_at: "",
          project_updated_at: s.project_last_updated || "",
          project_content_text: "",
          student: s,
        }));

  const visibleProjects = displayProjects.filter((p) => {
    if (!students.length) return true;
    return !!studentsByEmail[p.email.toLowerCase()];
  });

  const withContent = visibleProjects.filter((p) => p.project_content_text.trim().length > 20);
  const withoutContent = visibleProjects.filter((p) => p.project_content_text.trim().length <= 20);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Proyectos Finales{" "}
        <span className="text-sm font-normal text-gray-400">({visibleProjects.length})</span>
      </h2>

      {visibleProjects.length === 0 ? (
        <p className="text-gray-400 text-sm">Sin proyectos registrados.</p>
      ) : (
        <div className="space-y-6">
          {withContent.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {withContent.map((p) => {
                const daysSinceUpdate = p.project_updated_at
                  ? differenceInDays(now, parseISO(p.project_updated_at))
                  : null;
                const isStale = daysSinceUpdate !== null && daysSinceUpdate > 7;

                return (
                  <div
                    key={`${p.email}-${p.project_title}`}
                    className={`rounded-xl p-4 border flex flex-col gap-2 ${
                      isStale
                        ? "border-red-100 bg-red-50/30"
                        : "border-gray-100 bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-gray-600 font-medium leading-tight line-clamp-1">
                        {p.display_name || p.email}
                      </p>
                      {isStale && (
                        <Clock className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                      {deriveTitle(p.project_content_text, p.project_title)}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${
                          p.project_status === "submitted"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-400 border-gray-200"
                        }`}
                        style={{ fontFamily: "'PT Mono', monospace" }}
                      >
                        {p.project_status || "—"}
                      </span>
                      {p.project_updated_at && (
                        <span className={`text-[10px] ${isStale ? "text-red-400" : "text-gray-400"}`}>
                          {format(parseISO(p.project_updated_at), "d MMM", { locale: es })}
                        </span>
                      )}
                    </div>
                    {isStale && (
                      <p className="text-[10px] text-red-400">
                        Sin actualizar en {daysSinceUpdate} días
                      </p>
                    )}
                    <button
                      onClick={() => setOpenModal({ project: p, student: p.student })}
                      className="mt-1 w-full text-xs py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors font-medium bg-white"
                    >
                      Ver proyecto
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {withoutContent.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2" style={{ fontFamily: "'PT Mono', monospace" }}>
                Sin contenido registrado ({withoutContent.length})
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                {withoutContent.map((p) => (
                  <div key={`${p.email}-${p.project_title}`} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                    <span className="text-sm text-gray-500">{p.display_name || p.email}</span>
                    {p.project_status && (
                      <span
                        className="text-[10px] text-gray-400"
                        style={{ fontFamily: "'PT Mono', monospace" }}
                      >
                        · {p.project_status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {openModal && (
        <ProjectModal
          project={openModal.project}
          student={openModal.student}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}
