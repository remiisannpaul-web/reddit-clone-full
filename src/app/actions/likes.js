"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/server-api";

export async function addLike(formData) {
  const postId = formData.get("postId");
  const communityId = formData.get("communityId");
  await serverApi(`/posts/likes/add/${encodeURIComponent(postId)}/${encodeURIComponent(communityId)}`, { method: "POST" });
  revalidatePath(`/communities/${communityId}`);
  revalidatePath(`/communities/${communityId}/comments/${postId}`);
}
export async function removeLike(formData) {
  const postId = formData.get("postId");
  const communityId = formData.get("communityId");
  await serverApi(`/posts/likes/remove/${encodeURIComponent(postId)}`, { method: "DELETE" });
  revalidatePath(`/communities/${communityId}`);
  revalidatePath(`/communities/${communityId}/comments/${postId}`);
}
export async function removeCommentLike(formData) {
  await serverApi(`/comments/likes/${encodeURIComponent(formData.get("comment_id"))}`, { method: "DELETE" });
  revalidatePath(`/communities/${formData.get("community_id")}/comments/${formData.get("post_id")}`);
}
export async function getPostLikes(postId) { return serverApi(`/posts/${encodeURIComponent(postId)}/likes`); }
export async function getCommentLikes(commentId) { return serverApi(`/comments/likes/${encodeURIComponent(commentId)}`); }
