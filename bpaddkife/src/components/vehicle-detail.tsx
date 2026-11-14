"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { api, errorMessage } from "@/lib/api";
import {
  kondisiLabels,
  kondisiTones,
  jenisPerawatanLabels,
  peranLabels,
  statusKendaraanLabels,
  statusKendaraanTones,
  statusPerawatanLabels,
  statusPerawatanTones,
} from "@/lib/domain";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  isPastDate,
} from "@/lib/format";
import type {
  Kendaraan,
  Paginated,
  PenugasanKendaraan,
  Perawatan,
  RiwayatKondisi,
} from "@/lib/types";
import { useApiData } from "@/lib/use-api";
import { Icon } from "@/components/icons";
import {
  Badge,
  Banner,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  SectionHeader,
  TableSkeleton,
} from "@/components/ui";
import { AssignmentModal } from "@/components/forms/assignment-modal";
import { ConditionModal } from "@/components/forms/condition-modal";
import { MaintenanceModal } from "@/components/forms/maintenance-modal";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-zinc-800">{value || "—"}</dd>
    </div>
  );
}

export function VehicleDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-4 w-28 rounded bg-zinc-200" />
      <div className="mb-2 h-8 w-56 rounded bg-zinc-200" />
      <div className="mb-6 h-4 w-72 rounded bg-zinc-100" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-64 rounded-xl border border-zinc-200 bg-white" />
          <div className="h-72 rounded-xl border border-zinc-200 bg-white" />
        </div>
        <div className="space-y-4">
          <div className="h-56 rounded-xl border border-zinc-200 bg-white" />
          <div className="h-48 rounded-xl border border-zinc-200 bg-white" />
        </div>
      </div>
    </div>
  );
}

export function VehicleDetail({ id }: { id: number }) {
  const router = useRouter();

  const vehicle = useApiData<Kendaraan>(`/kendaraan/${id}`);
  const assignments = useApiData<Paginated<PenugasanKendaraan>>(
    `/penugasan?kendaraanId=${id}&limit=100&sortBy=tanggalMulai&sortOrder=desc`,
  );
  const maintenances = useApiData<Paginated<Perawatan>>(
    `/perawatan?kendaraanId=${id}&limit=5&sortBy=tanggal&sortOrder=desc`,
  );
  const histories = useApiData<Paginated<RiwayatKondisi>>(
    `/kendaraan/${id}/riwayat-kondisi?limit=5&sortBy=tanggal&sortOrder=desc`,
  );

  const [assignOpen, setAssignOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [endTarget, setEndTarget] = useState<PenugasanKendaraan | null>(null);
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const activeAssignments = useMemo(
    () =>
      (assignments.data?.data ?? []).filter(
        (assignment) => assignment.status === "AKTIF",
      ),
    [assignments.data],
  );

  const penanggungJawab =
    activeAssignments.find(
      (assignment) => assignment.peran === "PENANGGUNG_JAWAB",
    ) ??
    (vehicle.data?.penugasanAktif?.peran === "PENANGGUNG_JAWAB"
      ? vehicle.data.penugasanAktif
      : null);

  const pengemudi = activeAssignments.filter(
    (assignment) => assignment.peran === "PENGEMUDI",
  );

  function reloadAll() {
    vehicle.reload();
    assignments.reload();
    maintenances.reload();
    histories.reload();
  }

  function handleSaved(text: string) {
    setAssignOpen(false);
    setConditionOpen(false);
    setMaintenanceOpen(false);
    setMessage(text);
    setActionError(null);
    reloadAll();
  }

  async function endAssignment() {
    if (!endTarget) return;
    setEnding(true);
    setEndError(null);
    try {
      await api.patch<PenugasanKendaraan>(`/penugasan/${endTarget.id}`, {
        status: "SELESAI",
      });
      setEndTarget(null);
      setMessage("Penugasan berhasil diakhiri.");
      setActionError(null);
      reloadAll();
    } catch (cause) {
      setEndError(errorMessage(cause));
    } finally {
      setEnding(false);
    }
  }

  async function removeVehicle() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/kendaraan/${id}`);
      router.push("/kendaraan");
      router.refresh();
    } catch (cause) {
      setDeleteError(errorMessage(cause));
      setDeleting(false);
    }
  }

  if (vehicle.loading && !vehicle.data) {
    return <VehicleDetailSkeleton />;
  }

  if (vehicle.error && (!vehicle.data || vehicle.data.id !== id)) {
    return (
      <div>
        <Link
          href="/kendaraan"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          Semua kendaraan
        </Link>
        <Card>
          <ErrorState message={vehicle.error} onRetry={vehicle.reload} />
        </Card>
      </div>
    );
  }

  if (!vehicle.data || vehicle.data.id !== id) return <VehicleDetailSkeleton />;

  const data = vehicle.data;
  const latestHistory =
    histories.data?.data?.[0] ?? data.riwayatKondisiTerbaru ?? null;

  return (
    <div>
      <Link
        href="/kendaraan"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Semua kendaraan
      </Link>

      <PageHeader
        eyebrow="Detail kendaraan"
        title={data.nopol}
        description={`${data.merek} ${data.tipe} · ${data.tahun} · ${data.warna}`}
        actions={
          <>
            <ButtonLink
              href={`/kendaraan/${id}/edit`}
              variant="primary"
              icon="edit"
            >
              Ubah
            </ButtonLink>
            <Button
              variant="secondary"
              icon="key"
              onClick={() => setAssignOpen(true)}
            >
              Tugaskan PNS
            </Button>
            <Button
              variant="secondary"
              icon="history"
              onClick={() => setConditionOpen(true)}
            >
              Catat kondisi
            </Button>
            <Button
              variant="secondary"
              icon="wrench"
              onClick={() => setMaintenanceOpen(true)}
            >
              Perawatan
            </Button>
            <Button
              variant="ghost"
              icon="trash"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                setDeleteError(null);
                setDeleteOpen(true);
              }}
            >
              Hapus
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge tone={kondisiTones[data.kondisi]}>
          {kondisiLabels[data.kondisi]}
        </Badge>
        <Badge tone={statusKendaraanTones[data.status]}>
          {statusKendaraanLabels[data.status]}
        </Badge>
        {data.pd ? (
          <Badge tone="violet">{data.pd.singkatan ?? data.pd.nama}</Badge>
        ) : (
          <Badge tone="zinc">Tanpa PD</Badge>
        )}
        {isPastDate(data.tanggalPajak) ? (
          <Badge tone="red">
            Pajak kedaluwarsa {formatDate(data.tanggalPajak)}
          </Badge>
        ) : null}
      </div>

      {message ? (
        <Banner tone="success" onClose={() => setMessage(null)}>
          {message}
        </Banner>
      ) : null}
      {actionError ? (
        <Banner tone="error" onClose={() => setActionError(null)}>
          {actionError}
        </Banner>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <SectionHeader
              title="Informasi kendaraan"
              description="Identitas unit dan status operasional terkini."
            />
            <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <InfoRow label="Nomor polisi" value={data.nopol} />
              <InfoRow
                label="Perangkat daerah"
                value={data.pd?.nama ?? "Belum ditentukan"}
              />
              <InfoRow label="Merek" value={data.merek} />
              <InfoRow label="Tipe / model" value={data.tipe} />
              <InfoRow label="Tahun" value={String(data.tahun)} />
              <InfoRow label="Warna" value={data.warna} />
              <InfoRow
                label="Odometer"
                value={`${formatNumber(data.odometer)} km`}
              />
              <InfoRow
                label="Jatuh tempo pajak"
                value={
                  data.tanggalPajak ? (
                    <span
                      className={
                        isPastDate(data.tanggalPajak)
                          ? "font-medium text-red-600"
                          : undefined
                      }
                    >
                      {formatDate(data.tanggalPajak)}
                    </span>
                  ) : (
                    "Belum diketahui"
                  )
                }
              />
              <InfoRow label="Nomor rangka" value={data.nomorRangka} />
              <InfoRow label="Nomor mesin" value={data.nomorMesin} />
              <div className="sm:col-span-2">
                <InfoRow
                  label="Catatan"
                  value={
                    data.catatan ? (
                      <span className="whitespace-pre-line">{data.catatan}</span>
                    ) : (
                      "Tidak ada catatan"
                    )
                  }
                />
              </div>
            </dl>
          </Card>

          <Card>
            <SectionHeader
              title="Riwayat kondisi"
              description="Jejak audit perubahan kondisi kendaraan."
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  icon="plus"
                  onClick={() => setConditionOpen(true)}
                >
                  Catat
                </Button>
              }
            />
            {histories.loading && !histories.data ? (
              <TableSkeleton columns={4} rows={3} />
            ) : histories.error ? (
              <ErrorState
                message={histories.error}
                onRetry={histories.reload}
              />
            ) : (histories.data?.data ?? []).length === 0 ? (
              <EmptyState
                title="Belum ada riwayat kondisi"
                description="Catat kondisi kendaraan untuk memulai jejak audit."
              />
            ) : (
              <div className="divide-y divide-zinc-100">
                {(histories.data?.data ?? []).map((history) => (
                  <div
                    key={history.id}
                    className="flex flex-col gap-1.5 px-5 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={kondisiTones[history.kondisi]}>
                          {kondisiLabels[history.kondisi]}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {formatDate(history.tanggal)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-700">
                        {history.keterangan ?? "Tanpa keterangan."}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-zinc-400">
                      {history.dicatatOleh
                        ? `Dicatat oleh ${history.dicatatOleh}`
                        : "Pencatat tidak dicantumkan"}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-zinc-100 px-5 py-3">
              <Link
                href="/riwayat-kondisi"
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                Lihat seluruh riwayat
                <Icon name="arrow-right" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="Perawatan terakhir"
              description="Servis, perbaikan, dan biaya kendaraan."
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  icon="plus"
                  onClick={() => setMaintenanceOpen(true)}
                >
                  Catat
                </Button>
              }
            />
            {maintenances.loading && !maintenances.data ? (
              <TableSkeleton columns={4} rows={3} />
            ) : maintenances.error ? (
              <ErrorState
                message={maintenances.error}
                onRetry={maintenances.reload}
              />
            ) : (maintenances.data?.data ?? []).length === 0 ? (
              <EmptyState
                title="Belum ada catatan perawatan"
                description="Catat servis atau perbaikan untuk melacak biaya dan odometer."
              />
            ) : (
              <div className="divide-y divide-zinc-100">
                {(maintenances.data?.data ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1.5 px-5 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="zinc">
                          {jenisPerawatanLabels[item.jenis]}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {formatDate(item.tanggal)}
                        </span>
                        <Badge tone={statusPerawatanTones[item.status]}>
                          {statusPerawatanLabels[item.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-700">
                        {item.deskripsi}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {item.bengkel ?? "Bengkel tidak dicatat"}
                        {item.odometer !== null
                          ? ` · ${formatNumber(item.odometer)} km`
                          : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-zinc-800">
                      {formatCurrency(item.biaya)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-zinc-100 px-5 py-3">
              <Link
                href="/perawatan"
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                Lihat seluruh perawatan
                <Icon name="arrow-right" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <SectionHeader
              title="Penanggung jawab"
              description="PNS yang bertanggung jawab atas unit ini."
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  icon="plus"
                  onClick={() => setAssignOpen(true)}
                >
                  Tugaskan
                </Button>
              }
            />
            {assignments.loading && !assignments.data ? (
              <div className="space-y-3 px-5 py-4">
                <div className="h-12 animate-pulse rounded-lg bg-zinc-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
              </div>
            ) : assignments.error ? (
              <ErrorState
                message={assignments.error}
                onRetry={assignments.reload}
              />
            ) : penanggungJawab?.pns ? (
              <div className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {penanggungJawab.pns.nama
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900">
                      {penanggungJawab.pns.nama}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {penanggungJawab.pns.jabatan}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      NIP {penanggungJawab.pns.nip} · Gol.{" "}
                      {penanggungJawab.pns.golongan}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-400">Mulai bertugas</dt>
                    <dd className="text-right text-zinc-700">
                      {formatDate(penanggungJawab.tanggalMulai)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-400">Perangkat daerah</dt>
                    <dd className="text-right text-zinc-700">
                      {penanggungJawab.pns.pd?.singkatan ??
                        penanggungJawab.pns.pd?.nama ??
                        "—"}
                    </dd>
                  </div>
                  {penanggungJawab.pns.telepon ? (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-zinc-400">Telepon</dt>
                      <dd className="text-right text-zinc-700">
                        <a
                          href={`tel:${penanggungJawab.pns.telepon}`}
                          className="hover:underline"
                        >
                          {penanggungJawab.pns.telepon}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {penanggungJawab.pns.email ? (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-zinc-400">Email</dt>
                      <dd className="max-w-[60%] break-all text-right text-zinc-700">
                        <a
                          href={`mailto:${penanggungJawab.pns.email}`}
                          className="hover:underline"
                        >
                          {penanggungJawab.pns.email}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEndError(null);
                      setEndTarget(penanggungJawab);
                    }}
                  >
                    Akhiri penugasan
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Belum ada penanggung jawab"
                description="Tugaskan PNS aktif sebagai penanggung jawab kendaraan ini."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="plus"
                    onClick={() => setAssignOpen(true)}
                  >
                    Tugaskan PNS
                  </Button>
                }
              />
            )}

            {pengemudi.length > 0 ? (
              <div className="border-t border-zinc-100 px-5 py-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Pengemudi aktif
                </p>
                <div className="space-y-2.5">
                  {pengemudi.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-zinc-800">
                          {assignment.pns?.nama ?? `PNS #${assignment.pnsId}`}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {peranLabels[assignment.peran]} ·{" "}
                          {formatDate(assignment.tanggalMulai)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEndError(null);
                          setEndTarget(assignment);
                        }}
                        className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        Akhiri
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <SectionHeader
              title="Ringkasan"
              description="Kondisi terakhir dan metadata data."
            />
            <div className="space-y-3 px-5 py-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Kondisi terakhir</span>
                <Badge tone={kondisiTones[data.kondisi]}>
                  {kondisiLabels[data.kondisi]}
                </Badge>
              </div>
              {latestHistory ? (
                <p className="text-xs leading-5 text-zinc-500">
                  {formatDate(latestHistory.tanggal)} ·{" "}
                  {latestHistory.keterangan ?? "Tanpa keterangan"}
                </p>
              ) : null}
              <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                <span className="text-zinc-500">Penugasan aktif</span>
                <span className="font-medium text-zinc-800">
                  {activeAssignments.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Terdaftar</span>
                <span className="text-xs text-zinc-600">
                  {formatDateTime(data.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Diperbarui</span>
                <span className="text-xs text-zinc-600">
                  {formatDateTime(data.updatedAt)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AssignmentModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        fixedKendaraan={data}
        onSaved={handleSaved}
      />
      <ConditionModal
        open={conditionOpen}
        onClose={() => setConditionOpen(false)}
        fixedKendaraan={data}
        onSaved={handleSaved}
      />
      <MaintenanceModal
        open={maintenanceOpen}
        onClose={() => setMaintenanceOpen(false)}
        fixedKendaraan={data}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(endTarget)}
        onClose={() => {
          setEndTarget(null);
          setEndError(null);
        }}
        onConfirm={endAssignment}
        title="Akhiri penugasan?"
        description={`Penugasan ${
          endTarget?.pns?.nama ?? "PNS ini"
        } akan ditandai selesai. Status kendaraan otomatis disesuaikan.`}
        confirmLabel="Akhiri penugasan"
        loading={ending}
        error={endError}
        tone="primary"
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteError(null);
        }}
        onConfirm={removeVehicle}
        title="Hapus kendaraan?"
        description="Kendaraan hanya dapat dihapus bila belum memiliki riwayat penugasan. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus kendaraan"
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
