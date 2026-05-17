import * as SecureStore from "expo-secure-store";

// Change this to your deployed URL or local network IP for testing.
// For local dev: use your machine's local IP (not localhost) so the phone can reach it.
// e.g., "http://192.168.1.100:3000"
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

let authToken: string | null = null;

export async function setToken(token: string | null) {
  authToken = token;
  if (token) {
    await SecureStore.setItemAsync("auth_token", token);
  } else {
    await SecureStore.deleteItemAsync("auth_token");
  }
}

export async function getStoredToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync("auth_token");
  authToken = token;
  return token;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Cookie: `next-auth.session-token=${authToken}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// Auth-specific API calls
export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, redirect: false }),
  });

  // NextAuth returns a session cookie — extract it
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/next-auth\.session-token=([^;]+)/);
    if (match) {
      await setToken(match[1]);
      return { success: true };
    }
  }

  // Fallback: try direct login API
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (loginRes.ok) {
    const data = await loginRes.json();
    if (data.token) {
      await setToken(data.token);
      return { success: true, user: data.user };
    }
  }

  throw new Error("Invalid email or password");
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Registration failed");
  }

  return res.json();
}

export async function logout() {
  await setToken(null);
}
