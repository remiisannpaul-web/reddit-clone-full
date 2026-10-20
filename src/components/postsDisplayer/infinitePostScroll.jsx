"use client";

import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostVoteControls from "@/components/postsDisplayer/postVoteControls";
import { Award, MessageCircle, Share2 } from "lucide-react";

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

export default function InfinitePostScroll({ communityId }) {
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", communityId],

    queryFn: async ({ pageParam }) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      let url = `${apiUrl}/posts/community/${communityId}`;

      if (pageParam) {
        url += `?cursorCreatedAt=${pageParam.createdAt}&cursorId=${pageParam.id}`;
      }

      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }

      return res.json();
    },

    initialPageParam: null,

    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-[#0b141a] p-8 text-center text-zinc-400">
        Loading posts...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-[#0b141a] p-8 text-center text-zinc-400">
        Something went wrong.
      </section>
    );
  }

  if (!posts.length) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-[#0b141a] p-8 text-center text-zinc-400">
        No posts yet. Be the first to create one.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-xl border border-zinc-800 bg-[#0b141a] text-zinc-100 p-4 md:p-5"
        >
          <header className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="h-7 w-7 rounded-full bg-orange-500/90 flex items-center justify-center text-xs font-bold text-white">
                {post.author_name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="font-semibold text-zinc-200">
                u/{post.author_name}
              </span>
              <span>·</span>
              <time dateTime={post.created_at}>
                {formatTimeAgo(post.created_at)}
              </time>
            </div>
            <button
              type="button"
              aria-label="Post options"
              className="text-zinc-500 hover:text-zinc-300 px-2"
            >
              ...
            </button>
          </header>

          <Link
            href={`/communities/${communityId}/comments/${post.id}`}
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
              communityId={communityId}
              hadLiked={post.had_liked}
              likeCount={post.like_count ?? 0}
            />

            <Link
              href={`/communities/${communityId}/comments/${post.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <MessageCircle className="h-4 w-4" />
              <span>0</span>
            </Link>

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

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-60"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-sm text-zinc-500 pt-2">No more posts.</p>
      )}
    </section>
  );
}
