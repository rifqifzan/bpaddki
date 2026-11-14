"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api, buildQuery, errorMessage } from "@/lib/api";
import {
  peranLabels,
  peranOptions,
  statusPenugasanLabels,
  statusPenugasanOptions,
  statusPenugasanTones,
} from "@/lib/domain";
import { formatDate } from "@/lib/format";
import type {
  Paginated,
  PenugasanKendaraan,
  PeranPenugasan,
  StatusPenugasan,
} from "@/lib/types";
import { useApiData } from "@/lib/use-api";
import { Icon } from "@/components/icons";
import {
  Badge,
  Banner,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Select,
  TableSkeleton,
} from "@/components/ui";
import { AssignmentModal } from "@/components/forms/assignment-modal";

interface Confirmation {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  success: string;
  run: () => Promise<void>;
}

export default function PenugasanPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusPenugasan | "">("");
  const [peran, setPeran] = useState<PeranPenugasan | "">("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PenugasanKendaraan | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const path = `/penugasan${buildQuery({
    page,
    limit: 10,
    search,
    status,
    peran,
    sortBy: "tanggalMulai",
    sortOrder: "desc",
  })}`;

  const list = useApiData<Paginated<PenugasanKendaraan>>(path);
  const hasFilter = Boolean(search || status || peran);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPeran("");
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(assignment: PenugasanKendaraan) {
    setEditing(assignment);
    setFormOpen(true);
  }

  function handleSaved(text: string) {
    setFormOpen(false);
    setEditing(null);
    setMessage(text);
    setActionError(null);
    list.reload();
  }

  function askEnd(assignment: PenugasanKendaraan) {
    setConfirmError(null);
    setConfirmation({
      title: "Akhiri penugasan?",
      description: `Penugasan ${
        assignment.pns?.nama ?? "PNS ini"
      } pada kendaraan ${
        assignment.kendaraan?.nopol ?? `#${assignment.kendaraanId}`
      } akan ditandai selesai. Status kendaraan disesuaikan otomatis.`,
      confirmLabel: "Akhiri penugasan",
      tone: "primary",
      success: "Penugasan berhasil diakhiri.",
      run: async () => {
        await api.patch<PenugasanKendaraan>(`/penugasan/${assignment.id}`, {
          status: "SELESAI",
        });
      },
    });
  }

  function askDelete(assignment: PenugasanKendaraan) {
    setConfirmError(null);
    setConfirmation({
      title: "Hapus penugasan?",
      description: `Riwayat penugasan ${
        assignment.pns?.nama ?? "PNS ini"
      } akan dihapus permanen dan status kendaraan disinkronkan ulang.`,
      confirmLabel: "Hapus penugasan",
      success: "Penugasan berhasil dihapus.",
      run: async () => {
        await api.delete(`/penugasan/${assignment.id}`);
      },
    });
  }

  async function runConfirmation() {
    if (!confirmation) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      await confirmation.run();
      setMessage(confirmation.success);
      setActionError(null);
      setConfirmation(null);
      list.reload();
    } catch (cause) {
      setConfirmError(errorMessage(cause));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Penugasan"
        title="Penugasan kendaraan"
        description="Tugaskan PNS sebagai penanggung jawab atau pengemudi kendaraan dinas."
        actions={
          <Button icon="plus" onClick={openCreate}>
            Tugaskan PNS
          </Button>
        }
      />

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

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <form
            id="penugasan-search"
            onSubmit={submitSearch}
            className="relative min-w-56 flex-1"
          >
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nopol, merek, atau nama PNS…"
              className="pl-9"
              aria-label="Cari penugasan"
            />
          </form>
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusPenugasan | "");
              setPage(1);
            }}
            className="w-auto"
            aria-label="Filter status penugasan"
          >
            <option value="">Semua status</option>
            {statusPenugasanOptions.map((option) => (
              <option key={option} value={option}>
                {statusPenugasanLabels[option]}
              </option>
            ))}
          </Select>
          <Select
            value={peran}
            onChange={(event) => {
              setPeran(event.target.value as PeranPenugasan | "");
              setPage(1);
            }}
            className="w-auto"
            aria-label="Filter peran"
          >
            <option value="">Semua peran</option>
            {peranOptions.map((option) => (
              <option key={option} value={option}>
                {peranLabels[option]}
              </option>
            ))}
          </Select>
          <Button
            type="submit"
            form="penugasan-search"
            variant="secondary"
            onClick={() => setPage(1)}
          >
            Cari
          </Button>
          {hasFilter ? (
            <Button variant="ghost" onClick={resetFilters}>
              Reset
            </Button>
          ) : null}
        </div>
      </Card>

      <Card>
        {list.loading && !list.data ? (
          <TableSkeleton columns={7} rows={6} />
        ) : list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : (list.data?.data ?? []).length === 0 ? (
          <EmptyState
            title={
              hasFilter
                ? "Tidak ada penugasan yang cocok"
                : "Belum ada penugasan"
            }
            description={
              hasFilter
                ? "Coba ubah kata kunci atau filter penugasan."
                : "Tugaskan PNS aktif ke kendaraan dinas untuk mulai memantau tanggung jawab."
            }
            action={
              hasFilter ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filter
                </Button>
              ) : (
                <Button size="sm" icon="plus" onClick={openCreate}>
                  Tugaskan PNS
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-400">
                    <th className="px-5 py-3 font-medium">PNS</th>
                    <th className="px-5 py-3 font-medium">Kendaraan</th>
                    <th className="px-5 py-3 font-medium">Peran</th>
                    <th className="px-5 py-3 font-medium">Mulai</th>
                    <th className="px-5 py-3 font-medium">Selesai</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(list.data?.data ?? []).map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="transition hover:bg-zinc-50/80"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-900">
                          {assignment.pns?.nama ?? `PNS #${assignment.pnsId}`}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {assignment.pns?.nip ??
                            assignment.pns?.jabatan ??
                            "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        {assignment.kendaraan ? (
                          <Link
                            href={`/kendaraan/${assignment.kendaraanId}`}
                            className="font-medium text-zinc-800 hover:underline"
                          >
                            {assignment.kendaraan.nopol}
                          </Link>
                        ) : (
                          <span className="text-zinc-500">
                            #{assignment.kendaraanId}
                          </span>
                        )}
                        {assignment.kendaraan ? (
                          <p className="text-xs text-zinc-500">
                            {assignment.kendaraan.merek}{" "}
                            {assignment.kendaraan.tipe}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                        {peranLabels[assignment.peran]}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                        {formatDate(assignment.tanggalMulai)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                        {assignment.tanggalSelesai
                          ? formatDate(assignment.tanggalSelesai)
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Badge tone={statusPenugasanTones[assignment.status]}>
                          {statusPenugasanLabels[assignment.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {assignment.status === "AKTIF" ? (
                            <button
                              type="button"
                              onClick={() => askEnd(assignment)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                            >
                              Akhiri
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => openEdit(assignment)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => askDelete(assignment)}
                            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Hapus penugasan"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {list.data ? (
              <Pagination meta={list.data.meta} onPage={setPage} />
            ) : null}
          </>
        )}
      </Card>

      <AssignmentModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(confirmation)}
        onClose={() => {
          setConfirmation(null);
          setConfirmError(null);
        }}
        onConfirm={runConfirmation}
        title={confirmation?.title ?? ""}
        description={confirmation?.description ?? ""}
        confirmLabel={confirmation?.confirmLabel}
        tone={confirmation?.tone}
        loading={confirming}
        error={confirmError}
      />
    </div>
  );
}
