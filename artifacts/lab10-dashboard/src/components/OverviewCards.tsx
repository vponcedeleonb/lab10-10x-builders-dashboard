import type { StudentWithMeta } from "@/lib/types";

interface Props {
  students: StudentWithMeta[];
}

export default function OverviewCards({ students }: Props) {
  const enrolled = students.filter((s) => s.enrollment_status === "active");
  const totalRegistered = students.length;
  const totalEnrolled = enrolled.length;

  const avgCompletion =
    enrolled.length > 0
      ? enrolled.reduce((a, s) => a + s.completion_rate, 0) / enrolled.length
      : 0;

  const scoredStudents = enrolled.filter((s) => s.avg_ai_score > 0);
  const avgAiScore =
    scoredStudents.length > 0
      ? scoredStudents.reduce((a, s) => a + s.avg_ai_score, 0) / scoredStudents.length
      : 0;

  const atRiskCount = students.filter((s) => s.is_at_risk).length;

  const cards = [
    {
      label: "Matriculados",
      value: `${totalEnrolled} / ${totalRegistered}`,
      sub: "activos vs registrados",
      valueColor: "#1e3a5f",
    },
    {
      label: "Completación Promedio",
      value: `${(avgCompletion * 100).toFixed(1)}%`,
      sub: "módulos completados / total",
      valueColor: "#1e3a5f",
    },
    {
      label: "Puntaje AI Promedio",
      value: avgAiScore > 0 ? avgAiScore.toFixed(1) : "—",
      sub: "en checkpoints calificados por AI",
      valueColor: avgAiScore >= 85 ? "#15803d" : avgAiScore >= 75 ? "#b45309" : "#dc2626",
    },
    {
      label: "En Riesgo",
      value: String(atRiskCount),
      sub: "estudiantes requieren atención",
      valueColor: atRiskCount > 0 ? "#dc2626" : "#15803d",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-1 shadow-sm"
        >
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "'PT Mono', monospace" }}>
            {card.label}
          </span>
          <span
            className="text-3xl font-bold tabular-nums mt-1"
            style={{ color: card.valueColor, fontFamily: "'PT Mono', monospace" }}
          >
            {card.value}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">{card.sub}</span>
        </div>
      ))}
    </div>
  );
}
