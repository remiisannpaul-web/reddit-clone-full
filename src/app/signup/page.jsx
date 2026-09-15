"use client"

import { FaGithub } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa6";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Signup() {
    const router = useRouter();
    const [_loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    async function handleSubmit(e) {
      e.preventDefault();
      setError("");
      setLoading(true);
      const form = e.currentTarget;
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;
      const image = form.image.value;
      const { data, error } = await authClient.signUp.email(
        {
          email,
          password,
          name,
          ...(image ? { image } : {}),
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => setLoading(true),
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (ctx) => {
            setError(ctx.error.message);
          },
        },
      );
      setLoading(false);
      if (error) setError(error.message);
      else if (data) router.push("/dashboard");
    }

    const handleGithubSignUp = async () => {
      const { data, error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard", 
        errorCallbackURL: "/error",
        newUserCallbackURL: "/welcome",
      });
      if (error) setError(error.message);
      // When `disableRedirect` is NOT set, better-auth should handle the redirect for us.
      // If for some reason it returns a URL without redirecting, do it manually.
      if (data?.redirect === false && data.url) {
        window.location.href = data.url;
      }
    }

    const handleGoogleSignUp = async () => {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/error",
        newUserCallbackURL: "/welcome",
      });
      if (error) setError(error.message);
      if (data?.redirect === false && data.url) {
        window.location.href = data.url;
      }
    }

    return (
     <div className="flex flex-col items-center justify-center min-h-[70vh]">
       <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
         <h2 className="text-2xl font-bold mb-8 text-center text-primary">Sign Up</h2>
         {error && (
           <div className="text-red-500 text-sm text-center mb-4">
             {error}
           </div>
         )}
         <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
           <div>
             <label htmlFor="name" className="block text-sm font-medium mb-1">
               Name
             </label>
             <input
               type="text"
               id={useId()}
               name="name"
               autoComplete="name"
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
               required
             />
           </div>
           <div>
             <label htmlFor="email" className="block text-sm font-medium mb-1">
               Email
             </label>
             <input
               type="email"
               id={useId()}
               name="email"
               autoComplete="email"
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
               required
             />
           </div>
           <div>
             <label htmlFor="password" className="block text-sm font-medium mb-1">
               Password
             </label>
             <input
               type="password"
               id={useId()}
               name="password"
               autoComplete="new-password"
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
               required
             />
           </div>
           <div>
             <label htmlFor="image" className="block text-sm font-medium mb-1">
               Profile Image
             </label>
             <input
               type="text"
               id={useId()}
               name="image"
               className="w-full px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:border-primary"
             />
           </div>
           <button
             type="submit"
             className="mt-4 w-full flex justify-center items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors font-semibold"
           >
             Sign Up
           </button>
         </form>


        <button type="button" className="mt-4 w-full flex justify-center items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors font-semibold" onClick={handleGithubSignUp}>
          <FaGithub className="mr-2 size-4" />
          Sign Up with Github
        </button>
        <button type="button" className="mt-4 w-full flex justify-center items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors font-semibold" onClick={handleGoogleSignUp}>
          <FaGoogle className="mr-2 size-4" />
          Sign Up with Google
        </button>

       </div>
     </div>
  )
}