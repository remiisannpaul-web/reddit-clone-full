"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gavel } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { removeBan, upsertBan } from "@/app/actions/bannedUsers";

const PERMISSION_FIELDS = [
  { key: "can_post", label: "Can post" },
  { key: "can_comment", label: "Can comment" },
  { key: "can_vote", label: "Can vote" },
  { key: "can_view", label: "Can view" },
];

const BAN_DEFAULTS = {
  can_post: false,
  can_comment: false,
  can_vote: false,
  can_view: true,
};

function toBanPermissions(member) {
  if (!member.is_banned) {
    return { ...BAN_DEFAULTS };
  }
  return {
    can_post: member.ban_can_post ?? false,
    can_comment: member.ban_can_comment ?? false,
    can_vote: member.ban_can_vote ?? false,
    can_view: member.ban_can_view ?? true,
  };
}

function toExpiresAtInputValue(expiresAt) {
  if (!expiresAt) return "";
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function MemberBanPopover({ member, communityId }) {
  const router = useRouter();
  const [permissions, setPermissions] = useState(() => toBanPermissions(member));
  const [reason, setReason] = useState(member.ban_reason ?? "");
  const [expiresAt, setExpiresAt] = useState(() =>
    toExpiresAtInputValue(member.ban_expires_at)
  );
  const [saving, setSaving] = useState(false);

  const isOwner = member.role === "Owner";
  const isBanned = Boolean(member.is_banned);

  async function saveBan(nextPermissions = permissions) {
    setSaving(true);
    try {
      await upsertBan(member.id, communityId, {
        ...nextPermissions,
        reason,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(key) {
    const next = { ...permissions, [key]: !permissions[key] };
    setPermissions(next);
    await saveBan(next);
  }

  async function handleLiftBan() {
    setSaving(true);
    try {
      await removeBan(member.id, communityId);
      setPermissions({ ...BAN_DEFAULTS });
      setReason("");
      setExpiresAt("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Ban settings for ${member.name}`}
          className={`rounded-md p-1 hover:bg-muted ${isBanned ? "text-destructive" : ""}`}
          onClick={(e) => e.stopPropagation()}
          disabled={isOwner}
        >
          <Gavel className="h-8 w-8" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-64">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {member.name}
          {isBanned ? (
            <span className="ml-1 text-destructive">· Banned</span>
          ) : null}
        </p>

        {isOwner ? (
          <p className="text-xs text-muted-foreground">
            Community owners cannot be banned.
          </p>
        ) : (
          <>
            <p className="mb-2 text-xs text-muted-foreground">
              Restrictions while banned (unchecked = blocked).
            </p>
            <div className="mb-3 flex flex-col gap-2">
              {PERMISSION_FIELDS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={permissions[key]}
                    disabled={saving}
                    onChange={() => void handleToggle(key)}
                    className="size-4 rounded border"
                  />
                  {label}
                </label>
              ))}
            </div>

            <label htmlFor={`ban-reason-${member.id}`} className="mb-2 block text-xs font-medium">
              Reason
            </label>
            <textarea
              id={`ban-reason-${member.id}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={saving}
              maxLength={500}
              rows={2}
              placeholder="Optional"
              className="mb-3 w-full resize-none rounded-md border bg-background px-2 py-1 text-sm"
            />

            <label htmlFor={`ban-expires-${member.id}`} className="mb-1 block text-xs font-medium">
              Expires (optional)
            </label>
            <input
              id={`ban-expires-${member.id}`}
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={saving}
              className="mb-3 w-full rounded-md border bg-background px-2 py-1 text-sm"
            />

            <div className="flex flex-col gap-2">
              {!isBanned ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={saving}
                  onClick={() => void saveBan()}
                >
                  Ban user
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={() => void saveBan()}
                  >
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={saving}
                    onClick={() => void handleLiftBan()}
                  >
                    Lift ban
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
