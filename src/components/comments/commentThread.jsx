import { getCommuntityRole } from "@/app/actions/communityMembers";
import getUserId from "@/lib/getUserId";
import CommentItem from "./commentItem";

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





export default async function CommentThread({
  comments,
  postId,
  communityId,
}) {
  const userId = await getUserId();
  const userRole = communityId
    ? await getCommuntityRole(userId, communityId)
    : null;
  
  
  if (!comments?.length) {
    return (
      <p className="mt-6 text-center text-sm text-zinc-500">
        No comments yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-1">
      {comments.map((comment, index) => (
        <CommentItem
          key={`${comment.name}-${comment.created_at}-${index}`}
          comment={comment}
          communityId={communityId}
          postId={postId}
          isLast={index === comments.length - 1}
          userRole={userRole}
          currentUserId={userId}
        />
      ))}
    </div>
  );
}
