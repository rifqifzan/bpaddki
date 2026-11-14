"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api, buildQuery, errorMessage } from "@/lib/api";
import {
  jenisPerawatanLabels,
  jenisPerawatanOptions,
  statusPerawatanLabels,
  statusPerawatanOptions,
  statusPerawatanTones,
} from "@/lib/domain";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type {
  JenisPerawatan,
  Paginated,
  Perawatan,
  StatusPerawatan,
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
import { MaintenanceModal } from "@/components/forms/maintenance-modal";

export default function PerawatanPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState<JenisPerawatan | "">("");
  const [status, setStatus] = useState<StatusPerawatan | "">("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Perawatan | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Perawatan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const path = `/perawatan${buildQuery({
    page,
    limit: 10,
    search,
    jenis,
    status,
    sortBy: "tanggal",
    sortOrder: "desc",
  })}`;

  const list = useApiData<Paginated<Perawatan>>(path);
  const hasFilter = Boolean(search || jenis || status);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setJenis("");
    setStatus("");
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: Perawatan) {
    setEditing(item);
    setFormOpen(true);
  }

  function handleSaved(text: string) {
    setFormOpen(false);
    setEditing(null);
    setMessage(text);
    setActionError(null);
    list.reload();
  }

  async function removeMaintenance() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/perawatan/${deleteTarget.id}`);
      setDeleteTarget(null);
      setMessage("Catatan perawatan berhasil dihapus.");
      setActionError(null);
      list.reload();
    } catch (cause) {
      setDeleteError(errorMessage(cause));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Perawatan"
        title="Perawatan kendaraan"
        description="Catat servis rutin, perbaikan, pajak, dan biaya perawatan kendaraan dinas."
        actions={
          <Button icon="plus" onClick={openCreate}>
            Catat perawatan
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
            id="perawatan-search"
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
              placeholder="Cari deskripsi, bengkel, atau nopol…"
              className="pl-9"
              aria-label="Cari perawatan"
            />
          </form>
          <Select
            value={jenis}
            onChange={(event) => {
              setJenis(event.target.value as JenisPerawatan | "");
              setPage(1);
            }}
            className="w-auto max-w-48"
            aria-label="Filter jenis perawatan"
          >
            <option value="">Semua jenis</option>
            {jenisPerawatanOptions.map((option) => (
              <option key={option} value={option}>
                {jenisPerawatanLabels[option]}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusPerawatan | "");
              setPage(1);
            }}
            className="w-auto"
            aria-label="Filter status perawatan"
          >
            <option value="">Semua status</option>
            {statusPerawatanOptions.map((option) => (
              <option key={option} value={option}>
                {statusPerawatanLabels[option]}
              </option>
            ))}
          </Select>
          <Button
            type="submit"
            form="perawatan-search"
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
                ? "Tidak ada perawatan yang cocok"
                : "Belum ada catatan perawatan"
            }
            description={
              hasFilter
                ? "Coba ubah kata kunci atau filter perawatan."
                : "Catat servis atau perbaikan kendaraan untuk melacak biaya dan odometer."
            }
            action={
              hasFilter ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filter
                </Button>
              ) : (
                <Button size="sm" icon="plus" onClick={openCreate}>
                  Catat perawatan
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-400">
                    <th className="px-5 py-3 font-medium">Tanggal</th>
                    <th className="px-5 py-3 font-medium">Kendaraan</th>
                    <th className="px-5 py-3 font-medium">Jenis</th>
                    <th className="px-5 py-3 font-medium">Deskripsi</th>
                    <th className="px-5 py-3 font-medium">Odometer</th>
                    <th className="px-5 py-3 text-right font-medium">Biaya</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(list.data?.data ?? []).map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-zinc-50/80"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                        {formatDate(item.tanggal)}
                      </td>
                      <td className="px-5 py-3.5">
                        {item.kendaraan ? (
                          <Link
                            href={`/kendaraan/${item.kendaraanId}`}
                            className="font-medium text-zinc-800 hover:underline"
                          >
                            {item.kendaraan.nopol}
                          </Link>
                        ) : (
                          <span className="text-zinc-500">
                            #{item.kendaraanId}
                          </span>
                        )}
                        {item.kendaraan ? (
                          <p className="text-xs text-zinc-500">
                            {item.kendaraan.merek} {item.kendaraan.tipe}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Badge tone="zinc">
                          {jenisPerawatanLabels[item.jenis]}
                        </Badge>
                      </td>
                      <td className="max-w-72 px-5 py-3.5">
                        <p className="truncate text-zinc-700">
                          {item.deskripsi}
                        </p>
                        <p className="truncate text-xs text-zinc-400">
                          {item.bengkel ?? "Bengkel tidak dicatat"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                        {item.odometer !== null
                          ? `${formatNumber(item.odometer)} km`
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-medium text-zinc-800">
                        {formatCurrency(item.biaya)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Badge tone={statusPerawatanTones[item.status]}>
                          {statusPerawatanLabels[item.status]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget(item);
                            }}
                            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Hapus perawatan"
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

      <MaintenanceModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={removeMaintenance}
        title="Hapus catatan perawatan?"
        description={`Catatan perawatan "${
          deleteTarget?.deskripsi ?? ""
        }" akan dihapus permanen.`}
        confirmLabel="Hapus perawatan"
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
