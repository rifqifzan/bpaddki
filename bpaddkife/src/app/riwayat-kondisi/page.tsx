"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { buildQuery } from "@/lib/api";
import {
  kondisiLabels,
  kondisiOptions,
  kondisiTones,
} from "@/lib/domain";
import { formatDate } from "@/lib/format";
import type {
  Kendaraan,
  KondisiKendaraan,
  Paginated,
  RiwayatKondisi,
} from "@/lib/types";
import { useApiData } from "@/lib/use-api";
import { Icon } from "@/components/icons";
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Select,
  TableSkeleton,
} from "@/components/ui";
import { ConditionModal } from "@/components/forms/condition-modal";

export default function RiwayatKondisiPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [kondisi, setKondisi] = useState<KondisiKendaraan | "">("");
  const [kendaraanId, setKendaraanId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const path = `/riwayat-kondisi${buildQuery({
    page,
    limit: 10,
    search,
    kondisi,
    kendaraanId,
    from,
    to,
    sortBy: "tanggal",
    sortOrder: "desc",
  })}`;

  const list = useApiData<Paginated<RiwayatKondisi>>(path);
  const vehicles = useApiData<Paginated<Kendaraan>>(
    "/kendaraan?limit=100&sortBy=nopol&sortOrder=asc",
  );

  const hasFilter = Boolean(search || kondisi || kendaraanId || from || to);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setKondisi("");
    setKendaraanId("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  function handleSaved(text: string) {
    setFormOpen(false);
    setMessage(text);
    list.reload();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Riwayat kondisi"
        title="Riwayat kondisi kendaraan"
        description="Jejak audit perubahan kondisi seluruh kendaraan. Catatan riwayat tidak dapat diubah atau dihapus."
        actions={
          <Button icon="plus" onClick={() => setFormOpen(true)}>
            Catat kondisi
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
            id="riwayat-search"
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
              placeholder="Cari keterangan, pencatat, atau nopol…"
              className="pl-9"
              aria-label="Cari riwayat kondisi"
            />
          </form>
          <Select
            value={kondisi}
            onChange={(event) => {
              setKondisi(event.target.value as KondisiKendaraan | "");
              setPage(1);
            }}
            className="w-auto max-w-44"
            aria-label="Filter kondisi"
          >
            <option value="">Semua kondisi</option>
            {kondisiOptions.map((option) => (
              <option key={option} value={option}>
                {kondisiLabels[option]}
              </option>
            ))}
          </Select>
          <Select
            value={kendaraanId}
            onChange={(event) => {
              setKendaraanId(event.target.value);
              setPage(1);
            }}
            className="w-auto max-w-48"
            aria-label="Filter kendaraan"
          >
            <option value="">Semua kendaraan</option>
            {(vehicles.data?.data ?? []).map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.nopol}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
            className="w-auto"
            aria-label="Tanggal mulai"
          />
          <span className="text-xs text-zinc-400">s.d.</span>
          <Input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            className="w-auto"
            aria-label="Tanggal akhir"
          />
          <Button
            type="submit"
            form="riwayat-search"
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
          <TableSkeleton columns={5} rows={6} />
        ) : list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : (list.data?.data ?? []).length === 0 ? (
          <EmptyState
            title={
              hasFilter
                ? "Tidak ada riwayat yang cocok"
                : "Belum ada riwayat kondisi"
            }
            description={
              hasFilter
                ? "Coba ubah kata kunci, kondisi, kendaraan, atau rentang tanggal."
                : "Catat kondisi kendaraan untuk mulai membangun jejak audit."
            }
            action={
              hasFilter ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filter
                </Button>
              ) : (
                <Button
                  size="sm"
                  icon="plus"
                  onClick={() => setFormOpen(true)}
                >
                  Catat kondisi
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-400">
                    <th className="px-5 py-3 font-medium">Tanggal</th>
                    <th className="px-5 py-3 font-medium">Kendaraan</th>
                    <th className="px-5 py-3 font-medium">Kondisi</th>
                    <th className="px-5 py-3 font-medium">Keterangan</th>
                    <th className="px-5 py-3 font-medium">Dicatat oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(list.data?.data ?? []).map((history) => (
                    <tr
                      key={history.id}
                      className="transition hover:bg-zinc-50/80"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                        {formatDate(history.tanggal)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        {history.kendaraan ? (
                          <Link
                            href={`/kendaraan/${history.kendaraanId}`}
                            className="font-medium text-zinc-800 hover:underline"
                          >
                            {history.kendaraan.nopol}
                          </Link>
                        ) : (
                          <span className="text-zinc-500">
                            #{history.kendaraanId}
                          </span>
                        )}
                        {history.kendaraan ? (
                          <p className="text-xs text-zinc-500">
                            {history.kendaraan.merek}{" "}
                            {history.kendaraan.tipe}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Badge tone={kondisiTones[history.kondisi]}>
                          {kondisiLabels[history.kondisi]}
                        </Badge>
                      </td>
                      <td className="max-w-96 px-5 py-3.5 text-zinc-700">
                        {history.keterangan ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                        {history.dicatatOleh ?? "—"}
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

      <ConditionModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
