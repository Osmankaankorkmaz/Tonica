
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/"
).replace(/\/+$/, "");

const TOKEN_KEY = "tonica_token";

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function normalizePath(path: string) {
  if (!path) return "/";
  let p = path.startsWith("/") ? path : `/${path}`;


  p = p.replace(/^\/api\/user(s)?\//, "/");
  p = p.replace(/^\/user(s)?\//, "/");

  p = p.replace(/\/{2,}/g, "/");
  return p;
}

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { json?: any; auth?: boolean } = {}
): Promise<T> {
  const { json, headers, auth = true, ...rest } = options;

  const url = `${API_BASE}${normalizePath(path)}`;

  const token = auth ? getToken() : null;

  const res = await fetch(url, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: json ? JSON.stringify(json) : rest.body,

    credentials: "include",
    cache: "no-store",
  });

  const ct = res.headers.get("content-type") || "";
  const text = await res.text().catch(() => "");

  const data = ct.includes("application/json") ? safeJsonParse(text) : null;

  if (!res.ok) {
    const fallback = text
      ? `API ${res.status} (JSON değil): ${text.slice(0, 160)}`
      : `API error (${res.status})`;

    const msg = (data && (data as any).message) || fallback;
    throw new Error(msg);
  }

  if (!ct.includes("application/json")) return {} as T;
  if (!data) throw new Error("API JSON parse edilemedi.");

  return data as T;
}
