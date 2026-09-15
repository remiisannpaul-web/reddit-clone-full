import { getSpecificCommunity } from "@/app/actions/communities"
import Image from "next/image";
import Link from "next/link";
import { isCommunityMember, toggleCommunityMembership } from "@/app/actions/communities";
import { getCommunityNamesAndRoles, getCommuntityRole } from "@/app/actions/communityMembers";
import SearchUsersPanel from "@/components/commandPanels/page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import getUserId from "@/lib/getUserId";
import InfinitePostScroll from "@/components/postsDisplayer/infinitePostScroll";
import { CommunityMembershipButton } from "@/components/buttons/communityMembershipButton";      
 
// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;


export default async function CommunityPage({ params }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  const resolvedParams = await params;
  const id = Array.isArray(resolvedParams?.slug)
    ? resolvedParams.slug[0]
    : resolvedParams?.slug;
  
  const communityDetails = await getSpecificCommunity(id);

  if (!communityDetails) {
    return <div>Community not found.</div>;
  }

  const userId = await getUserId();
  const userRole = await getCommuntityRole(userId, communityDetails.id);

  const joined = await isCommunityMember(communityDetails.id);
  const communityMembers = userRole?.role === "Owner"
    ? await getCommunityNamesAndRoles(communityDetails.id)
    : [];

  const createdAt = communityDetails.created_at
    ? new Date(communityDetails.created_at).toLocaleDateString()
    : "Unknown";




  console.log(userRole)

const logDetails = async () => {
"use server"
console.log(userId)
}


  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <section className="overflow-hidden rounded-xl border bg-white shadow">
        {communityDetails.banner_url ? (
          <Image
            src={communityDetails.banner_url}
            alt={`${communityDetails.name} banner`}
            className="h-44 w-full object-cover"
            width={1200}
            height={176}
          />
        ) : (
          <div className="h-44 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />
        )}

        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            {communityDetails.icon_url ? (
              <Image
                src={communityDetails.icon_url}
                alt={`${communityDetails.name} icon`}
                className="h-20 w-20 rounded-full border-4 border-white object-cover bg-white"
                width={80}
                height={80}
              />
            ) : (
              <div className="h-20 w-20 rounded-full border-4 border-white bg-zinc-200 flex items-center justify-center text-2xl font-bold text-zinc-700">
                {communityDetails.name?.[0]?.toUpperCase() ?? "C"}
              </div>
            )}

            <div className="pb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between w-full">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  r/{communityDetails.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Created {createdAt}
                </p>
              </div>

              <div className="flex items-center gap-2">

               {userRole?.role === "Owner" ? (
                 <SearchUsersPanel members={communityMembers} communityId={communityDetails.id} userRole={userRole} userId={userId} />
               ) : null}
            
            <CommunityMembershipButton communityId={communityDetails.id} joined={joined} />

                <Link
                  href={`/communities/${communityDetails.id}/create-post`}
                  className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/80 transition-colors"
                >
                  Create Post
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 rounded-xl border bg-white shadow p-6">
          <h2 className="text-xl font-semibold mb-3">About this community</h2>
          <p className="text-muted-foreground leading-relaxed">
            {communityDetails.description || "No description yet."}
          </p>
        </section>

        <aside className="rounded-xl border bg-white shadow p-6 space-y-3">
          <h3 className="text-lg font-semibold">Community Info</h3>
          <div className="text-sm">
            <span className="font-medium">Name: </span>
            {communityDetails.name}
          </div>
          <div className="text-sm">
            <span className="font-medium">Community ID: </span>
            {communityDetails.id}
          </div>
          <div className="text-sm">
            <span className="font-medium">Created: </span>
            {createdAt}
          </div>
          <form action={logDetails}>
                <button type="submit">
                  Log Details
                </button>
                </form>
        </aside>
      </div>


     
   <InfinitePostScroll communityId={communityDetails.id}/>

    </div>
  );
}