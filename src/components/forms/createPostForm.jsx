"use client"

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/api-url";

async function createPost({ communityId, title, content }) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/create/${communityId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
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
        `Could not reach the API at ${API_BASE_URL}. Make sure the API gateway is running.`,
      );
    }

    throw error;
  }

  }
 



export default function CreatePostForm({ communityId, communityName }) {

  const [formData, setFormData] = useState({ title: "", content: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
     toast.success("Post created successfully!");
    },
    onError: (error) => {
      toast.error(error.message ?? "Database error");
    },
    })

  return (
    <form
      className="w-full max-w-6xl mx-auto rounded-xl border border-zinc-800 bg-[#0b141a] text-zinc-100 p-6 md:p-8 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({
          communityId: communityId,
          title: formData.title,
          content: formData.content
        });
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-4xl font-bold tracking-tight">Create post</h1>
        <div className="text-sm text-zinc-400">
          Drafts <span className="text-zinc-200 ml-1">1</span>
        </div>
      </div>

      <div className="inline-flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-3">
        <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
          r/
        </div>
        <span className="font-semibold">r/{communityName || "community"}</span>
      </div>

      <div className="flex items-center gap-6 border-b border-zinc-800">
        <button
          type="button"
          className="pb-3 text-sm font-semibold border-b-2 border-blue-500 text-blue-400"
        >
          Text
        </button>
      </div>

      <div>
        <input
          onChange={handleChange}
          value={formData.title}
          name="title"
          type="text"
          maxLength={300}
          placeholder="Title*"
          aria-label="Title"
          className="w-full rounded-2xl border border-red-500/70 bg-transparent px-5 py-4 text-lg placeholder:text-zinc-400 focus:outline-none focus:border-red-400"
          required
        />
        <div className="mt-2 text-right text-sm text-zinc-400">
          {formData.title.length}/300
        </div>
      </div>

      <button
        type="button"
        className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700 transition-colors"
      >
        Add tags
      </button>

      <div className="rounded-2xl border border-zinc-700 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 text-zinc-400 text-sm">
          <div className="flex items-center gap-4">
            <span>B</span>
            <span>I</span>
            <span>S</span>
            <span>Link</span>
            <span>List</span>
          </div>
          <button type="button" className="font-semibold hover:text-zinc-200">
            Switch to Markdown
          </button>
        </div>
        <textarea
          onChange={handleChange}
          value={formData.content}
          name="content"
          rows={8}
          placeholder="Body text*"
          className="w-full resize-none bg-transparent px-5 py-4 text-base placeholder:text-zinc-400 focus:outline-none"
          required
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="rounded-full bg-zinc-800 px-5 py-2.5 font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          Save Draft
        </button>
        <button
          type="submit"
          className="rounded-full bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Post
        </button>
      </div>
    </form>
  );
}
