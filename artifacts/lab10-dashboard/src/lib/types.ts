export interface Student {
  display_name: string;
  email: string;
  registered_at: string;
  enrollment_status: string;
  enrolled_at: string;
  learning_path: string;
  batch_number: string;
  batch_start: string;
  batch_end: string;
  mentor_name: string;
  mentor_email: string;
  baseline_level: string;
  baseline_score: number;
  recommended_path: string;
  rating_code: number;
  rating_nocode: number;
  baseline_confidence: string;
  is_borderline: boolean;
  baseline_strengths: string;
  baseline_gaps: string;
  modules_completed: number;
  modules_in_progress: number;
  total_modules_touched: number;
  checkpoint_submissions: number;
  checkpoints_skipped: number;
  checkpoints_ai_graded: number;
  avg_ai_score: number;
  last_submission_at: string;
  project_title: string;
  project_status: string;
  project_last_updated: string;
  tools_granted: number;
  tools_claimed: number;
  tools_unclaimed: number;
  discussion_threads: number;
  discussion_replies: number;
  discussion_votes: number;
}

export type RiskReason =
  | "Nunca se matriculó"
  | "Sin progreso (más de 5 días)"
  | "Alta tasa de saltos (>40%)"
  | "Inactivo más de 7 días"
  | "Puntaje AI bajo (<75)";

export interface StudentWithMeta extends Student {
  completion_rate: number;
  skip_rate: number;
  total_modules: number;
  risk_reasons: RiskReason[];
  is_at_risk: boolean;
  days_since_last_submission: number;
  days_since_enrolled: number;
}
