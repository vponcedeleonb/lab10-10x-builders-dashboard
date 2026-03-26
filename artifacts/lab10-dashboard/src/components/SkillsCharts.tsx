import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell,
} from "recharts";
import type { StudentWithMeta } from "@/lib/types";

const LAB10 = {
  yellow:  "#EDF25F",
  purple:  "#A9A0EC",
  black:   "#000000",
  light:   "#D9E3E3",
  gray:    "#6b7280",
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

export default function SkillsCharts({ students }: Props) {
  const gridColor = LAB10.gridLine;
  const tickColor = LAB10.gray;

  const levelOrder = ["inicial", "intermedio", "avanzado"];
  const levelData = levelOrder.map((level) => ({
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
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({ name, count }));

  const topGaps = Object.entries(gapMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({ name, count }));

  const scatterData = students
    .filter((s) => s.baseline_score > 0 && s.avg_ai_score > 0)
    .map((s) => ({
      baseline: s.baseline_score,
      ai_score: s.avg_ai_score,
      name: s.display_name,
      level: s.baseline_level,
    }));

  function levelDotColor(level: string) {
    if (level === "avanzado") return LAB10.black;
    if (level === "intermedio") return LAB10.purple;
    return LAB10.light;
  }

  const levelColors = [LAB10.light, LAB10.purple, LAB10.black];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Distribución de Nivel Base</h3>
        <ResponsiveContainer width="100%" height={200} debounce={0}>
          <BarChart data={levelData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} stroke={gridColor} />
            <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={gridColor} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="count" name="Estudiantes" isAnimationActive={false} radius={[4, 4, 0, 0]}>
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
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Baseline vs. Puntaje AI Actual</h3>
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
                  </div>
                );
              }}
            />
            <Scatter data={scatterData} isAnimationActive={false}>
              {scatterData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={levelDotColor(entry.level)}
                  stroke={entry.level === "inicial" ? "#a0aec0" : "none"}
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
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Principales Fortalezas</h3>
        {topStrengths.length > 0 ? (
          <ResponsiveContainer width="100%" height={260} debounce={0}>
            <BarChart data={topStrengths} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} stroke={gridColor} allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 10, fill: tickColor }} stroke={gridColor} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="count" name="Estudiantes" fill={LAB10.purple} isAnimationActive={false} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm">Sin datos</p>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Principales Áreas de Mejora</h3>
        {topGaps.length > 0 ? (
          <ResponsiveContainer width="100%" height={260} debounce={0}>
            <BarChart data={topGaps} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} stroke={gridColor} allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 10, fill: tickColor }} stroke={gridColor} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="count" name="Estudiantes" fill={LAB10.yellow} stroke="#c8cc3a" strokeWidth={0.5} isAnimationActive={false} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm">Sin datos</p>
        )}
      </div>
    </div>
  );
}
