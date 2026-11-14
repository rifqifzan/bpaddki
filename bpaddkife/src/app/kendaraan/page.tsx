"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { buildQuery } from "@/lib/api";
import {
  kondisiLabels,
  kondisiOptions,
  kondisiTones,
  statusKendaraanLabels,
  statusKendaraanOptions,
  statusKendaraanTones,
} from "@/lib/domain";
import type {
  Kendaraan,
  KondisiKendaraan,
  Paginated,
  Pd,
  PenugasanKendaraan,
  StatusKendaraan,
} from "@/lib/types";
import { useApiData } from "@/lib/use-api";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Select,
  TableSkeleton,
} from "@/components/ui";
import { Icon } from "@/components/icons";

export default function KendaraanPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [kondisi, setKondisi] = useState<KondisiKendaraan | "">("");
  const [status, setStatus] = useState<StatusKendaraan | "">("");
  const [pdId, setPdId] = useState("");

  const path = `/kendaraan${buildQuery({
    page,
    limit: 10,
    search,
    kondisi,
    status,
    pdId,
    sortBy: "nopol",
    sortOrder: "asc",
  })}`;

  const vehicles = useApiData<Paginated<Kendaraan>>(path);
  const pds = useApiData<Paginated<Pd>>(
    "/pd?limit=100&sortBy=nama&sortOrder=asc",
  );
  const assignments = useApiData<Paginated<PenugasanKendaraan>>(
    "/penugasan?status=AKTIF&limit=100",
  );

  const picByVehicle = useMemo(() => {
    const map = new Map<number, PenugasanKendaraan>();
    for (const assignment of assignments.data?.data ?? []) {
      const existing = map.get(assignment.kendaraanId);
      if (!existing || assignment.peran === "PENANGGUNG_JAWAB") {
        map.set(assignment.kendaraanId, assignment);
      }
    }
    return map;
  }, [assignments.data]);

  const hasFilter = Boolean(search || kondisi || status || pdId);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setKondisi("");
    setStatus("");
    setPdId("");
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Data kendaraan"
        title="Kendaraan dinas"
        description="Daftar unit operasional beserta kondisi, status, dan PNS yang bertanggung jawab."
        actions={
          <ButtonLink href="/kendaraan/baru" icon="plus">
            Tambah kendaraan
          </ButtonLink>
        }
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <form
            id="kendaraan-search"
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
              placeholder="Cari nopol, merek, tipe, atau warna…"
              className="pl-9"
              aria-label="Cari kendaraan"
            />
          </form>
          <Select
            value={kondisi}
            onChange={(event) => {
              setKondisi(event.target.value as KondisiKendaraan | "");
              setPage(1);
            }}
            className="w-auto"
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
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusKendaraan | "");
              setPage(1);
            }}
            className="w-auto"
            aria-label="Filter status"
          >
            <option value="">Semua status</option>
            {statusKendaraanOptions.map((option) => (
              <option key={option} value={option}>
                {statusKendaraanLabels[option]}
              </option>
            ))}
          </Select>
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
          <Button
            type="submit"
            form="kendaraan-search"
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
        {vehicles.loading && !vehicles.data ? (
          <TableSkeleton columns={7} rows={6} />
        ) : vehicles.error ? (
          <ErrorState message={vehicles.error} onRetry={vehicles.reload} />
        ) : (vehicles.data?.data ?? []).length === 0 ? (
          <EmptyState
            title={hasFilter ? "Tidak ada kendaraan yang cocok" : "Belum ada kendaraan"}
            description={
              hasFilter
                ? "Coba ubah kata kunci atau filter yang dipakai."
                : "Daftarkan kendaraan dinas operasional pertama Anda."
            }
            action={
              hasFilter ? (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filter
                </Button>
              ) : (
                <ButtonLink href="/kendaraan/baru" icon="plus" size="sm">
                  Tambah kendaraan
                </ButtonLink>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-400">
                    <th className="px-5 py-3 font-medium">Nopol</th>
                    <th className="px-5 py-3 font-medium">Kendaraan</th>
                    <th className="px-5 py-3 font-medium">PD</th>
                    <th className="px-5 py-3 font-medium">Kondisi</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Penanggung jawab</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(vehicles.data?.data ?? []).map((vehicle) => {
                    const pic = picByVehicle.get(vehicle.id);
                    return (
                      <tr
                        key={vehicle.id}
                        className="transition hover:bg-zinc-50/80"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <Link
                            href={`/kendaraan/${vehicle.id}`}
                            className="font-semibold text-zinc-900 hover:underline"
                          >
                            {vehicle.nopol}
                          </Link>
                          <p className="mt-0.5 text-xs text-zinc-400">
                            {vehicle.warna} · {vehicle.tahun}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-zinc-800">
                            {vehicle.merek}
                          </p>
                          <p className="text-xs text-zinc-500">{vehicle.tipe}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-zinc-600">
                          {vehicle.pd?.singkatan ?? vehicle.pd?.nama ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <Badge tone={kondisiTones[vehicle.kondisi]}>
                            {kondisiLabels[vehicle.kondisi]}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <Badge tone={statusKendaraanTones[vehicle.status]}>
                            {statusKendaraanLabels[vehicle.status]}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {pic?.pns ? (
                            <div>
                              <p className="font-medium text-zinc-800">
                                {pic.pns.nama}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {pic.peran === "PENANGGUNG_JAWAB"
                                  ? "Penanggung jawab"
                                  : "Pengemudi"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400">
                              Belum ditugaskan
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <Link
                            href={`/kendaraan/${vehicle.id}`}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                          >
                            Detail
                            <Icon name="chevron-right" className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {vehicles.data ? (
              <Pagination meta={vehicles.data.meta} onPage={setPage} />
            ) : null}
          </>
        )}
      </Card>
    </div>
  );
}
