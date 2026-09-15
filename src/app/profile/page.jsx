import getUserId from "@/lib/getUserId";
import { getUserDetails } from "../actions/user";
import { NameModifier, ModifyDisplayName } from "@/components/modifyProfile/modifyProfile";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ProfilePage() {

const userId = await getUserId();

if (!userId) {
    throw new Error("Unnautorized");
}

const userDetails = await getUserDetails(userId);

async function logDetails() {
    "use server"
    console.log("User Details:", userDetails)
}

return(
     
    <div>
     <div className="flex flex-row gap-[100px]">
        <NameModifier name={userDetails.name} userId={userId}/>
        <ModifyDisplayName display_name={userDetails.display_name} userId={userId}/>
     </div>
     
      <form action={logDetails}>
        <button type="submit">Log Details</button>
      </form>
    </div>
)


}