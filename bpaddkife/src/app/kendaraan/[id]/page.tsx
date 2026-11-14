import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  Card,
  EmptyState,
  PageHeader,
  ButtonLink,
} from "@/components/ui";
import {
  VehicleDetail,
  VehicleDetailSkeleton,
} from "@/components/vehicle-detail";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Detail kendaraan",
};

function InvalidVehicle() {
  return (
    <div>
      <Link
        href="/kendaraan"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Semua kendaraan
      </Link>
      <PageHeader eyebrow="Detail kendaraan" title="Kendaraan tidak ditemukan" />
      <Card>
        <EmptyState
          title="ID kendaraan tidak valid"
          description="Periksa kembali tautan yang Anda buka atau pilih kendaraan dari daftar."
          action={
            <ButtonLink href="/kendaraan" variant="secondary" size="sm">
              Kembali ke daftar
            </ButtonLink>
          }
        />
      </Card>
    </div>
  );
}

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<VehicleDetailSkeleton />}>
      {params.then(({ id }) => {
        const kendaraanId = Number(id);
        if (!Number.isSafeInteger(kendaraanId) || kendaraanId < 1) {
          return <InvalidVehicle />;
        }
        return <VehicleDetail id={kendaraanId} />;
      })}
    </Suspense>
  );
}
