import { useEffect, useState } from "react";
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
import CsvUpload from "@/components/CsvUpload";

import TRIBUTI_CSV from "@/data/tributi.csv?raw";

export default function Dashboard() {
  const { students, companyName, loaded, loading, loadCSV, loadFile } = useDashboard();
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadCSV(TRIBUTI_CSV, "Tributi");
  }, []);

  const reportDate = format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#EDF25F] flex items-center justify-center shrink-0">
              <span className="font-black text-black text-xs">L10</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                10x Builders <span className="text-[#EDF25F]">{companyName}</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reporte generado el {reportDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpload((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Cargar CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF25F] text-black text-sm font-medium hover:bg-[#d4de50] transition-colors"
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
            <div className="text-muted-foreground">Cargando datos...</div>
          </div>
        )}

        {loaded && !loading && (
          <>
            <OverviewCards students={students} />
            <AtRiskSection students={students} />

            <section>
              <StudentTable students={students} />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Distribución de Habilidades
              </h2>
              <SkillsCharts students={students} />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Métricas de Participación
              </h2>
              <EngagementSection students={students} />
            </section>

            <section>
              <ProjectsGrid students={students} />
            </section>

            <footer className="text-center text-xs text-muted-foreground py-4 border-t border-border mt-4">
              LAB10 · 10x Builders · Reporte generado el {reportDate} · {students.length} participantes
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
