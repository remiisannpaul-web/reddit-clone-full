"use server"

import { headers } from "next/headers";
import { auth } from "./auth";



export default async function getUserId() {
    const session = await auth.api.getSession({
        headers: await headers(),
      });
    
      if (!session?.user?.id) {
        return null;
      }

      return session.user.id
} 
  