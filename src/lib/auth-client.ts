import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "@/lib/api-url";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
});

export const { signIn, signUp, useSession } = authClient;
