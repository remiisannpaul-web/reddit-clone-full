import { getSpecificPosts } from "@/app/actions/posts";


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

export default async function SpecificPostsDisplayer({ name }) {
  const posts = await getSpecificPosts(name);

  if (!posts.length) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-[#0b141a] p-8 text-center text-zinc-400">
        No posts yet. Be the first to create one.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {posts.map((post, index) => (
        <article
          key={`${post.title}-${post.created_at}-${index}`}
          className="rounded-xl border border-zinc-800 bg-[#0b141a] text-zinc-100 p-4 md:p-5"
        >
          <header className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="h-7 w-7 rounded-full bg-orange-500/90 flex items-center justify-center text-xs font-bold text-white">
                {post.author_name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="font-semibold text-zinc-200">u/{post.author_name}</span>
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

          <h2 className="text-xl md:text-2xl font-bold leading-snug mb-3">
            {post.title}
          </h2>

          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap line-clamp-6">
            {post.content}
          </p>
        </article>
      ))}
    </section>
  );
}
