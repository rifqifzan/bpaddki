"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, errorDetails, errorMessage } from "@/lib/api";
import {
  jenisPerawatanLabels,
  jenisPerawatanOptions,
  statusPerawatanLabels,
  statusPerawatanOptions,
} from "@/lib/domain";
import { todayInputValue } from "@/lib/format";
import type {
  JenisPerawatan,
  Kendaraan,
  Paginated,
  Perawatan,
  PerawatanInput,
  StatusPerawatan,
} from "@/lib/types";
import { useApiData } from "@/lib/use-api";
import {
  Banner,
  Button,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui";

function optionalText(form: FormData, name: string): string | null {
  const value = String(form.get(name) ?? "").trim();
  return value ? value : null;
}

type VehicleOption = Pick<Kendaraan, "id" | "nopol" | "merek" | "tipe">;

export function MaintenanceModal({
  open,
  onClose,
  initial,
  fixedKendaraan,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Perawatan | null;
  fixedKendaraan?: VehicleOption | null;
  onSaved: (message: string) => void;
}) {
  const isEdit = Boolean(initial);
  const vehicles = useApiData<Paginated<Kendaraan>>(
    open && !isEdit && !fixedKendaraan
      ? "/kendaraan?limit=100&sortBy=nopol&sortOrder=asc"
      : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [tanggal, setTanggal] = useState(initial?.tanggal ?? "");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDetails([]);
    setSubmitting(false);
    setTanggal(initial ? initial.tanggal : todayInputValue());
  }, [open, initial]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDetails([]);

    const form = new FormData(event.currentTarget);
    const odometerRaw = String(form.get("odometer") ?? "").trim();
    const kendaraanId =
      fixedKendaraan?.id ??
      initial?.kendaraanId ??
      Number(form.get("kendaraanId"));
    const payload = {
      jenis: String(form.get("jenis")) as JenisPerawatan,
      tanggal: String(form.get("tanggal") ?? ""),
      deskripsi: String(form.get("deskripsi") ?? "").trim(),
      bengkel: optionalText(form, "bengkel"),
      biaya: Number(form.get("biaya") || 0),
      odometer: odometerRaw ? Number(odometerRaw) : null,
      status: String(form.get("status")) as StatusPerawatan,
    };

    setSubmitting(true);
    try {
      if (initial) {
        await api.patch<Perawatan>(`/perawatan/${initial.id}`, payload);
        onSaved("Catatan perawatan diperbarui.");
      } else {
        const input: PerawatanInput = { ...payload, kendaraanId };
        await api.post<Perawatan>("/perawatan", input);
        onSaved(
          "Perawatan dicatat. Odometer kendaraan ikut diperbarui bila lebih tinggi.",
        );
      }
    } catch (cause) {
      setError(errorMessage(cause));
      setDetails(errorDetails(cause));
      setSubmitting(false);
    }
  }

  const vehicle = fixedKendaraan ?? initial?.kendaraan ?? null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Ubah perawatan" : "Catat perawatan"}
      description="Biaya dalam Rupiah. Odometer kendaraan naik otomatis bila angkanya lebih tinggi."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <Banner tone="error">
            {error}
            {details.length > 1 ? (
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </Banner>
        ) : null}

        {vehicle ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Kendaraan
            </p>
            <p className="mt-0.5 text-sm font-medium text-zinc-900">
              {vehicle.nopol}
            </p>
            <p className="text-xs text-zinc-500">
              {vehicle.merek} {vehicle.tipe}
            </p>
          </div>
        ) : (
          <Field label="Kendaraan" htmlFor="perawatan-kendaraan" required>
            <Select
              id="perawatan-kendaraan"
              name="kendaraanId"
              required
              defaultValue=""
              disabled={vehicles.loading}
            >
              <option value="" disabled>
                {vehicles.loading ? "Memuat kendaraan…" : "Pilih kendaraan"}
              </option>
              {(vehicles.data?.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nopol} — {item.merek} {item.tipe}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jenis perawatan" htmlFor="perawatan-jenis" required>
            <Select
              id="perawatan-jenis"
              name="jenis"
              required
              defaultValue={initial?.jenis ?? "SERVIS_RUTIN"}
            >
              {jenisPerawatanOptions.map((jenis) => (
                <option key={jenis} value={jenis}>
                  {jenisPerawatanLabels[jenis]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tanggal" htmlFor="perawatan-tanggal" required>
            <Input
              id="perawatan-tanggal"
              name="tanggal"
              type="date"
              required
              value={tanggal}
              onChange={(event) => setTanggal(event.target.value)}
            />
          </Field>
          <Field
            label="Deskripsi"
            htmlFor="perawatan-deskripsi"
            required
            className="sm:col-span-2"
          >
            <Textarea
              id="perawatan-deskripsi"
              name="deskripsi"
              required
              minLength={3}
              maxLength={1000}
              defaultValue={initial?.deskripsi}
              placeholder="Servis rutin 10.000 km, ganti oli dan filter."
            />
          </Field>
          <Field label="Bengkel" htmlFor="perawatan-bengkel">
            <Input
              id="perawatan-bengkel"
              name="bengkel"
              maxLength={150}
              defaultValue={initial?.bengkel ?? ""}
              placeholder="Auto2000 Cibinong"
            />
          </Field>
          <Field label="Biaya (Rp)" htmlFor="perawatan-biaya">
            <Input
              id="perawatan-biaya"
              name="biaya"
              type="number"
              min={0}
              step="0.01"
              defaultValue={initial?.biaya ?? 0}
            />
          </Field>
          <Field
            label="Odometer saat perawatan (km)"
            htmlFor="perawatan-odometer"
          >
            <Input
              id="perawatan-odometer"
              name="odometer"
              type="number"
              min={0}
              defaultValue={initial?.odometer ?? ""}
              placeholder="45500"
            />
          </Field>
          <Field label="Status" htmlFor="perawatan-status" required>
            <Select
              id="perawatan-status"
              name="status"
              required
              defaultValue={initial?.status ?? "SELESAI"}
            >
              {statusPerawatanOptions.map((status) => (
                <option key={status} value={status}>
                  {statusPerawatanLabels[status]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
