import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Printer, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/lib/useDashboard";
import OverviewCards from "@/components/OverviewCards";
import AtRiskSection from "@/components/AtRiskSection";
import StudentTable from "@/components/StudentTable";
import SkillsCharts from "@/components/SkillsCharts";
import EngagementSection from "@/components/EngagementSection";
import ProjectsGrid from "@/components/ProjectsGrid";
import ProjectsSummary from "@/components/ProjectsSummary";
import TrackBar from "@/components/TrackBar";
import { parseProjectsCSV, type ProjectData } from "@/lib/parseProjects";
import { clearSession, getSessionCompanies } from "@/lib/auth";

import TRIBUTI_CSV from "@/data/tributi.csv?raw";
import TRIBUTI_PROJECTS_CSV from "@/data/tributi_projects.csv?raw";
import TRUORA_CSV from "@/data/truora.csv?raw";
import TRUORA_PROJECTS_CSV from "@/data/truora_projects.csv?raw";
import BACU_CSV from "@/data/bacu.csv?raw";
import BACU_PROJECTS_CSV from "@/data/bacu_projects.csv?raw";
import lab10Logo from "@assets/Asset_12_1774543506448.png";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API_BASE = BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/";

const COMPANY_LABELS: Record<string, string> = {
  tributi: "Tributi",
  truora:  "Truora",
  mono:    "Mono",
  bacu:    "Bacu",
};

interface Props {
  company: string;
}

export default function Dashboard({ company }: Props) {
  const navigate = useNavigate();
  const { students, companyName, loaded, loading, loadCSV } = useDashboard();
  const [trackFilter, setTrackFilter] = useState<"code" | "nocode" | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    if (company === "tributi") {
      loadCSV(TRIBUTI_CSV, "Tributi");
      setProjects(parseProjectsCSV(TRIBUTI_PROJECTS_CSV));
    } else if (company === "truora") {
      loadCSV(TRUORA_CSV, "Truora");
      setProjects(parseProjectsCSV(TRUORA_PROJECTS_CSV));
    } else if (company === "bacu") {
      loadCSV(BACU_CSV, "Bacu");
      setProjects(parseProjectsCSV(BACU_PROJECTS_CSV));
    }
    // Mono: data will be loaded once its CSV is available
  }, [company]);

  const multiCompany = getSessionCompanies().length > 1;

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const handleSwitchCompany = () => {
    navigate("/select");
  };

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
  const displayName = COMPANY_LABELS[company] ?? company;

  // Placeholder for companies without data yet
  const COMPANIES_WITH_DATA = ["tributi", "truora", "bacu"];
  if (!COMPANIES_WITH_DATA.includes(company) && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={lab10Logo} alt="LAB10" className="h-8 w-auto" />
            <div className="border-l border-gray-200 pl-4">
              <h1 className="text-base font-bold text-gray-900">
                10x Builders <span className="text-gray-400 font-medium">{displayName}</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {multiCompany && (
              <button onClick={handleSwitchCompany} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                Cambiar empresa
              </button>
            )}
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EDF25F] mx-auto mb-4 flex items-center justify-center">
              <span className="font-black text-gray-900 text-sm" style={{ fontFamily: "'PT Mono', monospace" }}>L10</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Próximamente</h2>
            <p className="text-sm text-gray-400">
              El dashboard de <strong>{displayName}</strong> estará disponible pronto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={lab10Logo} alt="LAB10" className="h-9 w-auto shrink-0" />
            <div className="border-l border-gray-200 pl-4">
              <h1 className="text-xl font-bold text-gray-900">
                10x Builders <span className="text-gray-400 font-medium">{companyName || displayName}</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Reporte generado el {reportDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {multiCompany && (
              <button
                onClick={handleSwitchCompany}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-sm hover:text-gray-800 hover:border-gray-300 transition-colors"
              >
                Cambiar empresa
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 text-sm hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Exportar PDF
            </button>
          </div>
        </header>


        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Cargando datos...</div>
          </div>
        )}

        {loaded && !loading && (
          <>
            <OverviewCards students={filteredStudents} />
            <TrackBar codeCount={codeCount} noCodeCount={noCodeCount} activeFilter={trackFilter} onFilter={setTrackFilter} />
            <AtRiskSection students={filteredStudents} />
            <section>
              <StudentTable students={filteredStudents} />
            </section>
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3">Distribución de Habilidades</h2>
              <SkillsCharts students={filteredStudents} />
            </section>
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3">Métricas de Participación</h2>
              <EngagementSection students={filteredStudents} />
            </section>
            <section>
              <ProjectsSummary projects={projects} apiBase={API_BASE} />
            </section>
            <section>
              <ProjectsGrid students={filteredStudents} projects={projects} />
            </section>
            <footer className="text-center text-xs text-gray-300 py-4 border-t border-gray-100 mt-4">
              LAB10 · 10x Builders · {filteredStudents.length} participantes
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
