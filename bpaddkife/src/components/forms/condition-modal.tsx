"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, errorDetails, errorMessage } from "@/lib/api";
import { kondisiLabels, kondisiOptions } from "@/lib/domain";
import { todayInputValue } from "@/lib/format";
import type {
  Kendaraan,
  KondisiKendaraan,
  Paginated,
  RiwayatKondisi,
  RiwayatKondisiInput,
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

export function ConditionModal({
  open,
  onClose,
  fixedKendaraan,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  fixedKendaraan?: VehicleOption | null;
  onSaved: (message: string) => void;
}) {
  const vehicles = useApiData<Paginated<Kendaraan>>(
    open && !fixedKendaraan
      ? "/kendaraan?limit=100&sortBy=nopol&sortOrder=asc"
      : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [tanggal, setTanggal] = useState("");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDetails([]);
    setSubmitting(false);
    setTanggal(todayInputValue());
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDetails([]);

    const form = new FormData(event.currentTarget);
    const kendaraanId =
      fixedKendaraan?.id ?? Number(form.get("kendaraanId"));
    const kondisi = String(form.get("kondisi")) as KondisiKendaraan;
    const input: RiwayatKondisiInput = {
      kondisi,
      tanggal: String(form.get("tanggal") ?? ""),
      keterangan: optionalText(form, "keterangan"),
      dicatatOleh: optionalText(form, "dicatatOleh"),
    };

    setSubmitting(true);
    try {
      await api.post<RiwayatKondisi>(
        `/kendaraan/${kendaraanId}/riwayat-kondisi`,
        input,
      );
      onSaved(
        kondisi === "DALAM_PERBAIKAN"
          ? "Kondisi dicatat. Status kendaraan otomatis menjadi perbaikan."
          : "Riwayat kondisi berhasil dicatat.",
      );
    } catch (cause) {
      setError(errorMessage(cause));
      setDetails(errorDetails(cause));
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Catat kondisi kendaraan"
      description="Riwayat kondisi bersifat audit dan tidak dapat diubah atau dihapus."
      size="md"
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

        {fixedKendaraan ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Kendaraan
            </p>
            <p className="mt-0.5 text-sm font-medium text-zinc-900">
              {fixedKendaraan.nopol}
            </p>
            <p className="text-xs text-zinc-500">
              {fixedKendaraan.merek} {fixedKendaraan.tipe}
            </p>
          </div>
        ) : (
          <Field label="Kendaraan" htmlFor="kondisi-kendaraan" required>
            <Select
              id="kondisi-kendaraan"
              name="kendaraanId"
              required
              defaultValue=""
              disabled={vehicles.loading}
            >
              <option value="" disabled>
                {vehicles.loading ? "Memuat kendaraan…" : "Pilih kendaraan"}
              </option>
              {(vehicles.data?.data ?? []).map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.nopol} — {vehicle.merek} {vehicle.tipe}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kondisi" htmlFor="kondisi-baru" required>
            <Select
              id="kondisi-baru"
              name="kondisi"
              required
              defaultValue="BAIK"
            >
              {kondisiOptions.map((kondisi) => (
                <option key={kondisi} value={kondisi}>
                  {kondisiLabels[kondisi]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tanggal" htmlFor="kondisi-tanggal" required>
            <Input
              id="kondisi-tanggal"
              name="tanggal"
              type="date"
              required
              value={tanggal}
              onChange={(event) => setTanggal(event.target.value)}
            />
          </Field>
          <Field
            label="Dicatat oleh"
            htmlFor="kondisi-petugas"
            hint="Nama petugas yang melakukan pencatatan."
          >
            <Input
              id="kondisi-petugas"
              name="dicatatOleh"
              maxLength={100}
              placeholder="Siti Aminah"
            />
          </Field>
          <Field
            label="Keterangan"
            htmlFor="kondisi-keterangan"
            className="sm:col-span-2"
          >
            <Textarea
              id="kondisi-keterangan"
              name="keterangan"
              maxLength={1000}
              placeholder="Lampu depan kanan mati."
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Menyimpan…" : "Catat kondisi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
