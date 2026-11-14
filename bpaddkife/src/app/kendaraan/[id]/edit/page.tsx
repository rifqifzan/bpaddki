import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Card, EmptyState, PageHeader, ButtonLink } from "@/components/ui";
import { Icon } from "@/components/icons";
import { VehicleEdit } from "./vehicle-edit";

export const metadata: Metadata = {
  title: "Ubah kendaraan",
};

function EditFallback() {
  return (
    <div>
      <div className="mb-4 h-4 w-28 animate-pulse rounded bg-zinc-200" />
      <div className="mb-2 h-8 w-56 animate-pulse rounded bg-zinc-200" />
      <div className="mb-6 h-4 w-72 animate-pulse rounded bg-zinc-100" />
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-white" />
        <div className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-white" />
      </div>
    </div>
  );
}

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
      <PageHeader eyebrow="Data kendaraan" title="Kendaraan tidak ditemukan" />
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

export default function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EditFallback />}>
      {params.then(({ id }) => {
        const kendaraanId = Number(id);
        if (!Number.isSafeInteger(kendaraanId) || kendaraanId < 1) {
          return <InvalidVehicle />;
        }
        return (
          <div>
            <Link
              href={`/kendaraan/${kendaraanId}`}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
            >
              <Icon name="arrow-left" className="h-4 w-4" />
              Kembali ke detail
            </Link>
            <PageHeader
              eyebrow="Data kendaraan"
              title="Ubah kendaraan"
              description="Perbarui identitas, kondisi, status, atau pengelola kendaraan."
            />
            <VehicleEdit id={kendaraanId} />
          </div>
        );
      })}
    </Suspense>
  );
}
