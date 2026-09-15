import CreatePostForm from "@/components/forms/createPostForm";
import { createPost } from "@/app/actions/posts";
import { getSpecificCommunity } from "@/app/actions/communities";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function CreatePostPage({ params }) {
  const { slug: communityId } = await params;
  const community = await getSpecificCommunity(communityId);

  if (!community) {
    return <div>Community not found.</div>;
  }

  return (
    <CreatePostForm
      communityId={communityId}
      communityName={community.name}
    />
  );
}
