"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  MessageCircle,
  MoreHorizontal,
  Search,
  Share2,
} from "lucide-react";
import Link from "next/link";
import CommentComposer from "@/components/comments/commentComposer";
import PostVoteControls from "@/components/postsDisplayer/postVoteControls";
import { API_BASE_URL } from "@/lib/api-url";
import { useSession } from "@/lib/auth-client";

export default function SinglePostContent({ postId, comments, postLikes, commentsContent }) {
  const { data: session, isPending: sessionLoading } = useSession();

  const {
    data: post,
    isFetching,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["post", postId],
    enabled: Boolean(session?.user?.id && postId),
    queryFn: async () => {
      const endpoint = `${API_BASE_URL}/posts/${postId}`;
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          `GET ${endpoint} failed with ${response.status}: ${
            responseBody?.message ?? responseBody?.error ?? response.statusText
          }`,
        );
      }

      return responseBody?.post ?? null;
    },
  });

  if (sessionLoading || isLoading || isFetching) {
    return <p>Loading post...</p>;
  }

  if (isError) {
    return <p>Unable to load post: {error?.message ?? "Unknown error"}</p>;
  }

  if (!post) {
    return <p>Post not found.</p>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-4 text-zinc-100">
      <article className="rounded-xl border border-zinc-800 bg-[#0b141a] overflow-hidden">
        <header className="flex items-start gap-3 p-4 border-b border-zinc-800">
          <Link
            href={`/communities/${post.community_id}`}
            className="mt-1 text-zinc-400 hover:text-zinc-200"
            aria-label="Back to community"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="h-7 w-7 rounded-full bg-orange-500/90 flex items-center justify-center text-xs font-bold text-white shrink-0">
                r/
              </div>
              <Link
                href={`/communities/${post.community_id}`}
                className="font-semibold text-zinc-200 hover:underline"
              >
                r/{post.community_name}
              </Link>
              <span>·</span>
              <time dateTime={post.created_at}>{post.created_at}</time>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              u/{post.author_name ?? post.author_id}
            </p>
          </div>

          <button
            type="button"
            aria-label="More options"
            className="text-zinc-500 hover:text-zinc-300 p-1"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </header>

        <div className="p-4 md:p-5">
          <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-4">
            {post.title}
          </h1>

          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap space-y-4">
            {post.content}
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-2 px-4 pb-4">
          <PostVoteControls
            postId={post.id}
            communityId={post.community_id}
            hadLiked={post.had_liked}
            likeCount={postLikes}
          />

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length}</span>
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

      <section className="mt-4 rounded-xl border border-zinc-800 bg-[#0b141a] p-4">
        <CommentComposer postId={post.id} />

        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            type="button"
            className="rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-zinc-300"
          >
            Sort by: Best ▾
          </button>
          <div className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-zinc-500">
            <Search className="h-4 w-4" />
            <span>Search Comments</span>
          </div>
        </div>

        {commentsContent}
      </section>
    </div>
  );
}
