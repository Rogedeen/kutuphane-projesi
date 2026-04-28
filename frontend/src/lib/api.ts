import { BookFormData, UserFormData } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Token helpers ───────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem("token", token);
}

export function removeToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem("token");
}

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
}

export function setUserRole(role: string): void {
  if (typeof window !== "undefined") localStorage.setItem("role", role);
}

export function removeUserRole(): void {
  if (typeof window !== "undefined") localStorage.removeItem("role");
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<unknown> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      removeUserRole();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!res.ok) throw new Error("Giriş başarısız");
  return res.json();
}

// ─── Books ────────────────────────────────────────────────────────────────────

export async function getBooks() {
  return fetchWithAuth("/api/books");
}

export async function createBook(book: BookFormData) {
  return fetchWithAuth("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
}

export async function updateBook(id: number, book: BookFormData) {
  return fetchWithAuth(`/api/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
}

export async function deleteBook(id: number) {
  return fetchWithAuth(`/api/books/${id}`, { method: "DELETE" });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  return fetchWithAuth("/api/users");
}

export async function createUser(user: UserFormData) {
  return fetchWithAuth("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
}

export async function deleteUser(id: number) {
  return fetchWithAuth(`/api/users/${id}`, { method: "DELETE" });
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function getSales() {
  return fetchWithAuth("/api/sales");
}

export async function createSale(bookId: number, quantity: number) {
  return fetchWithAuth("/api/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ book_id: bookId, quantity }),
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminReset() {
  return fetchWithAuth("/api/admin/reset", { method: "POST" });
}

export async function adminAddJunk() {
  return fetchWithAuth("/api/admin/add-junk", { method: "POST" });
}
