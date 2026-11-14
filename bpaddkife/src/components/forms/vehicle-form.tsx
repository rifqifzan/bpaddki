"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api, errorDetails, errorMessage } from "@/lib/api";
import {
  kondisiOptions,
  kondisiLabels,
  statusKendaraanLabels,
  statusKendaraanOptions,
} from "@/lib/domain";
import type {
  Kendaraan,
  KendaraanInput,
  KondisiKendaraan,
  Paginated,
  Pd,
  StatusKendaraan,
} from "@/lib/types";
import { useApiData } from "@/lib/use-api";
import {
  Banner,
  Button,
  ButtonLink,
  Card,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

function optionalText(form: FormData, name: string): string | null {
  const value = String(form.get(name) ?? "").trim();
  return value ? value : null;
}

export function VehicleForm({
  initial,
  cancelHref = "/kendaraan",
}: {
  initial?: Kendaraan;
  cancelHref?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [tahun, setTahun] = useState(
    initial?.tahun ? String(initial.tahun) : "",
  );

  useEffect(() => {
    if (!initial) {
      setTahun(String(new Date().getFullYear()));
    }
  }, [initial]);

  const pds = useApiData<Paginated<Pd>>(
    "/pd?limit=100&sortBy=nama&sortOrder=asc",
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDetails([]);

    const form = new FormData(event.currentTarget);
    const pdRaw = String(form.get("pdId") ?? "");
    const input: KendaraanInput = {
      nopol: String(form.get("nopol") ?? "").trim(),
      merek: String(form.get("merek") ?? "").trim(),
      tipe: String(form.get("tipe") ?? "").trim(),
      tahun: Number(form.get("tahun")),
      warna: String(form.get("warna") ?? "").trim(),
      kondisi: String(form.get("kondisi")) as KondisiKendaraan,
      status: String(form.get("status")) as StatusKendaraan,
      nomorRangka: optionalText(form, "nomorRangka"),
      nomorMesin: optionalText(form, "nomorMesin"),
      odometer: Number(form.get("odometer") || 0),
      tanggalPajak: optionalText(form, "tanggalPajak"),
      catatan: optionalText(form, "catatan"),
    };

    if (pdRaw) input.pdId = Number(pdRaw);

    setSubmitting(true);
    try {
      if (initial) {
        await api.patch<Kendaraan>(`/kendaraan/${initial.id}`, input);
        router.push(`/kendaraan/${initial.id}`);
      } else {
        const created = await api.post<Kendaraan>("/kendaraan", input);
        router.push(`/kendaraan/${created.id}`);
      }
      router.refresh();
    } catch (cause) {
      setError(errorMessage(cause));
      setDetails(errorDetails(cause));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <Banner tone="error">
          {error}
          {details.length > 1 ? (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs">
              {details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </Banner>
      ) : null}

      <Card className="p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Identitas kendaraan
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Nomor polisi akan dinormalisasi otomatis oleh server.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomor polisi" htmlFor="nopol" required>
            <Input
              id="nopol"
              name="nopol"
              required
              maxLength={20}
              defaultValue={initial?.nopol}
              placeholder="B 1234 XYZ"
              className="uppercase"
            />
          </Field>
          <Field label="Warna" htmlFor="warna" required>
            <Input
              id="warna"
              name="warna"
              required
              minLength={3}
              maxLength={30}
              defaultValue={initial?.warna}
              placeholder="Hitam"
            />
          </Field>
          <Field label="Merek" htmlFor="merek" required>
            <Input
              id="merek"
              name="merek"
              required
              minLength={2}
              maxLength={50}
              defaultValue={initial?.merek}
              placeholder="Toyota"
            />
          </Field>
          <Field label="Tipe / model" htmlFor="tipe" required>
            <Input
              id="tipe"
              name="tipe"
              required
              maxLength={50}
              defaultValue={initial?.tipe}
              placeholder="Innova Zenix"
            />
          </Field>
          <Field label="Tahun" htmlFor="tahun" required>
            <Input
              id="tahun"
              name="tahun"
              type="number"
              required
              min={1900}
              max={2100}
              value={tahun}
              onChange={(event) => setTahun(event.target.value)}
            />
          </Field>
          <Field
            label="Odometer (km)"
            htmlFor="odometer"
            hint="Odometer akan ikut naik saat perawatan mencatat angka lebih tinggi."
          >
            <Input
              id="odometer"
              name="odometer"
              type="number"
              min={0}
              defaultValue={initial?.odometer ?? 0}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Status dan pengelola
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Status penugasan diperbarui otomatis saat PNS ditugaskan atau
            diakhiri.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kondisi" htmlFor="kondisi" required>
            <Select
              id="kondisi"
              name="kondisi"
              defaultValue={initial?.kondisi ?? "BAIK"}
            >
              {kondisiOptions.map((kondisi) => (
                <option key={kondisi} value={kondisi}>
                  {kondisiLabels[kondisi]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status operasional" htmlFor="status" required>
            <Select
              id="status"
              name="status"
              defaultValue={initial?.status ?? "TERSEDIA"}
            >
              {statusKendaraanOptions.map((status) => (
                <option key={status} value={status}>
                  {statusKendaraanLabels[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Perangkat daerah" htmlFor="pdId">
            <Select
              id="pdId"
              name="pdId"
              defaultValue={initial?.pdId ?? ""}
              disabled={pds.loading}
            >
              <option value="">Belum ditentukan</option>
              {(pds.data?.data ?? []).map((pd) => (
                <option key={pd.id} value={pd.id}>
                  {pd.singkatan ? `${pd.singkatan} — ${pd.nama}` : pd.nama}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Jatuh tempo pajak"
            htmlFor="tanggalPajak"
            hint="Kosongkan bila belum diketahui."
          >
            <Input
              id="tanggalPajak"
              name="tanggalPajak"
              type="date"
              defaultValue={initial?.tanggalPajak ?? ""}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Data teknis dan catatan
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Seluruh field pada bagian ini opsional.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomor rangka" htmlFor="nomorRangka">
            <Input
              id="nomorRangka"
              name="nomorRangka"
              maxLength={50}
              defaultValue={initial?.nomorRangka ?? ""}
              placeholder="MHFXXXXX123456789"
            />
          </Field>
          <Field label="Nomor mesin" htmlFor="nomorMesin">
            <Input
              id="nomorMesin"
              name="nomorMesin"
              maxLength={50}
              defaultValue={initial?.nomorMesin ?? ""}
              placeholder="2GD1234567"
            />
          </Field>
          <Field label="Catatan" htmlFor="catatan" className="sm:col-span-2">
            <Textarea
              id="catatan"
              name="catatan"
              maxLength={1000}
              defaultValue={initial?.catatan ?? ""}
              placeholder="Kendaraan operasional pimpinan."
            />
          </Field>
        </div>
      </Card>

      {initial ? (
        <p className="text-xs text-zinc-500">
          Mengubah kondisi kendaraan akan otomatis menambahkan catatan pada
          riwayat kondisi.
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-4">
        <ButtonLink href={cancelHref} variant="secondary">
          Batal
        </ButtonLink>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Menyimpan…"
            : isEdit
              ? "Simpan perubahan"
              : "Daftarkan kendaraan"}
        </Button>
      </div>
    </form>
  );
}
