import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Printer, Upload } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";
import OverviewCards from "@/components/OverviewCards";
import AtRiskSection from "@/components/AtRiskSection";
import StudentTable from "@/components/StudentTable";
import SkillsCharts from "@/components/SkillsCharts";
import EngagementSection from "@/components/EngagementSection";
import ProjectsGrid from "@/components/ProjectsGrid";
import ProjectsSummary from "@/components/ProjectsSummary";
import CsvUpload from "@/components/CsvUpload";
import TrackBar from "@/components/TrackBar";
import { parseProjectsCSV, type ProjectData } from "@/lib/parseProjects";

import TRIBUTI_CSV from "@/data/tributi.csv?raw";
import TRIBUTI_PROJECTS_CSV from "@/data/tributi_projects.csv?raw";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API_BASE = BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/";

export default function Dashboard() {
  const { students, companyName, loaded, loading, loadCSV, loadFile } = useDashboard();
  const [showUpload, setShowUpload] = useState(false);
  const [trackFilter, setTrackFilter] = useState<"code" | "nocode" | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    loadCSV(TRIBUTI_CSV, "Tributi");
    setProjects(parseProjectsCSV(TRIBUTI_PROJECTS_CSV));
  }, []);

  const allStudents = students;

  const codeCount = allStudents.filter((s) => {
    const p = (s.learning_path ?? "").toLowerCase();
    return p.includes("code") && !p.includes("no-code") && !p.includes("no code");
  }).length;
  const noCodeCount = allStudents.filter((s) => {
    const p = (s.learning_path ?? "").toLowerCase();
    return !p.includes("code") || p.includes("no-code") || p.includes("no code");
  }).length;

  const filteredStudents = useMemo(() => {
    if (!trackFilter) return allStudents;
    return allStudents.filter((s) => {
      const p = (s.learning_path ?? "").toLowerCase();
      const isCode = p.includes("code") && !p.includes("no-code") && !p.includes("no code");
      return trackFilter === "code" ? isCode : !isCode;
    });
  }, [allStudents, trackFilter]);

  const reportDate = format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EDF25F] flex items-center justify-center shrink-0 shadow-sm">
              <span className="font-black text-gray-900 text-xs" style={{ fontFamily: "'PT Mono', monospace" }}>L10</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                10x Builders <span className="text-gray-400 font-medium">{companyName}</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Reporte generado el {reportDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpload((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 text-sm hover:text-gray-800 hover:border-gray-300 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Cargar CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Exportar PDF
            </button>
          </div>
        </header>

        {showUpload && (
          <CsvUpload
            onFile={(file) => {
              loadFile(file);
              setShowUpload(false);
            }}
          />
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Cargando datos...</div>
          </div>
        )}

        {loaded && !loading && (
          <>
            <OverviewCards students={filteredStudents} />

            <TrackBar
              codeCount={codeCount}
              noCodeCount={noCodeCount}
              activeFilter={trackFilter}
              onFilter={setTrackFilter}
            />

            <AtRiskSection students={filteredStudents} />

            <section>
              <StudentTable students={filteredStudents} />
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3">
                Distribución de Habilidades
              </h2>
              <SkillsCharts students={filteredStudents} />
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3">
                Métricas de Participación
              </h2>
              <EngagementSection students={filteredStudents} />
            </section>

            <section>
              <ProjectsGrid students={filteredStudents} projects={projects} />
            </section>

            <section>
              <ProjectsSummary projects={projects} apiBase={API_BASE} />
            </section>

            <footer className="text-center text-xs text-gray-300 py-4 border-t border-gray-100 mt-4">
              LAB10 · 10x Builders · Reporte generado el {reportDate} · {filteredStudents.length} participantes
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
