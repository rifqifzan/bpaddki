import type { IconName } from "@/components/icons";

export interface NavigationItem {
  href: string;
  label: string;
  icon: IconName;
}

export const navigation: NavigationItem[] = [
  { href: "/", label: "Ringkasan", icon: "grid" },
  { href: "/kendaraan", label: "Kendaraan", icon: "car" },
  { href: "/penugasan", label: "Penugasan", icon: "key" },
  { href: "/perawatan", label: "Perawatan", icon: "wrench" },
  { href: "/riwayat-kondisi", label: "Riwayat Kondisi", icon: "history" },
  { href: "/pns", label: "PNS", icon: "users" },
  { href: "/pd", label: "Perangkat Daerah", icon: "building" },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
