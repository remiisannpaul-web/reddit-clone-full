"use client";

import { CircleX, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  promoteToModerator,
  removeMember,
  removeModerator,
} from "@/app/actions/communityMembers";
import MemberBanPopover from "@/components/commandPanels/memberBanPopover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SearchUsersPanel({
  members = [],
  communityId,
  userRole,
  userId,
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleRemoveMember(memberUserId) {
    await removeMember(memberUserId, communityId);
    router.refresh();
  }

  async function handlePromoteMember(memberUserId) {
    await promoteToModerator(memberUserId, communityId, userId);
    router.refresh();
  }

  async function handleRemoveModerator(memberUserId) {
    await removeModerator(memberUserId, communityId, userId);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border px-4 py-2"
      >
        Search Users
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Search Users</DialogTitle>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Search users..." />

            <CommandList>
              {members.map((member) => (
                <CommandItem
                  key={member.id}
                  value={member.name}
                  //onSelect={() => {
                  //window.location.href = `/u/${member.name}`;
                  //}}
                >
                  <UserIcon className="w-4 h-4" />
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col">
                      <span>{member.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {member.role}
                        {member.is_banned ? " · Banned" : ""}
                      </span>
                    </div>
                    <div className="flex flex-row gap-2">
                      {userRole?.role === "Owner" &&
                      member.role === "Member" ? (
                        <button
                          className="rounded-2xl bg-red-300 p-3 text-xs"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handlePromoteMember(member.id);
                          }}
                        >
                          Promote to mod
                        </button>
                      ) : null}

                      {userRole?.role === "Owner" &&
                      member.role === "Moderator" ? (
                        <button
                          className="rounded-2xl bg-red-300 p-3 text-xs"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleRemoveModerator(member.id);
                          }}
                        >
                          Remove mod
                        </button>
                      ) : null}

                      {member.role === "Member" ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleRemoveMember(member.id);
                          }}
                        >
                          <CircleX className="h-8 w-8" />
                        </button>
                      ) : null}
                      <MemberBanPopover
                        member={member}
                        communityId={communityId}
                      />
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
