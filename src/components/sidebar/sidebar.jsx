"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Home,
  Flame,
  Users,
  Trophy,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  UserPen,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Home",
    icon: Home,
    href: "/",
  },
  {
    title: "Popular",
    icon: Flame,
    href: "/popular",
  },
  {
    title: "Communities",
    icon: Users,
    href: "/communities",
  },
  {
    title: "Top",
    icon: Trophy,
    href: "/top",
  },
  {
    title: "Profile",
    icon: UserPen,
    href: "/profile"
  }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex h-full shrink-0 flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        {!collapsed && (
          <h1 className="text-xl font-bold">
            RedditClone
          </h1>
        )}

        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-2 hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2",
                "text-sm font-medium",
                "hover:bg-muted transition-colors",
                collapsed
                  ? "justify-center"
                  : "gap-3"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />

              {!collapsed && (
                <span>{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center rounded-lg px-3 py-2",
            "text-sm font-medium hover:bg-muted",
            collapsed
              ? "justify-center"
              : "gap-3"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />

          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}