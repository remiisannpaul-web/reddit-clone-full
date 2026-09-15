"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function Communities() {
  
  const { data: communities, isLoading, isError, } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => { 
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/communities`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch communities");
    } 
    
    return response.json();

    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  })
 
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading communities.</div>;
  }
   
  return (
    <div>
 <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow border p-6 mb-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">All Communities</h2>
        <Link href="/communities/create" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </Link>
      </div>
      <ul className="space-y-4">
        {communities?.map((community) => (
          <li
            key={community.name}
            className="p-4 rounded-lg border hover:bg-muted/40 transition"
          >
            <Link href={`/communities/${community.id}`}>
              <div className="font-semibold text-lg">{community.name}</div>
              <div className="text-sm text-muted-foreground">{community.description}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
    
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow border p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold tracking-tight">My Communities</h2>

    </div>
    <ul className="space-y-4">
      {communities?.map((community) => (
        <li
          key={community.name}
          className="p-4 rounded-lg border hover:bg-muted/40 transition"
        >
          <div className="font-semibold text-lg">{community.name}</div>
          <div className="text-sm text-muted-foreground">{community.description}</div>
        </li>
      ))}
    </ul>
  </div>
</div>
  );
}