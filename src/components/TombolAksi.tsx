import { konten } from "../domain/content";
import { jalurAksi, type JenisAksi } from "../domain/aksi";
import type { Tingkat } from "../domain/schema";
import { track } from "../lib/events";
import { TombolLink } from "./Tombol";

// Tombol menuju halaman aksi; mencatat kejadian aksi_klik (tanpa data pribadi).
export function TombolAksi({
  jenis,
  kartuId,
  tingkat,
  judulKartu,
  gayaTombol = "utama",
  className,
}: {
  jenis: JenisAksi;
  kartuId: string;
  tingkat?: Tingkat;
  judulKartu?: string;
  gayaTombol?: "utama" | "sekunder";
  className?: string;
}) {
  return (
    <TombolLink
      to={jalurAksi(jenis, kartuId, tingkat)}
      gayaTombol={gayaTombol}
      className={className}
      onClick={() => track("aksi_klik", { jenis, kartu_id: kartuId })}
    >
      {konten.ui.aksi.tombol[jenis]}
      {judulKartu && <span className="sr-only">: {judulKartu}</span>}
    </TombolLink>
  );
}
