// Maps email (lowercase) → array of company slugs the user can access
export const AUTHORIZED_EMAILS: Record<string, string[]> = {
  // ── Tributi ──────────────────────────────────────────────────────────
  "joan.jimenez@tributi.com": ["tributi"],

  // ── Truora ───────────────────────────────────────────────────────────
  "dbilbao@truora.com":  ["truora"],
  "kgarrido@truora.com": ["truora"],

  // ── LAB10 (all companies) ────────────────────────────────────────────
  "valentina@lab10.ai": ["tributi", "truora", "mono", "bacu"],

  // ── Mono ─────────────────────────────────────────────────────────────
  // "hr@mono.com": ["mono"],

  // ── Bacu ─────────────────────────────────────────────────────────────
  // "hr@bacu.com": ["bacu"],
};

const SESSION_KEY = "lab10_auth_email";

export function getCompaniesForEmail(email: string): string[] {
  return AUTHORIZED_EMAILS[email.toLowerCase().trim()] ?? [];
}

export function setSession(email: string): void {
  sessionStorage.setItem(SESSION_KEY, email.toLowerCase().trim());
}

export function getSession(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSessionCompanies(): string[] {
  const email = getSession();
  if (!email) return [];
  return getCompaniesForEmail(email);
}

// For backwards-compat — returns first company if only one, null otherwise
export function getSessionCompany(): string | null {
  const companies = getSessionCompanies();
  return companies.length === 1 ? companies[0] : null;
}

export function canAccessCompany(company: string): boolean {
  return getSessionCompanies().includes(company);
}
