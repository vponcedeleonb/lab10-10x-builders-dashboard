import { X } from "lucide-react";
import type { StudentWithMeta } from "@/lib/types";

interface Props {
  title: string;
  students: StudentWithMeta[];
  onClose: () => void;
}

export default function StudentPopup({ title, students, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {students.length} {students.length === 1 ? "estudiante" : "estudiantes"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2">
          {students.map((s) => (
            <div
              key={s.email}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {s.display_name || s.email}
                </p>
                <p className="text-xs text-gray-400 truncate">{s.email}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {s.learning_path && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500"
                    style={{ fontFamily: "'PT Mono', monospace" }}
                  >
                    {s.learning_path}
                  </span>
                )}
                {s.baseline_level && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                    style={{
                      fontFamily: "'PT Mono', monospace",
                      backgroundColor:
                        s.baseline_level === "avanzado" ? "#000" :
                        s.baseline_level === "intermedio" ? "#A9A0EC" : "#D9E3E3",
                      color:
                        s.baseline_level === "avanzado" ? "#fff" :
                        s.baseline_level === "intermedio" ? "#fff" : "#555",
                    }}
                  >
                    {s.baseline_level}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {Math.round(s.completion_rate * 100)}%
                </span>
                <span
                  className={`text-xs font-bold ${
                    s.avg_ai_score >= 85
                      ? "text-green-600"
                      : s.avg_ai_score >= 75
                      ? "text-gray-700"
                      : "text-red-500"
                  }`}
                >
                  {s.avg_ai_score > 0 ? s.avg_ai_score.toFixed(0) : "—"}
                </span>
                {s.is_at_risk && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-100 font-medium">
                    riesgo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
