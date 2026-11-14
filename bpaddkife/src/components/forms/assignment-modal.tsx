"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, errorDetails, errorMessage } from "@/lib/api";
import {
  peranLabels,
  peranOptions,
  statusPenugasanLabels,
  statusPenugasanOptions,
} from "@/lib/domain";
import { todayInputValue } from "@/lib/format";
import type {
  Kendaraan,
  Paginated,
  PenugasanInput,
  PenugasanKendaraan,
  PeranPenugasan,
  Pns,
  StatusPenugasan,
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

type VehicleOption = Pick<Kendaraan, "id" | "nopol" | "merek" | "tipe" | "status">;

export function AssignmentModal({
  open,
  onClose,
  initial,
  fixedKendaraan,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: PenugasanKendaraan | null;
  fixedKendaraan?: VehicleOption | null;
  onSaved: (message: string) => void;
}) {
  const isEdit = Boolean(initial);
  const vehicles = useApiData<Paginated<Kendaraan>>(
    open && !isEdit ? "/kendaraan?limit=100&sortBy=nopol&sortOrder=asc" : null,
  );
  const pnsList = useApiData<Paginated<Pns>>(
    open && !isEdit ? "/pns?limit=100&aktif=true&sortBy=nama&sortOrder=asc" : null,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [tanggalMulai, setTanggalMulai] = useState(
    initial?.tanggalMulai ?? "",
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDetails([]);
    setSubmitting(false);
    setTanggalMulai(initial ? initial.tanggalMulai : todayInputValue());
  }, [open, initial]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDetails([]);

    const form = new FormData(event.currentTarget);
    const peran = String(form.get("peran")) as PeranPenugasan;
    const status = String(form.get("status")) as StatusPenugasan;
    const tanggalMulai = String(form.get("tanggalMulai") ?? "");
    const tanggalSelesai = optionalText(form, "tanggalSelesai");
    const catatan = optionalText(form, "catatan");

    setSubmitting(true);
    try {
      if (initial) {
        await api.patch<PenugasanKendaraan>(`/penugasan/${initial.id}`, {
          peran,
          status,
          tanggalMulai,
          tanggalSelesai,
          catatan,
        });
        onSaved("Penugasan diperbarui.");
      } else {
        const kendaraanId = fixedKendaraan?.id ?? Number(form.get("kendaraanId"));
        const pnsId = Number(form.get("pnsId"));
        const input: PenugasanInput = {
          kendaraanId,
          pnsId,
          peran,
          tanggalMulai,
          tanggalSelesai,
          status: "AKTIF",
          catatan,
        };
        await api.post<PenugasanKendaraan>("/penugasan", input);
        onSaved("PNS berhasil ditugaskan. Status kendaraan menjadi digunakan.");
      }
    } catch (cause) {
      setError(errorMessage(cause));
      setDetails(errorDetails(cause));
      setSubmitting(false);
    }
  }

  const vehicleOptions = (vehicles.data?.data ?? []).filter(
    (vehicle) => vehicle.status !== "NONAKTIF",
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Ubah penugasan" : "Tugaskan PNS"}
      description={
        initial
          ? "Perbarui peran, tanggal, status, atau catatan penugasan."
          : "Hanya PNS aktif dan kendaraan nonaktif yang tidak dapat dipilih."
      }
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

        {initial ? (
          <div className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Kendaraan
              </p>
              <p className="mt-0.5 text-sm font-medium text-zinc-900">
                {initial.kendaraan?.nopol ?? `#${initial.kendaraanId}`}
              </p>
              <p className="text-xs text-zinc-500">
                {initial.kendaraan
                  ? `${initial.kendaraan.merek} ${initial.kendaraan.tipe}`
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                PNS
              </p>
              <p className="mt-0.5 text-sm font-medium text-zinc-900">
                {initial.pns?.nama ?? `#${initial.pnsId}`}
              </p>
              <p className="text-xs text-zinc-500">{initial.pns?.nip ?? ""}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kendaraan" htmlFor="penugasan-kendaraan" required>
              {fixedKendaraan ? (
                <div className="flex h-[38px] items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700">
                  {fixedKendaraan.nopol} — {fixedKendaraan.merek}{" "}
                  {fixedKendaraan.tipe}
                </div>
              ) : (
                <Select
                  id="penugasan-kendaraan"
                  name="kendaraanId"
                  required
                  defaultValue=""
                  disabled={vehicles.loading}
                >
                  <option value="" disabled>
                    {vehicles.loading ? "Memuat kendaraan…" : "Pilih kendaraan"}
                  </option>
                  {vehicleOptions.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.nopol} — {vehicle.merek} {vehicle.tipe}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="PNS" htmlFor="penugasan-pns" required>
              <Select
                id="penugasan-pns"
                name="pnsId"
                required
                defaultValue=""
                disabled={pnsList.loading}
              >
                <option value="" disabled>
                  {pnsList.loading ? "Memuat PNS…" : "Pilih PNS aktif"}
                </option>
                {(pnsList.data?.data ?? []).map((pns) => (
                  <option key={pns.id} value={pns.id}>
                    {pns.nama} — {pns.nip}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Peran" htmlFor="penugasan-peran" required>
            <Select
              id="penugasan-peran"
              name="peran"
              required
              defaultValue={initial?.peran ?? "PENANGGUNG_JAWAB"}
            >
              {peranOptions.map((peran) => (
                <option key={peran} value={peran}>
                  {peranLabels[peran]}
                </option>
              ))}
            </Select>
          </Field>
          {initial ? (
            <Field label="Status" htmlFor="penugasan-status" required>
              <Select
                id="penugasan-status"
                name="status"
                required
                defaultValue={initial.status}
              >
                {statusPenugasanOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusPenugasanLabels[status]}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <div className="flex items-end">
              <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs leading-4 text-blue-800">
                Penugasan baru selalu berstatus aktif. Status kendaraan akan
                otomatis menjadi digunakan.
              </p>
            </div>
          )}
          <Field label="Tanggal mulai" htmlFor="penugasan-mulai" required>
            <Input
              id="penugasan-mulai"
              name="tanggalMulai"
              type="date"
              required
              value={tanggalMulai}
              onChange={(event) => setTanggalMulai(event.target.value)}
            />
          </Field>
          <Field
            label="Tanggal selesai"
            htmlFor="penugasan-selesai"
            hint="Opsional untuk penugasan aktif."
          >
            <Input
              id="penugasan-selesai"
              name="tanggalSelesai"
              type="date"
              defaultValue={initial?.tanggalSelesai ?? ""}
            />
          </Field>
          <Field
            label="Catatan"
            htmlFor="penugasan-catatan"
            className="sm:col-span-2"
          >
            <Textarea
              id="penugasan-catatan"
              name="catatan"
              maxLength={1000}
              defaultValue={initial?.catatan ?? ""}
              placeholder="Penanggung jawab harian kendaraan operasional."
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Menyimpan…" : initial ? "Simpan" : "Tugaskan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
