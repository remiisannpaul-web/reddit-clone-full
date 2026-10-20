"use client"

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";



export function CommunityMembershipButton({ communityId, joined }) {
    const [isJoined, setIsJoined] = useState(joined);
    const queryClient = useQueryClient();

    const mutation = useMutation({
      mutationFn: (nextIsJoined) =>
        toggleMembership(communityId, nextIsJoined),
      onMutate: (nextIsJoined) => {
      const previousIsJoined = isJoined;

        // Update the UI immediately
      setIsJoined(nextIsJoined);

        // Return data for rollback if the request fails
        return { previousIsJoined };
      },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["communityDetails", communityId] });
        },
      onError: (error, _nextIsJoined, context) => {
        setIsJoined(context?.previousIsJoined ?? joined);
            console.error("Error toggling membership:", error);
        },
    })

    return (
          <form onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(!isJoined);
              }}>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                    isJoined
                      ? "bg-zinc-900 text-white hover:bg-zinc-700 border-zinc-900"
                      : "hover:bg-muted"
                  }`}
                >
                  {mutation.isPending ? "Updating..." : isJoined ? "Joined" : "Join"}
                </button>
                {mutation.isError && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {mutation.error.message}
                  </p>
                )}
              </form>
    )
}


async function toggleMembership(communityId, isJoined) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const path = isJoined
    ? `/communities/membership/leave/regular/${communityId}`
    : `/communities/membership/join/regular/${communityId}`;
  const url = `${apiUrl}${path}`;

  try {
    const response = await fetch(url, {
      method: isJoined ? "DELETE" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const responseText = await response.text();
    let responseBody = null;

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }
    }

    if (!response.ok) {
      const serverMessage =
        typeof responseBody === "object" && responseBody?.message
          ? responseBody.message
          : `Request failed with status ${response.status}`;
      throw new Error(serverMessage);
    }

    return responseBody;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Could not reach the API at ${url}. Make sure the Nest server is running on ${apiUrl}.`,
      );
    }

    throw error;
  }
}