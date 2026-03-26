import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell,
} from "recharts";
import type { StudentWithMeta } from "@/lib/types";
import StudentPopup from "./StudentPopup";
import ChartInfo from "./ChartInfo";

const LAB10 = {
  yellow:   "#EDF25F",
  purple:   "#A9A0EC",
  black:    "#000000",
  light:    "#D9E3E3",
  gray:     "#6b7280",
  gridLine: "rgba(0,0,0,0.07)",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 8, padding: "8px 14px", border: "1px solid #e5e7eb", fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ marginBottom: 4, fontWeight: 600, color: "#111" }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", gap: 8, color: "#6b7280" }}>
          <span>{entry.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 700, color: "#000" }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  students: StudentWithMeta[];
}

interface Popup {
  title: string;
  students: StudentWithMeta[];
}

export default function SkillsCharts({ students }: Props) {
  const [popup, setPopup] = useState<Popup | null>(null);

  const gridColor = LAB10.gridLine;
  const tickColor = LAB10.gray;

  const levelOrder = ["inicial", "intermedio", "avanzado"];
  const levelData = levelOrder.map((level) => ({
    level,
    name: level.charAt(0).toUpperCase() + level.slice(1),
    count: students.filter((s) => s.baseline_level === level).length,
  }));

  const strengthMap: Record<string, number> = {};
  const gapMap: Record<string, number> = {};
  students.forEach((s) => {
    s.skill_strengths.forEach((cat) => { strengthMap[cat] = (strengthMap[cat] ?? 0) + 1; });
    s.skill_gaps.forEach((cat) => { gapMap[cat] = (gapMap[cat] ?? 0) + 1; });
  });

  const topStrengths = Object.entries(strengthMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 7)
    .map(([name, count]) => ({ name, count }));

  const topGaps = Object.entries(gapMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 7)
    .map(([name, count]) => ({ name, count }));

  const scatterData = students
    .filter((s) => s.baseline_score > 0 && s.avg_ai_score > 0)
    .map((s) => ({
      baseline: s.baseline_score,
      ai_score: s.avg_ai_score,
      name: s.display_name,
      email: s.email,
      level: s.baseline_level,
    }));

  const levelColors = [LAB10.light, LAB10.purple, LAB10.black];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            Distribución de Nivel Base
            <ChartInfo text="Muestra cuántos estudiantes hay en cada nivel según su evaluación diagnóstica inicial. Haz clic en una barra para ver qué estudiantes pertenecen a ese nivel." />
          </h3>
          <ResponsiveContainer width="100%" height={200} debounce={0}>
            <BarChart data={levelData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} stroke={gridColor} />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={gridColor} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar
                dataKey="count"
                name="Estudiantes"
                isAnimationActive={false}
                radius={[4, 4, 0, 0]}
                style={{ cursor: "pointer" }}
                onClick={(data) => {
                  const matching = students.filter((s) => s.baseline_level === data.level);
                  if (matching.length) setPopup({ title: `Nivel ${data.name}`, students: matching });
                }}
              >
                {levelData.map((_, i) => (
                  <Cell key={i} fill={levelColors[i]} stroke={i === 0 ? "#c9d3d3" : "none"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block border border-gray-300" style={{ backgroundColor: LAB10.light }} />Inicial</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: LAB10.purple }} />Intermedio</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: LAB10.black }} />Avanzado</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            Baseline vs. Puntaje AI Actual
            <ChartInfo text="Cada punto representa un estudiante. El eje X es su puntaje en la evaluación inicial (baseline) y el eje Y es su promedio actual en checkpoints calificados por AI. Haz clic en un punto para ver los detalles del estudiante." />
          </h3>
          <ResponsiveContainer width="100%" height={220} debounce={0}>
            <ScatterChart margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="baseline"
                name="Puntaje Base"
                tick={{ fontSize: 11, fill: tickColor }}
                stroke={gridColor}
                label={{ value: "Puntaje Base", position: "insideBottom", offset: -4, fill: tickColor, fontSize: 10 }}
              />
              <YAxis
                dataKey="ai_score"
                name="Puntaje AI"
                tick={{ fontSize: 11, fill: tickColor }}
                stroke={gridColor}
                domain={[50, 100]}
              />
              <Tooltip
                cursor={{ stroke: "#e5e7eb", strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: "#fff", borderRadius: 8, padding: "8px 14px", border: "1px solid #e5e7eb", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                      <div style={{ fontWeight: 700, color: "#111", marginBottom: 4 }}>{d.name}</div>
                      <div style={{ color: "#6b7280" }}>Base: <span style={{ color: "#000", fontWeight: 600 }}>{d.baseline}</span></div>
                      <div style={{ color: "#6b7280" }}>AI: <span style={{ color: "#000", fontWeight: 600 }}>{d.ai_score.toFixed(1)}</span></div>
                      <div style={{ color: "#9ca3af", fontSize: 10, marginTop: 4 }}>Clic para ver detalles</div>
                    </div>
                  );
                }}
              />
              <Scatter
                data={scatterData}
                isAnimationActive={false}
                style={{ cursor: "pointer" }}
                onClick={(data) => {
                  const student = students.find((s) => s.email === data.email);
                  if (student) setPopup({ title: data.name, students: [student] });
                }}
              >
                {scatterData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.level === "avanzado" ? LAB10.black :
                      entry.level === "intermedio" ? LAB10.purple : LAB10.light
                    }
                    stroke={entry.level === "inicial" ? "#a0b0b0" : "none"}
                    strokeWidth={1}
                    fillOpacity={0.9}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300" style={{ backgroundColor: LAB10.light }} />Inicial</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: LAB10.purple }} />Intermedio</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: LAB10.black }} />Avanzado</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            Principales Fortalezas
            <ChartInfo text="Categorías del currículo LAB10 donde los estudiantes muestran mejor rendimiento, calculadas a partir de sus resultados en checkpoints. Haz clic en una barra para ver qué estudiantes tienen esa fortaleza." />
          </h3>
          {topStrengths.length > 0 ? (
            <ResponsiveContainer width="100%" height={260} debounce={0}>
              <BarChart data={topStrengths} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} stroke={gridColor} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 10, fill: tickColor }} stroke={gridColor} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar
                  dataKey="count"
                  name="Estudiantes"
                  fill={LAB10.purple}
                  isAnimationActive={false}
                  radius={[0, 4, 4, 0]}
                  style={{ cursor: "pointer" }}
                  onClick={(data) => {
                    const matching = students.filter((s) => s.skill_strengths.includes(data.name));
                    if (matching.length) setPopup({ title: `Fortaleza: ${data.name}`, students: matching });
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            Principales Áreas de Mejora
            <ChartInfo text="Categorías del currículo donde los estudiantes presentan mayor brecha de aprendizaje, basadas en checkpoints con bajo rendimiento. Haz clic en una barra para ver los estudiantes con esa área de mejora." />
          </h3>
          {topGaps.length > 0 ? (
            <ResponsiveContainer width="100%" height={260} debounce={0}>
              <BarChart data={topGaps} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} stroke={gridColor} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 10, fill: tickColor }} stroke={gridColor} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar
                  dataKey="count"
                  name="Estudiantes"
                  fill={LAB10.yellow}
                  stroke="#c8cc3a"
                  strokeWidth={0.5}
                  isAnimationActive={false}
                  radius={[0, 4, 4, 0]}
                  style={{ cursor: "pointer" }}
                  onClick={(data) => {
                    const matching = students.filter((s) => s.skill_gaps.includes(data.name));
                    if (matching.length) setPopup({ title: `Área de mejora: ${data.name}`, students: matching });
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}
        </div>
      </div>

      {popup && (
        <StudentPopup
          title={popup.title}
          students={popup.students}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  );
}
