"use client";

import { useMutation } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/api-url";

async function patchUser({ userId, path = "", body }) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message ?? `Request failed (${response.status})`);
  }

  return result;
}

export function NameModifier({ name, userId }) {
  const [isModifyingName, setIsModifyingName] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const [newName, setNewName] = useState("");

  const changeNameMutation = useMutation({
    mutationFn: patchUser,
    onSuccess: () => {
      toast.success("User updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message ?? "Database error");
    },
  });

  const modifyNameFunction = async (e) => {
    e.preventDefault();

    try {
      await changeNameMutation.mutateAsync({ userId, body: { newName } });
      setIsModifyingName(false);
      setDisplayName(newName);
    } catch (error) {
      toast.error(error.message ?? "database error");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {isModifyingName ? (
        <form onSubmit={modifyNameFunction}>
          <input
            type="text"
            placeholder="New name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button className="bg-red-300 p-4 rounded-2xl" type="submit">
            Change Name
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <h1>{displayName}</h1>
          <PenLine
            size={18}
            className="cursor-pointer"
            onClick={() => setIsModifyingName(true)}
          />
        </div>
      )}
      <button onClick={() => console.log(name)} type="button">
        log details
      </button>
    </div>
  );
}

export function ModifyDisplayName({ display_name, userId }) {
  const [isModifyingDisplayName, setIsModifyingDisplayName] = useState(false);
  const [displayName, setDisplayName] = useState(display_name);
  const [newDisplayName, setNewDisplayName] = useState("");

  const modifyDisplayNameFunction = async (e) => {
    e.preventDefault();

    try {
      await patchUser({
        userId,
        path: "/display-name",
        body: { newDisplayName },
      });
      toast.success("display name changed successfully!");
      setIsModifyingDisplayName(false);
      setDisplayName(newDisplayName);
    } catch (error) {
      toast.error(error.message ?? "database error");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {isModifyingDisplayName ? (
        <form onSubmit={modifyDisplayNameFunction}>
          <input
            type="text"
            placeholder="New displayname"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            required
          />
          <button className="bg-red-300 p-4 rounded-2xl" type="submit">
            Change DisplayName
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <h1>
            {displayName === null
              ? "You currently have no display name"
              : displayName}
          </h1>
          <PenLine
            size={18}
            className="cursor-pointer"
            onClick={() => setIsModifyingDisplayName(true)}
          />
        </div>
      )}
      <button onClick={() => console.log(display_name)} type="button">
        log details
      </button>
    </div>
  );
}
