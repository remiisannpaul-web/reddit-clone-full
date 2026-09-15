"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/server-api";

export async function createCommunity(formData) {
  const community = await serverApi("/communities", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(["name", "description", "banner_url", "icon_url"].map(key => [key, formData.get(key)]))),
  });
  revalidatePath("/communities");
  redirect(`/communities/${community.id}`);
}

export async function getCommunities() { return serverApi("/communities"); }

export async function getSpecificCommunity(id) {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  try {
    return await serverApi(`/communities/${id}`);
  } catch (error) {
    if (error.status === 404 || error.status === 403) return null;
    throw error;
  }
}

export async function regularJoinCommunity(id) {
  return serverApi(`/communities/membership/join/regular/${encodeURIComponent(id)}`, { method: "POST" });
}

export async function leaveCommunity(id) {
  return serverApi(`/communities/membership/leave/regular/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function toggleCommunityMembership(id) {
  if (await isCommunityMember(id)) await leaveCommunity(id);
  else await regularJoinCommunity(id);
  revalidatePath(`/communities/${id}`);
}

export async function isCommunityMember(id) { return serverApi(`/communities/${encodeURIComponent(id)}/membership`); }
