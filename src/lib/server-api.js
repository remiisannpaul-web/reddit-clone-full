import "server-only";
import { headers } from "next/headers";
import { API_BASE_URL } from "@/lib/api-url";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Server components and form adapters must forward the browser's session cookie.
export async function serverApi(path, options = {}) {
  const incoming = await headers();
  const requestHeaders = new Headers(options.headers);
  requestHeaders.set("Content-Type", "application/json");
  const cookie = incoming.get("cookie");
  if (cookie) requestHeaders.set("Cookie", cookie);
  const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
    ...options,
    headers: requestHeaders,
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success === false) {
    throw new ApiError(
      data?.message ?? data?.error ?? `API request failed (${response.status})`,
      response.status,
    );
  }
  return data;
}
