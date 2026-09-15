import { getFullComments } from "@/app/actions/comment";
import { getPostLikes } from "@/app/actions/likes";
import SinglePostContent from "@/components/postsDisplayer/singlePostContent";
import CommentThread from "@/components/comments/commentThread";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
      return `${count}${interval.label} ago`;
    }
  }

  return "just now";
}

export default async function CommentsPage({ params }) {

  const resolvedParams = await params;
  const communityId = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug[0]
    : resolvedParams.slug;
  const postId = Array.isArray(resolvedParams.slug2)
    ? resolvedParams.slug2[0]
    : resolvedParams.slug2;

  const comments = await getFullComments(postId);
  const postLikes = await getPostLikes(postId);

  return (
    <SinglePostContent 
    postId={postId} 
    comments={comments} 
    postLikes={postLikes} 
    commentsContent={
      <CommentThread comments={comments} postId={postId} communityId={communityId}  />
    }
    
    />
  );
  }
