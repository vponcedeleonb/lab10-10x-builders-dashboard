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

  const codeCount = enrolled.filter(
    (s) =>
      s.learning_path?.toLowerCase().includes("code") &&
      !s.learning_path?.toLowerCase().includes("no-code") &&
      !s.learning_path?.toLowerCase().includes("no code")
  ).length;
  const noCodeCount = enrolled.length - codeCount;

  const cards = [
    {
      label: "Matriculados",
      value: `${totalEnrolled} / ${totalRegistered}`,
      sub: "activos vs registrados",
      color: "#EDF25F",
    },
    {
      label: "Completación Promedio",
      value: `${(avgCompletion * 100).toFixed(1)}%`,
      sub: "módulos completados / total",
      color: "#EDF25F",
    },
    {
      label: "Puntaje AI Promedio",
      value: avgAiScore > 0 ? avgAiScore.toFixed(1) : "—",
      sub: "en checkpoints calificados por AI",
      color: avgAiScore >= 85 ? "#4ade80" : avgAiScore >= 75 ? "#facc15" : "#f87171",
    },
    {
      label: "En Riesgo",
      value: String(atRiskCount),
      sub: "estudiantes requieren atención",
      color: atRiskCount > 0 ? "#f87171" : "#4ade80",
    },
    {
      label: "Distribución de Tracks",
      value: `${codeCount} Code`,
      sub: `${noCodeCount} No-Code`,
      color: "#818cf8",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-1 shadcn-card"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {card.label}
          </span>
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color: card.color }}
          >
            {card.value}
          </span>
          <span className="text-xs text-muted-foreground">{card.sub}</span>
        </div>
      ))}
    </div>
  );
}
