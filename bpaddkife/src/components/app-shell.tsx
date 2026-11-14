import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Icon } from "./icons";
import { SidebarNav, SidebarNavFallback } from "./sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-zinc-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <Link
          href="/"
          className="flex items-center gap-3 px-5 py-4 lg:py-5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Icon name="car" className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight text-zinc-900">
              Kendaraan Dinas
            </span>
            <span className="block text-[11px] uppercase tracking-[0.12em] text-zinc-400">
              Operasional
            </span>
          </span>
        </Link>

        <Suspense fallback={<SidebarNavFallback />}>
          <SidebarNav />
        </Suspense>

        <div className="hidden border-t border-zinc-100 px-5 py-4 lg:block">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            Sistem Informasi
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Pemantauan kondisi, penugasan PNS, dan perawatan kendaraan dinas.
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
