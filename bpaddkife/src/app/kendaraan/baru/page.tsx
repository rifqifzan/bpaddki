import type { Metadata } from "next";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Tambah kendaraan",
};

export default function NewVehiclePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Data kendaraan"
        title="Tambah kendaraan"
        description="Daftarkan unit kendaraan dinas operasional beserta identitas dan status awalnya."
      />
      <VehicleForm cancelHref="/kendaraan" />
    </div>
  );
}
