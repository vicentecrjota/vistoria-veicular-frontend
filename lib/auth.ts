const TOKEN_KEY = "vistoria_token";
const USER_KEY = "vistoria_user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "funcionario";
}

export function saveAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Keep cookie in sync so middleware can protect routes
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
