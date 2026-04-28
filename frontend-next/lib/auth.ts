const TOKEN_KEY      = "se_cdss_token";
const ROLE_KEY       = "se_cdss_role";
const EMAIL_KEY      = "se_cdss_email";
const PATIENT_ID_KEY = "se_cdss_patient_id";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function getPatientId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PATIENT_ID_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function setAuth(token: string, role: string, email: string, patientId?: string | null): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(EMAIL_KEY, email);
  if (patientId) localStorage.setItem(PATIENT_ID_KEY, patientId);
  else localStorage.removeItem(PATIENT_ID_KEY);
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(PATIENT_ID_KEY);
}

export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
