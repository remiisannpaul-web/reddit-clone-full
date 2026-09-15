import { signOut } from "./actions/auth";
import RelatedPostsFeed from "@/components/postsDisplayer/relatedPostsFeed";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;



export default async function Home() {

    const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    const userId = session?.user?.id;
  
    if (!userId) {
      // User is not signed in
      return null;
    }
        
  const logSessionDetails = async () => {
    "use server"
    console.log(session);

  }

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4">
      <RelatedPostsFeed userId={userId} />
      
      <form action={logSessionDetails.bind(null, session)}>
        <button type="submit" >Log user info</button>
      </form>
      <form action={signOut}>
        <button type="submit">Sign Out</button>
      </form>
  
    </div>
  );
}
