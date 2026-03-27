import React, { useState, useEffect } from "react";
import type { ProjectData } from "@/lib/parseProjects";
import { Sparkles, RefreshCw, ChevronRight } from "lucide-react";

export interface Category {
  name: string;
  count: number;
  description: string;
  examples: string[];
}

export interface SummaryData {
  categories: Category[];
  insight: string;
}

interface Props {
  projects: ProjectData[];
  apiBase: string;
  onDataLoaded?: (data: SummaryData) => void;
}

const CATEGORY_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  { bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", dot: "bg-violet-400" },
  { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", dot: "bg-rose-400" },
];

export default function ProjectsSummary({ projects, apiBase, onDataLoaded }: Props) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withContent = projects.filter((p) => p.project_content_text.length > 30);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = withContent.map((p) => ({
        title: p.project_title,
        student: p.display_name || p.email,
        content: p.project_content_text,
      }));

      const res = await fetch(`${apiBase}api/projects/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: payload }),
      });

      if (!res.ok) throw new Error("Error del servidor");
      const json = await res.json();
      setData(json);
      onDataLoaded?.(json);
    } catch (err) {
      setError("No se pudo generar el resumen. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (withContent.length > 0) {
      fetchSummary();
    }
  }, []);

  if (withContent.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EDF25F] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-gray-800" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Resumen de Proyectos por AI</h2>
            <p className="text-xs text-gray-400">{withContent.length} proyectos analizados</p>
          </div>
        </div>
        {!loading && (
          <button
            onClick={fetchSummary}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerar
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Analizando proyectos con AI...</span>
        </div>
      )}

      {error && !loading && (
        <div className="py-6 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={fetchSummary}
            className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-5">
          {data.insight && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">{data.insight}</p>
            </div>
          )}

          {data.categories && data.categories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.categories.map((cat, i) => {
                const colors = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                return (
                  <div
                    key={cat.name}
                    className={`${colors.bg} border ${colors.border} rounded-xl p-4`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`} />
                      <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wide`} style={{ fontFamily: "'PT Mono', monospace" }}>
                        {cat.name}
                      </span>
                      <span className={`ml-auto text-xs font-bold ${colors.text}`} style={{ fontFamily: "'PT Mono', monospace" }}>
                        {cat.count}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{cat.description}</p>
                    {cat.examples && cat.examples.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {cat.examples.slice(0, 3).map((ex) => (
                          <div key={ex} className="flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="text-[11px] text-gray-500 truncate">{ex}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
