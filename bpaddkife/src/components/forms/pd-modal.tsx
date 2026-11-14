"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, errorDetails, errorMessage } from "@/lib/api";
import type { Pd, PdInput } from "@/lib/types";
import {
  Banner,
  Button,
  CheckboxField,
  Field,
  Input,
  Modal,
  Textarea,
} from "@/components/ui";

function optionalText(form: FormData, name: string): string | null {
  const value = String(form.get(name) ?? "").trim();
  return value ? value : null;
}

export function PdModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Pd | null;
  onSaved: (message: string) => void;
}) {
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
    const input: PdInput = {
      kode: String(form.get("kode") ?? "").trim().toUpperCase(),
      nama: String(form.get("nama") ?? "").trim(),
      singkatan: optionalText(form, "singkatan"),
      alamat: optionalText(form, "alamat"),
      telepon: optionalText(form, "telepon"),
      aktif: form.get("aktif") === "on",
    };

    setSubmitting(true);
    try {
      if (initial) {
        await api.patch<Pd>(`/pd/${initial.id}`, input);
        onSaved(`Perangkat daerah "${input.nama}" diperbarui.`);
      } else {
        await api.post<Pd>("/pd", input);
        onSaved(`Perangkat daerah "${input.nama}" ditambahkan.`);
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
      title={initial ? "Ubah perangkat daerah" : "Tambah perangkat daerah"}
      description="Kode unik, nama, dan status aktif perangkat daerah."
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Kode"
            htmlFor="pd-kode"
            required
            hint="Huruf kapital, angka, atau tanda hubung."
          >
            <Input
              id="pd-kode"
              name="kode"
              required
              minLength={2}
              maxLength={20}
              pattern="[A-Za-z0-9\-]+"
              title="Kode hanya boleh berisi huruf, angka, dan tanda hubung."
              defaultValue={initial?.kode}
              placeholder="DISDIK"
              className="uppercase"
            />
          </Field>
          <Field label="Nama lengkap" htmlFor="pd-nama" required>
            <Input
              id="pd-nama"
              name="nama"
              required
              minLength={3}
              maxLength={150}
              defaultValue={initial?.nama}
              placeholder="Dinas Pendidikan"
            />
          </Field>
          <Field label="Singkatan" htmlFor="pd-singkatan">
            <Input
              id="pd-singkatan"
              name="singkatan"
              maxLength={50}
              defaultValue={initial?.singkatan ?? ""}
              placeholder="DPendidikan"
            />
          </Field>
          <Field label="Telepon" htmlFor="pd-telepon">
            <Input
              id="pd-telepon"
              name="telepon"
              maxLength={30}
              defaultValue={initial?.telepon ?? ""}
              placeholder="021-1234567"
            />
          </Field>
          <Field label="Alamat" htmlFor="pd-alamat" className="sm:col-span-2">
            <Textarea
              id="pd-alamat"
              name="alamat"
              maxLength={255}
              defaultValue={initial?.alamat ?? ""}
              placeholder="Jl. Pendidikan No. 1, Jakarta"
            />
          </Field>
          <div className="sm:col-span-2">
            <CheckboxField
              label="Perangkat daerah aktif"
              name="aktif"
              defaultChecked={initial?.aktif ?? true}
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
