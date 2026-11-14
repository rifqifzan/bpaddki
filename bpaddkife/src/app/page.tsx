"use client";

import Link from "next/link";
import {
  formatDate,
  isPastDate,
} from "@/lib/format";
import {
  kondisiLabels,
  kondisiTones,
  statusKendaraanLabels,
  statusKendaraanTones,
} from "@/lib/domain";
import type {
  Kendaraan,
  Paginated,
  PenugasanKendaraan,
  StatistikKendaraan,
} from "@/lib/types";
import { useApiData } from "@/lib/use-api";
import {
  Badge,
  Banner,
  ButtonLink,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  SectionHeader,
  StatCard,
} from "@/components/ui";
import { Icon } from "@/components/icons";

const kondisiBarColors: Record<string, string> = {
  BAIK: "bg-emerald-500",
  RUSAK_RINGAN: "bg-amber-500",
  RUSAK_BERAT: "bg-red-500",
  DALAM_PERBAIKAN: "bg-blue-500",
};

export default function DashboardPage() {
  const stats = useApiData<StatistikKendaraan>("/kendaraan/statistik");
  const vehicles = useApiData<Paginated<Kendaraan>>(
    "/kendaraan?limit=100&sortBy=nopol&sortOrder=asc",
  );
  const assignments = useApiData<Paginated<PenugasanKendaraan>>(
    "/penugasan?status=AKTIF&limit=5&sortBy=tanggalMulai&sortOrder=desc",
  );

  const attention = (vehicles.data?.data ?? [])
    .filter(
      (vehicle) =>
        vehicle.kondisi !== "BAIK" || isPastDate(vehicle.tanggalPajak),
    )
    .slice(0, 5);

  const total = stats.data?.total ?? 0;
  const needsAttention =
    stats.data?.perluPerhatian ?? attention.length ?? 0;

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Ringkasan operasional"
        description="Pantau kondisi kendaraan dinas, keterlambatan pajak, dan PNS yang sedang bertanggung jawab."
        actions={
          <>
            <ButtonLink href="/kendaraan/baru" icon="plus">
              Kendaraan baru
            </ButtonLink>
            <ButtonLink href="/riwayat-kondisi" variant="secondary" icon="history">
              Catat kondisi
            </ButtonLink>
          </>
        }
      />

      {stats.error ? (
        <Banner tone="error">
          Statistik gagal dimuat: {stats.error}
          <button
            type="button"
            onClick={stats.reload}
            className="ml-2 font-medium underline underline-offset-2"
          >
            Coba lagi
          </button>
        </Banner>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total kendaraan"
          value={stats.loading ? "…" : total}
          hint="Seluruh unit terdaftar"
          icon="car"
          tone="zinc"
        />
        <StatCard
          label="Tersedia"
          value={stats.loading ? "…" : (stats.data?.byStatus.TERSEDIA ?? 0)}
          hint="Siap digunakan"
          icon="check"
          tone="emerald"
        />
        <StatCard
          label="Digunakan"
          value={stats.loading ? "…" : (stats.data?.byStatus.DIGUNAKAN ?? 0)}
          hint="Memiliki penugasan aktif"
          icon="key"
          tone="blue"
        />
        <StatCard
          label="Perlu perhatian"
          value={stats.loading ? "…" : needsAttention}
          hint={`${stats.data?.pajakKedaluwarsa ?? 0} pajak kedaluwarsa`}
          icon="alert"
          tone={needsAttention > 0 ? "amber" : "emerald"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            title="Kondisi kendaraan"
            description="Distribusi kondisi terkini seluruh unit."
          />
          <div className="space-y-4 px-5 py-4">
            {stats.loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-100" />
                    <div className="h-2 animate-pulse rounded-full bg-zinc-100" />
                  </div>
                ))}
              </div>
            ) : (
              Object.entries(stats.data?.byKondisi ?? {}).map(
                ([kondisi, count]) => {
                  const percentage =
                    total > 0 ? Math.round((count / total) * 100) : 0;
                  const label =
                    kondisiLabels[kondisi as keyof typeof kondisiLabels];
                  return (
                    <div key={kondisi}>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <Badge
                          tone={kondisiTones[kondisi as keyof typeof kondisiTones]}
                        >
                          {label}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          <span className="font-medium text-zinc-800">
                            {count}
                          </span>{" "}
                          unit · {percentage}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className={`h-full rounded-full ${kondisiBarColors[kondisi] ?? "bg-zinc-400"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Status operasional"
            description="Kondisi pemakaian kendaraan saat ini."
          />
          <div className="divide-y divide-zinc-100">
            {stats.loading ? (
              <div className="space-y-4 px-5 py-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-5 animate-pulse rounded bg-zinc-100"
                  />
                ))}
              </div>
            ) : (
              Object.entries(stats.data?.byStatus ?? {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400">
                        <Icon name="car" className="h-4 w-4" />
                      </span>
                      <Badge
                        tone={
                          statusKendaraanTones[
                            status as keyof typeof statusKendaraanTones
                          ]
                        }
                      >
                        {
                          statusKendaraanLabels[
                            status as keyof typeof statusKendaraanLabels
                          ]
                        }
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">
                      {count}
                      <span className="ml-1 text-xs font-normal text-zinc-400">
                        unit
                      </span>
                    </span>
                  </div>
                ),
              )
            )}
          </div>
          <div className="border-t border-zinc-100 px-5 py-3">
            <Link
              href="/kendaraan"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Lihat semua kendaraan
              <Icon name="arrow-right" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            title="Perlu perhatian"
            description="Kondisi tidak baik atau pajak sudah lewat."
            actions={
              <Link
                href="/kendaraan"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
              >
                Semua
              </Link>
            }
          />
          {vehicles.loading ? (
            <div className="space-y-3 px-5 py-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-zinc-100"
                />
              ))}
            </div>
          ) : vehicles.error ? (
            <ErrorState message={vehicles.error} onRetry={vehicles.reload} />
          ) : attention.length === 0 ? (
            <EmptyState
              title="Semua kendaraan dalam kondisi baik"
              description="Tidak ada kondisi rusak atau pajak kedaluwarsa saat ini."
            />
          ) : (
            <div className="divide-y divide-zinc-100">
              {attention.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/kendaraan/${vehicle.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-zinc-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {vehicle.nopol}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {vehicle.merek} {vehicle.tipe}
                      {vehicle.pd ? ` · ${vehicle.pd.singkatan ?? vehicle.pd.nama}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {vehicle.kondisi !== "BAIK" ? (
                      <Badge tone={kondisiTones[vehicle.kondisi]}>
                        {kondisiLabels[vehicle.kondisi]}
                      </Badge>
                    ) : null}
                    {isPastDate(vehicle.tanggalPajak) ? (
                      <span className="text-[11px] font-medium text-red-600">
                        Pajak {formatDate(vehicle.tanggalPajak)}
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader
            title="Penanggung jawab aktif"
            description="PNS yang sedang memegang kendaraan."
            actions={
              <Link
                href="/penugasan"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
              >
                Semua
              </Link>
            }
          />
          {assignments.loading ? (
            <div className="space-y-3 px-5 py-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-zinc-100"
                />
              ))}
            </div>
          ) : assignments.error ? (
            <ErrorState
              message={assignments.error}
              onRetry={assignments.reload}
            />
          ) : (assignments.data?.data ?? []).length === 0 ? (
            <EmptyState
              title="Belum ada penugasan aktif"
              description="Tugaskan PNS melalui menu Penugasan atau halaman detail kendaraan."
              action={
                <ButtonLink
                  href="/penugasan"
                  size="sm"
                  variant="secondary"
                  icon="plus"
                >
                  Tugaskan PNS
                </ButtonLink>
              }
            />
          ) : (
            <div className="divide-y divide-zinc-100">
              {(assignments.data?.data ?? []).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {assignment.pns?.nama ?? `PNS #${assignment.pnsId}`}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {assignment.kendaraan?.nopol ?? `Kendaraan #${assignment.kendaraanId}`}
                      {assignment.pns?.jabatan
                        ? ` · ${assignment.pns.jabatan}`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                    {assignment.peran === "PENANGGUNG_JAWAB"
                      ? "Penanggung jawab"
                      : "Pengemudi"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
