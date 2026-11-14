"use client";

import { useState, type FormEvent } from "react";
import { api, buildQuery, errorMessage } from "@/lib/api";
import type { Paginated, Pd } from "@/lib/types";
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
import { PdModal } from "@/components/forms/pd-modal";

export default function PdPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [aktif, setAktif] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Pd | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Pd | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const path = `/pd${buildQuery({
    page,
    limit: 10,
    search,
    aktif,
    sortBy: "nama",
    sortOrder: "asc",
  })}`;

  const list = useApiData<Paginated<Pd>>(path);
  const hasFilter = Boolean(search || aktif);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setAktif("");
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(pd: Pd) {
    setEditing(pd);
    setFormOpen(true);
  }

  function handleSaved(text: string) {
    setFormOpen(false);
    setEditing(null);
    setMessage(text);
    list.reload();
  }

  async function removePd() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/pd/${deleteTarget.id}`);
      setDeleteTarget(null);
      setMessage("Perangkat daerah berhasil dihapus.");
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
        eyebrow="Referensi"
        title="Perangkat daerah"
        description="Kelola PD sebagai pemilik kendaraan dinas dan unit kerja PNS."
        actions={
          <Button icon="plus" onClick={openCreate}>
            Tambah PD
          </Button>
        }
      />

      {message ? (
        <Banner tone="success" onClose={() => setMessage(null)}>
          {message}
        </Banner>
      ) : null}

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <form
            id="pd-search"
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
              placeholder="Cari kode, nama, atau singkatan…"
              className="pl-9"
              aria-label="Cari perangkat daerah"
            />
          </form>
          <Select
            value={aktif}
            onChange={(event) => {
              setAktif(event.target.value);
              setPage(1);
            }}
            className="w-auto"
            aria-label="Filter status aktif"
          >
            <option value="">Semua status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </Select>
          <Button
            type="submit"
            form="pd-search"
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
          <TableSkeleton columns={6} rows={5} />
        ) : list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : (list.data?.data ?? []).length === 0 ? (
          <EmptyState
            title={
              hasFilter
                ? "Tidak ada PD yang cocok"
                : "Belum ada perangkat daerah"
            }
            description={
              hasFilter
                ? "Coba ubah kata kunci atau filter status."
                : "Tambahkan perangkat daerah sebelum mendaftarkan PNS dan kendaraan."
            }
            action={
              hasFilter ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filter
                </Button>
              ) : (
                <Button size="sm" icon="plus" onClick={openCreate}>
                  Tambah PD
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-400">
                    <th className="px-5 py-3 font-medium">Kode</th>
                    <th className="px-5 py-3 font-medium">Nama</th>
                    <th className="px-5 py-3 font-medium">Kontak</th>
                    <th className="px-5 py-3 font-medium">PNS</th>
                    <th className="px-5 py-3 font-medium">Kendaraan</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(list.data?.data ?? []).map((pd) => (
                    <tr key={pd.id} className="transition hover:bg-zinc-50/80">
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-zinc-800">
                          {pd.kode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-900">{pd.nama}</p>
                        <p className="text-xs text-zinc-500">
                          {pd.singkatan ?? "Tanpa singkatan"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5 text-xs text-zinc-500">
                          {pd.telepon ? <p>{pd.telepon}</p> : null}
                          {pd.alamat ? (
                            <p className="max-w-56 truncate">{pd.alamat}</p>
                          ) : null}
                          {!pd.telepon && !pd.alamat ? <p>—</p> : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                        {pd.jumlahPns ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                        {pd.jumlahKendaraan ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Badge tone={pd.aktif ? "emerald" : "zinc"}>
                          {pd.aktif ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(pd)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget(pd);
                            }}
                            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Hapus perangkat daerah"
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

      <PdModal
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
        onConfirm={removePd}
        title="Hapus perangkat daerah?"
        description={`PD "${
          deleteTarget?.nama ?? ""
        }" hanya dapat dihapus bila tidak memiliki PNS maupun kendaraan. Nonaktifkan PD bila masih digunakan.`}
        confirmLabel="Hapus PD"
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
