import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { StudentWithMeta } from "@/lib/types";
import StudentPopup from "./StudentPopup";

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
      <div style={{ color: "#9ca3af", fontSize: 10, marginTop: 4 }}>Clic para ver detalles</div>
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

export default function EngagementSection({ students }: Props) {
  const [popup, setPopup] = useState<Popup | null>(null);

  const gridColor = LAB10.gridLine;
  const tickColor = LAB10.gray;

  const enrolled = students.filter((s) => s.enrollment_status === "active");

  const studentByEmail = Object.fromEntries(enrolled.map((s) => [s.email, s]));

  const checkpointData = enrolled
    .map((s) => ({
      email: s.email,
      name: s.display_name.split(".")[0] || s.display_name,
      submitted: s.checkpoint_submissions,
      skipped: s.checkpoints_skipped,
    }))
    .sort((a, b) => b.submitted - a.submitted);

  const discussionData = enrolled
    .filter((s) => s.discussion_threads + s.discussion_replies + s.discussion_votes > 0)
    .map((s) => ({
      email: s.email,
      name: s.display_name.split(".")[0] || s.display_name,
      hilos: s.discussion_threads,
      respuestas: s.discussion_replies,
      votos: s.discussion_votes,
    }))
    .sort((a, b) => b.hilos + b.respuestas + b.votos - (a.hilos + a.respuestas + a.votos));

  const toolsData = enrolled
    .filter((s) => s.tools_granted > 0)
    .map((s) => ({
      email: s.email,
      name: s.display_name.split(".")[0] || s.display_name,
      otorgadas: s.tools_granted,
      usadas: s.tools_claimed,
    }))
    .sort((a, b) => b.otorgadas - a.otorgadas);

  const handleBarClick = (data: { email?: string; name?: string }, chartLabel: string) => {
    const student = data.email ? studentByEmail[data.email] : undefined;
    if (student) setPopup({ title: `${student.display_name || student.email} · ${chartLabel}`, students: [student] });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Checkpoints por Estudiante (enviados vs saltados)
          </h3>
          <p className="text-[11px] text-gray-400 mb-3">Clic en una barra para ver los detalles del estudiante</p>
          <ResponsiveContainer width="100%" height={260} debounce={0}>
            <BarChart data={checkpointData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: tickColor }}
                stroke={gridColor}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} stroke={gridColor} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar
                dataKey="submitted"
                name="Enviados"
                fill={LAB10.purple}
                isAnimationActive={false}
                radius={[2, 2, 0, 0]}
                stackId="a"
                style={{ cursor: "pointer" }}
                onClick={(data) => handleBarClick(data, "Checkpoints")}
              />
              <Bar
                dataKey="skipped"
                name="Saltados"
                fill={LAB10.yellow}
                stroke="#c8cc3a"
                strokeWidth={0.5}
                isAnimationActive={false}
                radius={[2, 2, 0, 0]}
                stackId="a"
                style={{ cursor: "pointer" }}
                onClick={(data) => handleBarClick(data, "Checkpoints")}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: LAB10.purple }} />Enviados</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block border border-yellow-300" style={{ backgroundColor: LAB10.yellow }} />Saltados</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {discussionData.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Participación en Discusiones</h3>
              <p className="text-[11px] text-gray-400 mb-3">Clic en una barra para ver detalles</p>
              <ResponsiveContainer width="100%" height={220} debounce={0}>
                <BarChart data={discussionData} margin={{ top: 0, right: 10, left: -20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: tickColor }}
                    stroke={gridColor}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} stroke={gridColor} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="hilos" name="Hilos" fill={LAB10.black} isAnimationActive={false} radius={[2, 2, 0, 0]} style={{ cursor: "pointer" }} onClick={(data) => handleBarClick(data, "Discusiones")} />
                  <Bar dataKey="respuestas" name="Respuestas" fill={LAB10.purple} isAnimationActive={false} radius={[2, 2, 0, 0]} style={{ cursor: "pointer" }} onClick={(data) => handleBarClick(data, "Discusiones")} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: LAB10.black }} />Hilos</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: LAB10.purple }} />Respuestas</span>
              </div>
            </div>
          )}

          {toolsData.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Herramientas Otorgadas vs Usadas</h3>
              <p className="text-[11px] text-gray-400 mb-3">Clic en una barra para ver detalles</p>
              <ResponsiveContainer width="100%" height={220} debounce={0}>
                <BarChart data={toolsData} margin={{ top: 0, right: 10, left: -20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: tickColor }}
                    stroke={gridColor}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} stroke={gridColor} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="otorgadas" name="Otorgadas" fill={LAB10.light} stroke="#a0b0b0" strokeWidth={0.5} isAnimationActive={false} radius={[2, 2, 0, 0]} style={{ cursor: "pointer" }} onClick={(data) => handleBarClick(data, "Herramientas")} />
                  <Bar dataKey="usadas" name="Usadas" fill={LAB10.purple} isAnimationActive={false} radius={[2, 2, 0, 0]} style={{ cursor: "pointer" }} onClick={(data) => handleBarClick(data, "Herramientas")} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block border border-gray-300" style={{ backgroundColor: LAB10.light }} />Otorgadas</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: LAB10.purple }} />Usadas</span>
              </div>
            </div>
          )}

          {discussionData.length === 0 && toolsData.length === 0 && (
            <div className="col-span-2 text-gray-400 text-sm p-4">
              Sin datos de discusiones o herramientas.
            </div>
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
