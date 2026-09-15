"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
  MessageCircle,
  PencilOff,
  Pin,
  PinOff,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { deletePostAdmin, pinPost, unpinPost } from "@/app/actions/posts";
import PostVoteControls from "@/components/postsDisplayer/postVoteControls";
import { useSession } from "@/lib/auth-client";


function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}. ago`;
    }
  }

  return "just now";
}

export default function RelatedPostsFeed({ userId, userRole }) {
  const { data: session, isPending: sessionLoading} = useSession();
  
  const {
    data: posts = [],
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["relatedPosts", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const endpoint = `${apiUrl}/posts/feed`;
      let response;

      try {
          response = await fetch(endpoint, {
          credentials: "include", 
          headers: { 
            Authorization: `Bearer ${session.access_token}`,
           }
        });
      } catch (fetchError) {
        throw new Error(
          `Could not reach ${endpoint}. ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        );
      }

      if (!response.ok) {
        let serverMessage = "";

        try {
          const errorBody = await response.json();
          serverMessage = Array.isArray(errorBody.message)
            ? errorBody.message.join(", ")
            : (errorBody.message ?? errorBody.error ?? "");
        } catch {
          serverMessage = await response.text().catch(() => "");
        }

        throw new Error(
          `GET ${endpoint} failed with ${response.status} ${response.statusText}${serverMessage ? `: ${serverMessage}` : ""}`,
        );
      }

      return response.json();
    },
  });

  if (isLoading) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-[#0b141a] p-8 text-center text-zinc-400">
        Loading posts...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-[#0b141a] p-8 text-center text-zinc-400">
        <p>Unable to load posts.</p>
        <p className="mt-2 text-sm text-red-400">
          {error?.message ?? "Unknown error"}
        </p>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-[#0b141a] p-8 text-center text-zinc-400">
        No posts from your communities yet. Join a community and check back.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {posts.map((post, index) => (
        <article
          key={
            post.id ??
            `${post.community_name ?? post.name}-${post.title}-${post.created_at}-${index}`
          }
          className="relative rounded-xl border border-zinc-800 bg-[#0b141a] text-zinc-100 p-4 md:p-5"
        >
          {userRole?.role === "Owner" ? (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
              {post.is_pinned ? (
                <form action={unpinPost.bind(null, post.id, post.community_id)}>
                  <button
                    type="submit"
                    aria-label="Unpin post"
                    className="text-zinc-500 hover:text-zinc-300 p-1"
                  >
                    <PinOff className="h-5 w-5" />
                  </button>
                </form>
              ) : (
                <form action={pinPost.bind(null, post.id, post.community_id)}>
                  <button
                    type="submit"
                    aria-label="Pin post"
                    className="text-zinc-500 hover:text-zinc-300 p-1"
                  >
                    <Pin className="h-5 w-5" />
                  </button>
                </form>
              )}
              <form
                action={deletePostAdmin.bind(null, post.id, post.community_id)}
              >
                <button
                  type="submit"
                  aria-label="Delete post"
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <PencilOff className="h-5 w-5" />
                </button>
              </form>
            </div>
          ) : null}

          <header className="flex items-center mb-3 pr-16">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-7 w-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                r/
              </div>
              <Link
                href={`/communities/${post.community_id}`}
                className="font-semibold text-zinc-100 hover:underline"
              >
                r/{post.community_name ?? post.name}
              </Link>
              <span className="text-zinc-500">·</span>
              <time className="text-zinc-400" dateTime={post.created_at}>
                {formatTimeAgo(post.created_at)}
              </time>
            </div>
          </header>

          <Link
            href={`/communities/${post.community_id}/comments/${post.id}`}
            className="block"
          >
            <h2 className="text-xl md:text-2xl font-bold leading-snug mb-2 hover:underline">
              {post.title}
            </h2>

            {post.content ? (
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap line-clamp-4 mb-4">
                {post.content}
              </p>
            ) : null}
          </Link>

          <footer className="flex flex-wrap items-center gap-2">
            <PostVoteControls
              postId={post.id}
              communityId={post.community_id}
              hadLiked={post.had_liked}
              likeCount={post.like_count ?? 0}
            />

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <MessageCircle className="h-4 w-4" />
              <span>0</span>
            </button>

            <button
              type="button"
              aria-label="Award"
              className="inline-flex items-center rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <Award className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </footer>
        </article>
      ))}
    </section>
  );
}
