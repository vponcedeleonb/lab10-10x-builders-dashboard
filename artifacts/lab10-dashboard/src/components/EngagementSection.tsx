import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { StudentWithMeta } from "@/lib/types";

const CHART_COLORS = {
  blue: "#0079F2",
  yellow: "#EDF25F",
  red: "#f87171",
  green: "#4ade80",
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

export default function EngagementSection({ students }: Props) {
  const gridColor = "rgba(255,255,255,0.08)";
  const tickColor = "#98999C";

  const enrolled = students.filter((s) => s.enrollment_status === "active");

  const checkpointData = enrolled
    .map((s) => ({
      name: s.display_name.split(".")[0] || s.display_name,
      submitted: s.checkpoint_submissions,
      skipped: s.checkpoints_skipped,
      skip_rate: s.skip_rate,
    }))
    .sort((a, b) => b.submitted - a.submitted);

  const discussionData = enrolled
    .filter((s) => s.discussion_threads + s.discussion_replies + s.discussion_votes > 0)
    .map((s) => ({
      name: s.display_name.split(".")[0] || s.display_name,
      hilos: s.discussion_threads,
      respuestas: s.discussion_replies,
      votos: s.discussion_votes,
    }))
    .sort((a, b) => b.hilos + b.respuestas + b.votos - (a.hilos + a.respuestas + a.votos));

  const toolsData = enrolled
    .filter((s) => s.tools_granted > 0)
    .map((s) => ({
      name: s.display_name.split(".")[0] || s.display_name,
      otorgadas: s.tools_granted,
      usadas: s.tools_claimed,
    }))
    .sort((a, b) => b.otorgadas - a.otorgadas);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-card-border rounded-xl p-5 shadcn-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Checkpoints por Estudiante (enviados vs saltados)
        </h3>
        <ResponsiveContainer width="100%" height={260} debounce={0}>
          <BarChart data={checkpointData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: tickColor }}
              stroke={tickColor}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: tickColor }} stroke={tickColor} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="submitted" name="Enviados" fill={CHART_COLORS.blue} fillOpacity={0.8} isAnimationActive={false} radius={[2, 2, 0, 0]} stackId="a" />
            <Bar dataKey="skipped" name="Saltados" fill={CHART_COLORS.red} fillOpacity={0.7} isAnimationActive={false} radius={[2, 2, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-[#0079F2]" />Enviados</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-[#f87171]" />Saltados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {discussionData.length > 0 && (
          <div className="bg-card border border-card-border rounded-xl p-5 shadcn-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Participación en Discusiones</h3>
            <ResponsiveContainer width="100%" height={220} debounce={0}>
              <BarChart data={discussionData} margin={{ top: 0, right: 10, left: -20, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: tickColor }}
                  stroke={tickColor}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} stroke={tickColor} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="hilos" name="Hilos" fill={CHART_COLORS.blue} fillOpacity={0.8} isAnimationActive={false} radius={[2, 2, 0, 0]} />
                <Bar dataKey="respuestas" name="Respuestas" fill="#795EFF" fillOpacity={0.8} isAnimationActive={false} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {toolsData.length > 0 && (
          <div className="bg-card border border-card-border rounded-xl p-5 shadcn-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Herramientas Otorgadas vs Usadas</h3>
            <ResponsiveContainer width="100%" height={220} debounce={0}>
              <BarChart data={toolsData} margin={{ top: 0, right: 10, left: -20, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: tickColor }}
                  stroke={tickColor}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} stroke={tickColor} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="otorgadas" name="Otorgadas" fill={CHART_COLORS.blue} fillOpacity={0.5} isAnimationActive={false} radius={[2, 2, 0, 0]} />
                <Bar dataKey="usadas" name="Usadas" fill={CHART_COLORS.green} fillOpacity={0.8} isAnimationActive={false} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {discussionData.length === 0 && toolsData.length === 0 && (
          <div className="col-span-2 text-muted-foreground text-sm p-4">
            Sin datos de discusiones o herramientas.
          </div>
        )}
      </div>
    </div>
  );
}
