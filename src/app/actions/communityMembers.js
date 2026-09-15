"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/server-api";

export async function getCommunityOwner(id) { return serverApi(`/communities/${encodeURIComponent(id)}/members/owner`); }
export async function getCommunityNamesAndRoles(id) { return serverApi(`/communities/${encodeURIComponent(id)}/members`); }
export async function getCommuntityRole(userId, communityId) {
  if (!userId) return null;
  return serverApi(`/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(userId)}/role`);
}

export async function removeMember(userId, communityId) {
  await serverApi(`/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(userId)}`, { method: "DELETE" });
  revalidatePath(`/communities/${communityId}`);
}

export async function promoteToModerator(userId, communityId) {
  await serverApi(`/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(userId)}/moderator`, { method: "PATCH" });
  revalidatePath(`/communities/${communityId}`);
}

export async function removeModerator(userId, communityId) {
  await serverApi(`/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(userId)}/moderator`, { method: "DELETE" });
  revalidatePath(`/communities/${communityId}`);
}
