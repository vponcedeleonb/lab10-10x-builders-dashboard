import Papa from "papaparse";
import { differenceInDays, parseISO } from "date-fns";
import type { Student, StudentWithMeta, RiskReason } from "./types";

// Modules released through end of week 3 (the current reference point)
// No-Code: week1=12 + week2=14 + week3=10 = 36
// Code:    week1=7  + week2=10 + week3=6  = 23
const TOTAL_MODULES_NOCODE = 36;
const TOTAL_MODULES_CODE = 23;

const SKILL_CATEGORIES: { name: string; keywords: string[] }[] = [
  {
    name: "Fundamentos de AI y LLMs",
    keywords: ["fundamentos", "fundamento", "llm", "large language", "modelo de lenguaje", "inteligencia artificial", "ia básic"],
  },
  {
    name: "Prompting y comunicación con AI",
    keywords: ["prompting", "prompt", "comunicaci", "instrucciones", "redacción"],
  },
  {
    name: "Context Engineering",
    keywords: ["context engineering", "contexto", "context", "engineering"],
  },
  {
    name: "Herramientas No-Code",
    keywords: ["no-code", "nocode", "herramienta", "make", "zapier", "bubble", "webflow", "airtable", "notion"],
  },
  {
    name: "Automatización con AI",
    keywords: ["automatización", "automatizar", "automation", "flujo", "workflow", "pipeline"],
  },
  {
    name: "Análisis y pensamiento crítico",
    keywords: ["pensamiento crítico", "análisis", "analítico", "critico", "evaluar", "evaluación"],
  },
  {
    name: "Integración y APIs",
    keywords: ["integración", "integra", "api", "deploy", "webhook"],
  },
];

function mapToSkillCategories(text: string): string[] {
  const lower = text.toLowerCase();
  const matched = new Set<string>();
  for (const cat of SKILL_CATEGORIES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      matched.add(cat.name);
    }
  }
  return Array.from(matched);
}

function deriveCheckpointSkillStrengths(avgScore: number, skipRate: number, completionRate: number): string[] {
  const result: string[] = [];
  if (avgScore >= 88) result.push("Alto rendimiento en checkpoints");
  if (skipRate <= 0.05 && completionRate > 0.5) result.push("Consistencia y disciplina");
  if (completionRate >= 0.8) result.push("Ritmo de avance sostenido");
  return result;
}

function deriveCheckpointSkillGaps(avgScore: number, skipRate: number, completionRate: number): string[] {
  const result: string[] = [];
  if (avgScore > 0 && avgScore < 75) result.push("Calidad en entregas de checkpoints");
  if (skipRate > 0.3) result.push("Regularidad en checkpoints");
  if (completionRate < 0.3 && completionRate > 0) result.push("Ritmo de avance");
  return result;
}

function parseNum(val: unknown): number {
  const n = parseFloat(String(val ?? "0"));
  return isNaN(n) ? 0 : n;
}

function parseBool(val: unknown): boolean {
  const s = String(val ?? "").toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

export function enrichStudent(raw: Record<string, string>): StudentWithMeta {
  const s: Student = {
    display_name: raw.display_name ?? "",
    email: raw.email ?? "",
    registered_at: raw.registered_at ?? "",
    enrollment_status: raw.enrollment_status ?? "",
    enrolled_at: raw.enrolled_at ?? "",
    learning_path: raw.learning_path ?? "",
    batch_number: raw.batch_number ?? "",
    batch_start: raw.batch_start ?? "",
    batch_end: raw.batch_end ?? "",
    mentor_name: raw.mentor_name ?? "",
    mentor_email: raw.mentor_email ?? "",
    baseline_level: raw.baseline_level ?? "",
    baseline_score: parseNum(raw.baseline_score),
    recommended_path: raw.recommended_path ?? "",
    rating_code: parseNum(raw.rating_code),
    rating_nocode: parseNum(raw.rating_nocode),
    baseline_confidence: raw.baseline_confidence ?? "",
    is_borderline: parseBool(raw.is_borderline),
    baseline_strengths: raw.baseline_strengths ?? "",
    baseline_gaps: raw.baseline_gaps ?? "",
    modules_completed: parseNum(raw.modules_completed),
    modules_in_progress: parseNum(raw.modules_in_progress),
    total_modules_touched: parseNum(raw.total_modules_touched),
    checkpoint_submissions: parseNum(raw.checkpoint_submissions),
    checkpoints_skipped: parseNum(raw.checkpoints_skipped),
    checkpoints_ai_graded: parseNum(raw.checkpoints_ai_graded),
    avg_ai_score: parseNum(raw.avg_ai_score),
    last_submission_at: raw.last_submission_at ?? "",
    project_title: raw.project_title ?? "",
    project_status: raw.project_status ?? "",
    project_last_updated: raw.project_last_updated ?? "",
    tools_granted: parseNum(raw.tools_granted),
    tools_claimed: parseNum(raw.tools_claimed),
    tools_unclaimed: parseNum(raw.tools_unclaimed),
    discussion_threads: parseNum(raw.threads_created ?? raw.discussion_threads),
    discussion_replies: parseNum(raw.replies_posted ?? raw.discussion_replies),
    discussion_votes: parseNum(raw.votes_given ?? raw.discussion_votes),
  };

  const pathLower = (s.learning_path ?? "").toLowerCase().trim();
  const isCode = pathLower.includes("code") && !pathLower.includes("no-code") && !pathLower.includes("no code");
  const total_modules = isCode ? TOTAL_MODULES_CODE : TOTAL_MODULES_NOCODE;
  const completion_rate = total_modules > 0 ? Math.min(1, s.modules_completed / total_modules) : 0;

  const total_checkpoint_attempts = s.checkpoint_submissions + s.checkpoints_skipped;
  const skip_rate = total_checkpoint_attempts > 0 ? s.checkpoints_skipped / total_checkpoint_attempts : 0;

  const now = new Date();
  const days_since_last_submission = s.last_submission_at
    ? differenceInDays(now, parseISO(s.last_submission_at))
    : 999;
  const days_since_enrolled = s.enrolled_at
    ? differenceInDays(now, parseISO(s.enrolled_at))
    : 0;

  const risk_reasons: RiskReason[] = [];

  const statusLower = (s.enrollment_status ?? "").toLowerCase().trim();
  const NON_ENROLLED_STATUSES = ["not_enrolled", "not enrolled", "inactive", "pending", "withdrawn", ""];
  const isEffectivelyNotEnrolled =
    NON_ENROLLED_STATUSES.includes(statusLower) || !s.enrolled_at;
  const isActivelyEnrolled = !isEffectivelyNotEnrolled;

  if (isEffectivelyNotEnrolled) {
    risk_reasons.push("Nunca se matriculó");
  }
  if (s.modules_completed === 0 && days_since_enrolled > 5 && isActivelyEnrolled) {
    risk_reasons.push("Sin progreso (más de 5 días)");
  }
  if (skip_rate > 0.4 && total_checkpoint_attempts > 0) {
    risk_reasons.push("Alta tasa de saltos (>40%)");
  }
  if (days_since_last_submission > 7 && isActivelyEnrolled) {
    risk_reasons.push("Inactivo más de 7 días");
  }
  if (s.avg_ai_score > 0 && s.avg_ai_score < 75 && isActivelyEnrolled) {
    risk_reasons.push("Puntaje AI bajo (<75)");
  }

  const textStrengthCategories = mapToSkillCategories(s.baseline_strengths);
  const textGapCategories = mapToSkillCategories(s.baseline_gaps);
  const checkpointStrengths = deriveCheckpointSkillStrengths(s.avg_ai_score, skip_rate, completion_rate);
  const checkpointGaps = deriveCheckpointSkillGaps(s.avg_ai_score, skip_rate, completion_rate);

  const skill_strengths = Array.from(new Set([...textStrengthCategories, ...checkpointStrengths]));
  const skill_gaps = Array.from(new Set([...textGapCategories, ...checkpointGaps]));

  return {
    ...s,
    completion_rate,
    skip_rate,
    total_modules,
    risk_reasons,
    is_at_risk: risk_reasons.length > 0,
    days_since_last_submission,
    days_since_enrolled,
    skill_strengths,
    skill_gaps,
  };
}

export function parseCSV(csvText: string): StudentWithMeta[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data.map(enrichStudent);
}
