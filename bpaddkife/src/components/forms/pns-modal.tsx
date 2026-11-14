"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, errorDetails, errorMessage } from "@/lib/api";
import { golonganOptions } from "@/lib/domain";
import type {
  GolonganPns,
  Paginated,
  Pd,
  Pns,
  PnsInput,
} from "@/lib/types";
import { useApiData } from "@/lib/use-api";
import {
  Banner,
  Button,
  CheckboxField,
  Field,
  Input,
  Modal,
  Select,
} from "@/components/ui";

function optionalText(form: FormData, name: string): string | null {
  const value = String(form.get(name) ?? "").trim();
  return value ? value : null;
}

export function PnsModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Pns | null;
  onSaved: (message: string) => void;
}) {
  const pds = useApiData<Paginated<Pd>>(
    "/pd?limit=100&sortBy=nama&sortOrder=asc",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDetails([]);
    setSubmitting(false);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDetails([]);

    const form = new FormData(event.currentTarget);
    const golongan = String(form.get("golongan")) as GolonganPns;
    const input: PnsInput = {
      nama: String(form.get("nama") ?? "").trim(),
      nip: String(form.get("nip") ?? "").trim(),
      jabatan: String(form.get("jabatan") ?? "").trim(),
      golongan,
      pdId: Number(form.get("pdId")),
      email: optionalText(form, "email"),
      telepon: optionalText(form, "telepon"),
      aktif: form.get("aktif") === "on",
    };

    setSubmitting(true);
    try {
      if (initial) {
        await api.patch<Pns>(`/pns/${initial.id}`, input);
        onSaved(`Data PNS "${input.nama}" diperbarui.`);
      } else {
        await api.post<Pns>("/pns", input);
        onSaved(`PNS "${input.nama}" ditambahkan.`);
      }
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
      title={initial ? "Ubah data PNS" : "Tambah PNS"}
      description="Data PNS dipakai sebagai penanggung jawab atau pengemudi kendaraan."
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" htmlFor="pns-nama" required>
            <Input
              id="pns-nama"
              name="nama"
              required
              minLength={3}
              maxLength={150}
              defaultValue={initial?.nama}
              placeholder="Budi Santoso"
            />
          </Field>
          <Field
            label="NIP"
            htmlFor="pns-nip"
            required
            hint="Tepat 18 digit angka."
          >
            <Input
              id="pns-nip"
              name="nip"
              required
              pattern="\d{18}"
              title="NIP harus terdiri dari tepat 18 digit angka."
              maxLength={18}
              inputMode="numeric"
              defaultValue={initial?.nip}
              placeholder="197812312005011001"
            />
          </Field>
          <Field label="Jabatan" htmlFor="pns-jabatan" required>
            <Input
              id="pns-jabatan"
              name="jabatan"
              required
              minLength={2}
              maxLength={100}
              defaultValue={initial?.jabatan}
              placeholder="Kepala Sub Bagian Umum"
            />
          </Field>
          <Field label="Golongan" htmlFor="pns-golongan" required>
            <Select
              id="pns-golongan"
              name="golongan"
              required
              defaultValue={initial?.golongan ?? "III/a"}
            >
              {golonganOptions.map((golongan) => (
                <option key={golongan} value={golongan}>
                  {golongan}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Perangkat daerah" htmlFor="pns-pd" required>
            <Select
              id="pns-pd"
              name="pdId"
              required
              defaultValue={initial?.pdId ?? ""}
              disabled={pds.loading}
            >
              <option value="" disabled>
                Pilih perangkat daerah
              </option>
              {(pds.data?.data ?? []).map((pd) => (
                <option key={pd.id} value={pd.id}>
                  {pd.singkatan ? `${pd.singkatan} — ${pd.nama}` : pd.nama}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Email" htmlFor="pns-email">
            <Input
              id="pns-email"
              name="email"
              type="email"
              maxLength={150}
              defaultValue={initial?.email ?? ""}
              placeholder="budi.santoso@example.go.id"
            />
          </Field>
          <Field label="Telepon" htmlFor="pns-telepon">
            <Input
              id="pns-telepon"
              name="telepon"
              maxLength={30}
              defaultValue={initial?.telepon ?? ""}
              placeholder="081234567890"
            />
          </Field>
          <div className="flex items-end">
            <CheckboxField
              label="PNS aktif"
              name="aktif"
              defaultChecked={initial?.aktif ?? true}
              hint="PNS nonaktif tidak dapat ditugaskan ke kendaraan."
            />
          </div>
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
