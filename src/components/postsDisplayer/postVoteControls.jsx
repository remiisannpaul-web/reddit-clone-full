"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api-url";

async function fetchLike(postId, communityId, action) {
  if (!postId || !communityId || !["add", "remove"].includes(action)) {
    throw new Error("Invalid post vote request.");
  }

  const url = action === "add"
    ? `${API_BASE_URL}/posts/likes/add/${postId}/${communityId}`
    : `${API_BASE_URL}/posts/likes/remove/${postId}`;

  try {
    const response = await fetch(url, {
      method: action === "add" ? "POST" : "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const responseText = await response.text();
    let responseBody = null;

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }
    }

    if (!response.ok) {
      const serverMessage =
        typeof responseBody === "object" && responseBody?.message
          ? Array.isArray(responseBody.message)
            ? responseBody.message.join(", ")
            : responseBody.message
          : `Like request failed with status ${response.status}`;
      throw new Error(serverMessage);
    }

    return responseBody;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Could not reach the API at ${API_BASE_URL}. Make sure the API gateway is running.`,
      );
    }

    throw error;
  }
}


export default function PostVoteControls({
  postId,
  communityId,
  hadLiked = false,
  likeCount = 0,
}) {

  const [hasLiked, setHasLiked] = useState(hadLiked);

  const count = Number(likeCount) || 0;
  const mutation = useMutation({
    mutationFn: ({ postId, communityId, action }) => fetchLike(postId, communityId, action),
    onMutate: ({ action }) => {
      const previousHasLiked = hasLiked;
      setHasLiked(action === "add");

      return { previousHasLiked };
    },
    onSuccess: () => {
      // Optionally, you can refetch the likes count or update the UI here
    },
    onError: (error, _variables, context) => {
      setHasLiked(context?.previousHasLiked ?? hadLiked);
      console.error("Error updating like:", error);
    },
  })

  const submitVote = (event, action) => {
    event.preventDefault();
    if (!mutation.isPending) {
      mutation.mutate({ postId, communityId, action });
    }
  };

  return (
    <div className="inline-flex items-center rounded-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-300">
      {hasLiked ? (
        <form
          onSubmit={(event) => {
            submitVote(event, "remove");
          }}
          className="inline-flex items-center"
        >
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="communityId" value={communityId} />
          <button
            type="submit"
            disabled={mutation.isPending}
            aria-label="Remove upvote"
            className="px-3 py-1.5 hover:bg-zinc-800 rounded-l-full text-orange-400"
          >
            <ArrowBigUp className="h-4 w-4 fill-current" />
          </button>
          <span className="px-1 font-semibold">{count}</span>
          <button
            type="button"
            aria-label="Downvote"
            className="px-3 py-1.5 hover:bg-zinc-800 rounded-r-full"
          >
            <ArrowBigDown className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            submitVote(event, "add");
          }}
          className="inline-flex items-center"
        >
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="communityId" value={communityId} />
          <button
            type="submit"
            disabled={mutation.isPending}
            aria-label="Upvote"
            className="px-3 py-1.5 hover:bg-zinc-800 rounded-l-full"
          >
            <ArrowBigUp className="h-4 w-4" />
          </button>
          <span className="px-1 font-semibold">{count}</span>
          <button
            type="button"
            aria-label="Downvote"
            className="px-3 py-1.5 hover:bg-zinc-800 rounded-r-full"
          >
            <ArrowBigDown className="h-4 w-4" />
          </button>
        </form>
      )}
      {mutation.isError && (
        <p role="alert" className="absolute mt-10 text-xs text-red-400">
          {mutation.error.message}
        </p>
      )}
    </div>
  );
}
