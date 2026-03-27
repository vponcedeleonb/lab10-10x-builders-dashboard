import React, { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { StudentWithMeta } from "@/lib/types";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import type { AggModule, ModuleEntry } from "@/lib/parseModules";
import ModuleHeatmap from "./ModuleHeatmap";
import type { ProjectData } from "@/lib/parseProjects";
import type { Category } from "./ProjectsSummary";

interface Props {
  students: StudentWithMeta[];
  modulesByEmail?: Map<string, ModuleEntry[]>;
  allModules?: AggModule[];
  projectsByEmail?: Map<string, ProjectData>;
  summaryCategories?: Category[];
}

const CATEGORY_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  { bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", dot: "bg-violet-400" },
  { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", dot: "bg-rose-400" },
];

function extractDescription(content: string): string {
  const parts = content.split("|").map((s) => s.trim());
  return parts.find((p) => !p.startsWith("#") && p.length > 15) ?? "";
}

function getStudentCategories(
  student: StudentWithMeta,
  categories: Category[]
): Array<{ cat: Category; colorIdx: number }> {
  const nameNorm = (student.display_name ?? "").toLowerCase().trim();
  const emailNorm = (student.email ?? "").toLowerCase().trim();
  return categories
    .map((cat, idx) => ({ cat, colorIdx: idx }))
    .filter(({ cat }) =>
      cat.examples.some((ex) => {
        const exNorm = ex.toLowerCase().trim();
        return exNorm === nameNorm || exNorm === emailNorm || nameNorm.includes(exNorm) || exNorm.includes(nameNorm);
      })
    );
}

type SortKey = "display_name" | "completion_rate" | "avg_ai_score" | "days_since_last_submission";
type SortDir = "asc" | "desc";

function levelColor(level: string) {
  if (level === "inicial") return "text-[#f87171]";
  if (level === "intermedio") return "text-[#facc15]";
  if (level === "avanzado") return "text-[#4ade80]";
  return "text-muted-foreground";
}

function levelBg(level: string) {
  if (level === "inicial") return "bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20";
  if (level === "intermedio") return "bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20";
  if (level === "avanzado") return "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20";
  return "bg-muted text-muted-foreground";
}

function scoreColor(score: number) {
  if (score === 0) return "text-muted-foreground";
  if (score < 75) return "text-[#f87171]";
  if (score < 85) return "text-[#facc15]";
  return "text-[#4ade80]";
}

export default function StudentTable({ students, modulesByEmail, allModules, projectsByEmail, summaryCategories }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("display_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        s.display_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchesTrack =
        filterTrack === "all" ||
        (filterTrack === "code"
          ? s.learning_path?.toLowerCase().includes("code") &&
            !s.learning_path?.toLowerCase().includes("no-code") &&
            !s.learning_path?.toLowerCase().includes("no code")
          : s.learning_path?.toLowerCase().includes("no-code") ||
            s.learning_path?.toLowerCase().includes("no code"));
      const matchesLevel =
        filterLevel === "all" || s.baseline_level === filterLevel;
      return matchesSearch && matchesTrack && matchesLevel;
    })
    .sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      if (sortKey === "display_name") {
        va = a.display_name.toLowerCase();
        vb = b.display_name.toLowerCase();
      } else {
        va = (a as never)[sortKey] as number;
        vb = (b as never)[sortKey] as number;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronRight className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-xl shadcn-card overflow-hidden">
      <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Progreso de Estudiantes</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todos los tracks</option>
            <option value="code">Code</option>
            <option value="nocode">No-Code</option>
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todos los niveles</option>
            <option value="inicial">Inicial</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                <button
                  onClick={() => handleSort("display_name")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Nombre <SortIcon col="display_name" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">
                Track
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                Nivel
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                <button
                  onClick={() => handleSort("completion_rate")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Progreso <SortIcon col="completion_rate" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">
                Checkpoints
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                <button
                  onClick={() => handleSort("avg_ai_score")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Puntaje AI <SortIcon col="avg_ai_score" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                <button
                  onClick={() => handleSort("days_since_last_submission")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Última Actividad <SortIcon col="days_since_last_submission" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden xl:table-cell">
                Proyecto
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <React.Fragment key={s.email}>
                <tr
                  className={`border-b border-border transition-colors cursor-pointer ${
                    s.is_at_risk ? "bg-[#f87171]/5" : "hover:bg-muted/20"
                  }`}
                  onClick={() => setExpanded(expanded === s.email ? null : s.email)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {expanded === s.email ? (
                        <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{s.display_name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded border bg-muted text-muted-foreground">
                      {s.learning_path?.includes("No-Code") || s.learning_path?.includes("No Code")
                        ? "No-Code"
                        : s.learning_path
                        ? "Code"
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${levelBg(s.baseline_level)}`}
                    >
                      {s.baseline_level || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#EDF25F]"
                          style={{ width: `${Math.min(100, s.completion_rate * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {s.modules_completed}/{s.total_modules}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="text-xs">
                      <span className="text-foreground">{s.checkpoint_submissions}</span>
                      {s.checkpoints_skipped > 0 && (
                        <span
                          className={`ml-1 ${s.skip_rate > 0.3 ? "text-[#f87171]" : "text-muted-foreground"}`}
                        >
                          ({s.checkpoints_skipped} saltados)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${scoreColor(s.avg_ai_score)}`}>
                      {s.avg_ai_score > 0 ? s.avg_ai_score.toFixed(1) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.last_submission_at ? (
                      <span
                        className={`text-xs ${s.days_since_last_submission > 7 ? "text-[#f87171]" : "text-muted-foreground"}`}
                      >
                        {formatDistanceToNow(parseISO(s.last_submission_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin actividad</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <p className="text-xs text-foreground truncate max-w-[160px]">
                      {s.project_title || "—"}
                    </p>
                    {s.project_status && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {s.project_status}
                      </p>
                    )}
                  </td>
                </tr>
                {expanded === s.email && (
                  <tr className="bg-muted/10">
                    <td colSpan={8} className="px-8 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide">
                            Mentor
                          </p>
                          <p className="text-foreground">{s.mentor_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{s.mentor_email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide">
                            Nivel Base
                          </p>
                          <p className={`font-medium ${levelColor(s.baseline_level)}`}>
                            {s.baseline_level} · {s.baseline_score} pts
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide">
                            Fortalezas
                          </p>
                          {s.skill_strengths.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {s.skill_strengths.map((sk) => (
                                <span key={sk} className="text-[10px] px-1.5 py-0.5 rounded bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-foreground text-xs">—</p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide">
                            Áreas de Mejora
                          </p>
                          {s.skill_gaps.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {s.skill_gaps.map((sk) => (
                                <span key={sk} className="text-[10px] px-1.5 py-0.5 rounded bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-foreground text-xs">—</p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide">
                            Proyecto Final
                          </p>
                          {(() => {
                            const proj = projectsByEmail?.get(s.email.toLowerCase());
                            const description = proj?.project_content_text
                              ? extractDescription(proj.project_content_text)
                              : "";
                            const matched = summaryCategories
                              ? getStudentCategories(s, summaryCategories)
                              : [];
                            return (
                              <>
                                {description ? (
                                  <p className="text-foreground text-xs mb-1.5 leading-relaxed">
                                    {description}
                                  </p>
                                ) : (
                                  <p className="text-foreground text-xs mb-1.5">{s.project_title || "—"}</p>
                                )}
                                {matched.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mb-1">
                                    {matched.map(({ cat, colorIdx }) => {
                                      const c = CATEGORY_COLORS[colorIdx % CATEGORY_COLORS.length];
                                      return (
                                        <span
                                          key={cat.name}
                                          className={`text-[10px] px-1.5 py-0.5 rounded border ${c.bg} ${c.border} ${c.text} font-medium`}
                                          style={{ fontFamily: "'PT Mono', monospace" }}
                                        >
                                          {cat.name}
                                        </span>
                                      );
                                    })}
                                  </div>
                                ) : summaryCategories ? (
                                  <p className="text-[10px] text-muted-foreground mb-1">Sin categoría asignada</p>
                                ) : null}
                                <p className="text-xs text-muted-foreground capitalize">
                                  Estado: {s.project_status || "—"}
                                </p>
                              </>
                            );
                          })()}
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide">
                            Participación
                          </p>
                          <p className="text-xs text-foreground">
                            Hilos: {s.discussion_threads} · Respuestas: {s.discussion_replies} · Votos:{" "}
                            {s.discussion_votes}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Herramientas: {s.tools_claimed}/{s.tools_granted} usadas
                          </p>
                        </div>
                        {s.risk_reasons.length > 0 && (
                          <div className="col-span-full">
                            <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide text-[#f87171]">
                              Alertas de Riesgo
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {s.risk_reasons.map((r) => (
                                <span
                                  key={r}
                                  className="text-xs px-2 py-0.5 rounded-full bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {allModules && allModules.length > 0 && (
                          <div className="col-span-full border-t border-border pt-3 mt-1">
                            <p className="text-muted-foreground text-xs mb-2 font-medium uppercase tracking-wide">
                              Progreso por Módulo
                            </p>
                            <ModuleHeatmap
                              mode="individual"
                              allModules={allModules}
                              studentEntries={modulesByEmail?.get(s.email.toLowerCase()) ?? []}
                              trackFilter={
                                (() => {
                                  const p = (s.learning_path ?? "").toLowerCase();
                                  return p.includes("code") && !p.includes("no-code") && !p.includes("no code")
                                    ? "code"
                                    : "nocode";
                                })()
                              }
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No hay estudiantes que coincidan con los filtros.
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
        {filtered.length} de {students.length} estudiantes
      </div>
    </div>
  );
}
