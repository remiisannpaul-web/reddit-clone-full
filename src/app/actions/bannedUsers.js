"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/server-api";

export async function upsertBan(userId, communityId, permissions) {
  await serverApi(`/communities/${encodeURIComponent(communityId)}/bans/${encodeURIComponent(userId)}`, { method: "PUT", body: JSON.stringify(permissions) });
  revalidatePath(`/communities/${communityId}`);
}
export async function removeBan(userId, communityId) {
  await serverApi(`/communities/${encodeURIComponent(communityId)}/bans/${encodeURIComponent(userId)}`, { method: "DELETE" });
  revalidatePath(`/communities/${communityId}`);
}
export async function checkUserBan(userId, communityId) {
  return serverApi(`/communities/${encodeURIComponent(communityId)}/bans/${encodeURIComponent(userId)}`);
}
