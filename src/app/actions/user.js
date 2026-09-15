"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/server-api";

export async function getUserDetails(userId) { return serverApi(`/users/${encodeURIComponent(userId)}`); }
export async function modifyName(newName, userId) {
  const result = await serverApi(`/users/${encodeURIComponent(userId)}`, { method: "PATCH", body: JSON.stringify({ newName }) });
  revalidatePath("/profile");
  return result;
}
export async function modifyDisplayName(newDisplayName, userId) {
  const result = await serverApi(`/users/${encodeURIComponent(userId)}/display-name`, { method: "PATCH", body: JSON.stringify({ newDisplayName }) });
  revalidatePath("/profile");
  return result;
}
