"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteComment } from "@/app/actions/comment";
import { API_BASE_URL } from "@/lib/api-url";
import {
  ArrowBigDown,
  ArrowBigUp,
  Award,
  MessageCircle,
  Minus,
  MoreHorizontal,
  Share2,
  Trash2,
} from 'lucide-react'

async function fetchCommentLikes(commentId) {
  const response = await fetch(`${API_BASE_URL}/comments/likes/${commentId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message ?? `Request failed (${response.status})`);
  }

  return result;
}

async function fetchAddCommentLike(commentId, commentPostId) {
  const response = await fetch(`${API_BASE_URL}/comments/likes/add/${commentId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId: commentPostId }),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message ?? `Request failed (${response.status})`);
  }

  return result;
}

async function fetchRemoveCommentLike(commentId) {
  const response = await fetch(`${API_BASE_URL}/comments/likes/${commentId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message ?? `Request failed (${response.status})`);
  }

  return result;
}






export default function CommentItem({
  communityId,
  postId,
  comment,
  isLast,
  userRole,
  currentUserId,
}) {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(Boolean(comment.liked_comment));
  const commentLikesQuery = useQuery({
    queryKey: ["commentLikes", comment.id],
    queryFn: () => fetchCommentLikes(comment.id),
    enabled: Boolean(comment.id),
  });

  const commentLikes = commentLikesQuery.data ?? 0;
  const addCommentLikeMutation = useMutation({
    mutationFn: ({ comment_id, commentPostId }) =>
      fetchAddCommentLike(comment_id, commentPostId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["commentLikes", comment.id] });

      const previousLikes = queryClient.getQueryData(["commentLikes", comment.id]);
      queryClient.setQueryData(
        ["commentLikes", comment.id],
        (currentLikes = 0) => Number(currentLikes) + 1,
      );
      setIsLiked(true);

      return { previousLikes };
    },
    onError: (mutationError, _variables, context) => {
      queryClient.setQueryData(
        ["commentLikes", comment.id],
        context?.previousLikes ?? 0,
      );
      setIsLiked(false);
      console.error("Error adding comment like:", mutationError);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["commentLikes", comment.id] });
    },
  });

  const removeCommentLikeMutation = useMutation({
    mutationFn: ({ comment_id }) => fetchRemoveCommentLike(comment_id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["commentLikes", comment.id] });

      const previousLikes = queryClient.getQueryData(["commentLikes", comment.id]);
      queryClient.setQueryData(
        ["commentLikes", comment.id],
        (currentLikes = 0) => Math.max(Number(currentLikes) - 1, 0),
      );
      setIsLiked(false);

      return { previousLikes };
    },
    onError: (mutationError, _variables, context) => {
      queryClient.setQueryData(
        ["commentLikes", comment.id],
        context?.previousLikes ?? 0,
      );
      setIsLiked(true);
      console.error("Error removing comment like:", mutationError);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["commentLikes", comment.id] });
    },
  });

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center shrink-0 w-6">
        <button
          type="button"
          aria-label="Collapse comment"
          className="h-6 w-6 rounded-full border border-zinc-600 bg-zinc-900 text-zinc-300 flex items-center justify-center hover:bg-zinc-800"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        {!isLast && <div className="w-px flex-1 bg-zinc-700 mt-1 min-h-[24px]" />}
      </div>




      <div className="relative flex-1 min-w-0 pb-4">
          <form
            action={deleteComment.bind(null, comment.id, postId, communityId)}
            className="absolute top-0 right-0 z-10"
          >
            <button
              type="submit"
              aria-label="Remove comment"
              className="p-1 text-zinc-500 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
    

        <div className="flex items-center gap-2 pr-6 text-xs text-zinc-400 mb-1">
          <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-200 shrink-0">
            {comment.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="font-semibold text-zinc-200">{comment.name}</span>
          <span>·</span>
          <time dateTime={comment.created_at} className="text-zinc-400">
            {comment.created_at ? new Date(comment.created_at).toLocaleString() : "just now"}
          </time>
        </div>

        <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap mb-2">
          {comment.content}
        </p>

        <div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-zinc-400">
          {isLiked ? (
            <form onSubmit={(event) => {
              event.preventDefault();
              removeCommentLikeMutation.mutate({
                comment_id: comment.id,
              });
            }} className="inline-flex items-center rounded-full hover:bg-zinc-800/80">
              <input type="hidden" name="comment_id" value={comment.id} />
              <input type="hidden" name="community_id" value={communityId} />
              <input type="hidden" name="post_id" value={postId} />
              <button
                type="submit"
                aria-label="Remove upvote"
                className="p-1.5 text-orange-400"
              >
                <ArrowBigUp className="h-4 w-4 fill-current" />
              </button>
              <span className="px-0.5 min-w-[1ch] text-center">{commentLikes}</span>
              <button
                type="submit"
                aria-label="Downvote"
                className="p-1.5 hover:text-blue-400"
              >
                <ArrowBigDown className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                addCommentLikeMutation.mutate({
                  comment_id: comment.id,
                  commentPostId: postId,
                });
              }}
              className="inline-flex items-center rounded-full hover:bg-zinc-800/80"
            >
              <input type="hidden" name="comment_id" value={comment.id} />
              <input type="hidden" name="community_id" value={communityId} />
              <input type="hidden" name="post_id" value={postId} />
              <button
                type="submit"
                aria-label="Upvote"
                className="p-1.5 hover:text-orange-400 disabled:opacity-50"
                disabled={addCommentLikeMutation.isPending}
              >
                <ArrowBigUp className="h-4 w-4" />
              </button>
              <span className="px-0.5 min-w-[1ch] text-center">{commentLikes}</span>
              <button
                type="button"
                aria-label="Downvote"
                className="p-1.5 hover:text-blue-400"
              >
                <ArrowBigDown className="h-4 w-4" />
              </button>
            </form>
          )}

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 hover:bg-zinc-800/80"
          >
            <MessageCircle className="h-4 w-4" />
            Reply
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 hover:bg-zinc-800/80"
          >
            <Award className="h-4 w-4" />
            Award
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 hover:bg-zinc-800/80"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>

          <button
            type="button"
            aria-label="More options"
            className="p-1.5 rounded-full hover:bg-zinc-800/80"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}