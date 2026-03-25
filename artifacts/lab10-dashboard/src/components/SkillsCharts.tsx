import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell,
} from "recharts";
import type { StudentWithMeta } from "@/lib/types";

const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  yellow: "#EDF25F",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{ backgroundColor: "#1e2330", borderRadius: 6, padding: "8px 14px", border: "1px solid #333", fontSize: 13 }}>
      <div style={{ marginBottom: 4, fontWeight: 500, color: "#eee" }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", gap: 8, color: "#ccc" }}>
          <span>{entry.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 600, color: "#EDF25F" }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  students: StudentWithMeta[];
}

export default function SkillsCharts({ students }: Props) {
  const gridColor = "rgba(255,255,255,0.08)";
  const tickColor = "#98999C";

  const levelOrder = ["inicial", "intermedio", "avanzado"];
  const levelData = levelOrder.map((level) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    count: students.filter((s) => s.baseline_level === level).length,
  }));

  const strengthMap: Record<string, number> = {};
  const gapMap: Record<string, number> = {};

  students.forEach((s) => {
    s.skill_strengths.forEach((cat) => {
      strengthMap[cat] = (strengthMap[cat] ?? 0) + 1;
    });
    s.skill_gaps.forEach((cat) => {
      gapMap[cat] = (gapMap[cat] ?? 0) + 1;
    });
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
    if (level === "avanzado") return CHART_COLORS.green;
    if (level === "intermedio") return CHART_COLORS.blue;
    return CHART_COLORS.red;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card border border-card-border rounded-xl p-5 shadcn-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Distribución de Nivel Base</h3>
        <ResponsiveContainer width="100%" height={200} debounce={0}>
          <BarChart data={levelData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
            <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" name="Estudiantes" isAnimationActive={false} radius={[4, 4, 0, 0]} fillOpacity={0.85}>
              <Cell fill={CHART_COLORS.red} />
              <Cell fill={CHART_COLORS.blue} />
              <Cell fill={CHART_COLORS.green} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-[#A60808]" />Inicial</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-[#0079F2]" />Intermedio</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-[#009118]" />Avanzado</span>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5 shadcn-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Baseline vs. Puntaje AI Actual
        </h3>
        <ResponsiveContainer width="100%" height={220} debounce={0}>
          <ScatterChart margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="baseline"
              name="Puntaje Base"
              tick={{ fontSize: 11, fill: tickColor }}
              stroke={tickColor}
              label={{ value: "Puntaje Base", position: "insideBottom", offset: -4, fill: tickColor, fontSize: 10 }}
            />
            <YAxis
              dataKey="ai_score"
              name="Puntaje AI"
              tick={{ fontSize: 11, fill: tickColor }}
              stroke={tickColor}
              domain={[50, 100]}
            />
            <Tooltip
              cursor={{ stroke: tickColor, strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ backgroundColor: "#1e2330", borderRadius: 6, padding: "8px 14px", border: "1px solid #333", fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: "#eee", marginBottom: 4 }}>{d.name}</div>
                    <div style={{ color: "#ccc" }}>Base: <span style={{ color: "#EDF25F" }}>{d.baseline}</span></div>
                    <div style={{ color: "#ccc" }}>AI: <span style={{ color: "#EDF25F" }}>{d.ai_score.toFixed(1)}</span></div>
                  </div>
                );
              }}
            />
            <Scatter data={scatterData} isAnimationActive={false}>
              {scatterData.map((entry, i) => (
                <Cell key={i} fill={levelDotColor(entry.level)} fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5 shadcn-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Principales Fortalezas</h3>
        {topStrengths.length > 0 ? (
          <ResponsiveContainer width="100%" height={260} debounce={0}>
            <BarChart
              data={topStrengths}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} stroke={tickColor} allowDecimals={false} />
              <YAxis
                dataKey="name"
                type="category"
                width={200}
                tick={{ fontSize: 10, fill: tickColor }}
                stroke={tickColor}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" name="Estudiantes" fill={CHART_COLORS.green} fillOpacity={0.8} isAnimationActive={false} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-sm">Sin datos</p>
        )}
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5 shadcn-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Principales Áreas de Mejora</h3>
        {topGaps.length > 0 ? (
          <ResponsiveContainer width="100%" height={260} debounce={0}>
            <BarChart
              data={topGaps}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} stroke={tickColor} allowDecimals={false} />
              <YAxis
                dataKey="name"
                type="category"
                width={200}
                tick={{ fontSize: 10, fill: tickColor }}
                stroke={tickColor}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" name="Estudiantes" fill={CHART_COLORS.red} fillOpacity={0.8} isAnimationActive={false} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-sm">Sin datos</p>
        )}
      </div>
    </div>
  );
}
