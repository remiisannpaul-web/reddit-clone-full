"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/server-api";

export async function createPost(communityId, formData) {
  await serverApi(`/posts/create/${encodeURIComponent(communityId)}`, { method: "POST", body: JSON.stringify({ title: formData.get("title"), content: formData.get("content") }) });
  revalidatePath(`/communities/${communityId}`);
  redirect(`/communities/${communityId}`);
}
export async function getOnePost(id) {
  try { return (await serverApi(`/posts/${encodeURIComponent(id)}`)).post; }
  catch (error) { if (error.status === 404) return null; throw error; }
}
export async function getSpecificPosts(id) { return serverApi(`/posts/community/${encodeURIComponent(id)}/all`); }
export async function getAllRelatedPosts() {
  try { return await serverApi("/posts/feed"); }
  catch (error) { if (error.status === 401) return []; throw error; }
}
async function moderate(postId, action) {
  const result = await serverApi(`/posts/${encodeURIComponent(postId)}${action === "delete" ? "" : "/pin"}`, { method: action === "pin" ? "PATCH" : "DELETE" });
  revalidatePath(`/communities/${result.communityId}`);
  redirect(`/communities/${result.communityId}`);
}
export async function deletePostAdmin(postId) { await moderate(postId, "delete"); }
export async function pinPost(postId) { await moderate(postId, "pin"); }
export async function unpinPost(postId) { await moderate(postId, "unpin"); }
