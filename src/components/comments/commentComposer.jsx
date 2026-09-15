"use client";

import { useRef, useState } from "react";
import { Image } from "lucide-react";
import { addComment } from "@/app/actions/comment";

export default function CommentComposer({ postId }) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const textareaRef = useRef(null);

  const handleExpand = () => {
    setExpanded(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleCancel = () => {
    setComment("");
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={handleExpand}
        className="w-full rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-left text-sm text-zinc-500 hover:border-zinc-600 transition-colors"
      >
        Join the conversation
      </button>
    );
  }

  return (
    <form
      action={addComment.bind(null, postId)}
      className="rounded-2xl border border-zinc-700 bg-zinc-900 overflow-hidden"
    >
      <textarea
        ref={textareaRef}
        name="content"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Join the conversation"
        rows={4}
        required
        className="w-full resize-y bg-transparent px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none min-h-[120px]"
      />

      <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Add image"
            className="p-2 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Image className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded-md text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            GIF
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded-md text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            Aa
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!comment.trim()}
            className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comment
          </button>
        </div>
      </div>
    </form>
  );
}
