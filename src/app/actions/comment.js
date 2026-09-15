"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/server-api";

export async function addComment(postId, formData) {
  const result = await serverApi(`/comments/post/${encodeURIComponent(postId)}`, { method: "POST", body: JSON.stringify({ content: formData.get("content") }) });
  revalidatePath(`/communities/${result.communityId}/comments/${postId}`);
}
export async function getFullComments(postId) { return serverApi(`/comments/post/${encodeURIComponent(postId)}`); }
export async function deleteComment(commentId, postId, communityId) {
  await serverApi(`/comments/${encodeURIComponent(commentId)}/${encodeURIComponent(postId)}`, { method: "DELETE" });
  revalidatePath(`/communities/${communityId}/comments/${postId}`);
}
