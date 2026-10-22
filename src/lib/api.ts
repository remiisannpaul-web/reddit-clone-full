import { API_BASE_URL } from "@/lib/api-url";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },

    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
