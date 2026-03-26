// Add authorized emails here — key: email (lowercase), value: company slug
export const AUTHORIZED_EMAILS: Record<string, string> = {
  // ── Tributi ──────────────────────────────────────────────────────────
  "andres@tributi.com": "tributi",
  "andres.penata@tributi.com": "tributi",
  "angie.ceballos@tributi.com": "tributi",
  "carolina.pulgarin@tributi.com": "tributi",
  // add more Tributi contacts here

  // ── Truora ───────────────────────────────────────────────────────────
  // "hr@truora.com": "truora",

  // ── Mono ─────────────────────────────────────────────────────────────
  // "hr@mono.com": "mono",

  // ── Bacu ─────────────────────────────────────────────────────────────
  // "hr@bacu.com": "bacu",
};

const SESSION_KEY = "lab10_auth_email";

export function getCompanyForEmail(email: string): string | null {
  return AUTHORIZED_EMAILS[email.toLowerCase().trim()] ?? null;
}

export function setSession(email: string): void {
  sessionStorage.setItem(SESSION_KEY, email);
}

export function getSession(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSessionCompany(): string | null {
  const email = getSession();
  if (!email) return null;
  return getCompanyForEmail(email);
}
