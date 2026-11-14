"use client";

import { useState, type FormEvent } from "react";
import { api, buildQuery, errorMessage } from "@/lib/api";
import { golonganOptions } from "@/lib/domain";
import type {
  GolonganPns,
  Paginated,
  Pd,
  Pns,
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
import { PnsModal } from "@/components/forms/pns-modal";

export default function PnsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pdId, setPdId] = useState("");
  const [golongan, setGolongan] = useState<GolonganPns | "">("");
  const [aktif, setAktif] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Pns | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Pns | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const path = `/pns${buildQuery({
    page,
    limit: 10,
    search,
    pdId,
    golongan,
    aktif,
    sortBy: "nama",
    sortOrder: "asc",
  })}`;

  const list = useApiData<Paginated<Pns>>(path);
  const pds = useApiData<Paginated<Pd>>(
    "/pd?limit=100&sortBy=nama&sortOrder=asc",
  );

  const hasFilter = Boolean(search || pdId || golongan || aktif);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setPdId("");
    setGolongan("");
    setAktif("");
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(pns: Pns) {
    setEditing(pns);
    setFormOpen(true);
  }

  function handleSaved(text: string) {
    setFormOpen(false);
    setEditing(null);
    setMessage(text);
    setActionError(null);
    list.reload();
  }

  async function removePns() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/pns/${deleteTarget.id}`);
      setDeleteTarget(null);
      setMessage("Data PNS berhasil dihapus.");
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
        eyebrow="Pegawai"
        title="Data PNS"
        description="Kelola PNS yang dapat ditugaskan sebagai penanggung jawab atau pengemudi kendaraan dinas."
        actions={
          <Button icon="plus" onClick={openCreate}>
            Tambah PNS
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
            id="pns-search"
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
              placeholder="Cari nama, NIP, atau jabatan…"
              className="pl-9"
              aria-label="Cari PNS"
            />
          </form>
          <Select
            value={pdId}
            onChange={(event) => {
              setPdId(event.target.value);
              setPage(1);
            }}
            className="w-auto max-w-52"
            aria-label="Filter perangkat daerah"
          >
            <option value="">Semua PD</option>
            {(pds.data?.data ?? []).map((pd) => (
              <option key={pd.id} value={pd.id}>
                {pd.singkatan ?? pd.nama}
              </option>
            ))}
          </Select>
          <Select
            value={golongan}
            onChange={(event) => {
              setGolongan(event.target.value as GolonganPns | "");
              setPage(1);
            }}
            className="w-auto"
            aria-label="Filter golongan"
          >
            <option value="">Semua golongan</option>
            {golonganOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
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
            form="pns-search"
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
          <TableSkeleton columns={6} rows={6} />
        ) : list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : (list.data?.data ?? []).length === 0 ? (
          <EmptyState
            title={hasFilter ? "Tidak ada PNS yang cocok" : "Belum ada data PNS"}
            description={
              hasFilter
                ? "Coba ubah kata kunci atau filter PNS."
                : "Tambahkan PNS agar dapat ditugaskan sebagai penanggung jawab kendaraan."
            }
            action={
              hasFilter ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filter
                </Button>
              ) : (
                <Button size="sm" icon="plus" onClick={openCreate}>
                  Tambah PNS
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-400">
                    <th className="px-5 py-3 font-medium">Nama / NIP</th>
                    <th className="px-5 py-3 font-medium">Jabatan</th>
                    <th className="px-5 py-3 font-medium">Golongan</th>
                    <th className="px-5 py-3 font-medium">Perangkat daerah</th>
                    <th className="px-5 py-3 font-medium">Kontak</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(list.data?.data ?? []).map((pns) => (
                    <tr
                      key={pns.id}
                      className="transition hover:bg-zinc-50/80"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-900">{pns.nama}</p>
                        <p className="font-mono text-xs text-zinc-500">
                          {pns.nip}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        {pns.jabatan}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Badge tone="zinc">{pns.golongan}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        {pns.pd?.singkatan ?? pns.pd?.nama ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5 text-xs text-zinc-500">
                          {pns.telepon ? <p>{pns.telepon}</p> : null}
                          {pns.email ? (
                            <p className="max-w-44 truncate">{pns.email}</p>
                          ) : null}
                          {!pns.telepon && !pns.email ? <p>—</p> : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Badge tone={pns.aktif ? "emerald" : "zinc"}>
                          {pns.aktif ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(pns)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget(pns);
                            }}
                            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Hapus PNS"
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

      <PnsModal
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
        onConfirm={removePns}
        title="Hapus data PNS?"
        description={`Data PNS "${deleteTarget?.nama ?? ""}" akan dihapus. PNS yang memiliki riwayat penugasan tidak dapat dihapus; nonaktifkan saja datanya.`}
        confirmLabel="Hapus PNS"
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}
