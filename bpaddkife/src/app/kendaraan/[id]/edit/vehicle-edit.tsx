"use client";

import Link from "next/link";
import type { Kendaraan } from "@/lib/types";
import { useApiData } from "@/lib/use-api";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { Icon } from "@/components/icons";
import { Card, ErrorState } from "@/components/ui";

export function VehicleEdit({ id }: { id: number }) {
  const vehicle = useApiData<Kendaraan>(`/kendaraan/${id}`);

  if (vehicle.error && (!vehicle.data || vehicle.data.id !== id)) {
    return (
      <div>
        <Link
          href={`/kendaraan/${id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          Kembali ke detail
        </Link>
        <Card>
          <ErrorState message={vehicle.error} onRetry={vehicle.reload} />
        </Card>
      </div>
    );
  }

  if (!vehicle.data || vehicle.data.id !== id) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-white" />
        <div className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-white" />
        <div className="h-40 animate-pulse rounded-xl border border-zinc-200 bg-white" />
      </div>
    );
  }

  return <VehicleForm initial={vehicle.data} cancelHref={`/kendaraan/${id}`} />;
}
