"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { isActive, navigation } from "@/lib/navigation";
import { Icon } from "./icons";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-3 lg:pb-4">
      {navigation.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition lg:shrink",
              active
                ? "bg-zinc-900 font-medium text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            <Icon
              name={item.icon}
              className={cn(
                "h-4 w-4",
                active ? "text-white" : "text-zinc-400",
              )}
            />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarNavFallback() {
  return (
    <nav
      aria-hidden="true"
      className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-3 lg:pb-4"
    >
      {navigation.map((item) => (
        <span
          key={item.href}
          className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 lg:shrink"
        >
          <Icon name={item.icon} className="h-4 w-4 text-zinc-400" />
          <span className="whitespace-nowrap">{item.label}</span>
        </span>
      ))}
    </nav>
  );
}
