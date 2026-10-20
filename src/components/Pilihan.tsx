import type { ReactNode } from "react";

// Satu pilihan besar (radio atau checkbox) dengan area sentuh luas.
export function Pilihan({
  tipe,
  nama,
  label,
  aktif,
  nonaktif,
  onUbah,
  ikon,
  lencana,
}: {
  tipe: "radio" | "checkbox";
  nama: string;
  label: string;
  aktif: boolean;
  nonaktif?: boolean;
  onUbah: () => void;
  /** Ikon dekoratif di depan label. */
  ikon?: ReactNode;
  /** Penanda di ujung kanan, mis. nomor urutan. */
  lencana?: ReactNode;
}) {
  return (
    <label
      className={`flex min-h-sentuh items-center gap-3 rounded-kartu border p-4 ${
        aktif ? "border-utama bg-utama-muda font-semibold" : "border-garis bg-white shadow-kartu"
      } ${nonaktif ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input type={tipe} name={nama} checked={aktif} disabled={nonaktif} onChange={onUbah} className="h-6 w-6 shrink-0 accent-utama" />
      {ikon}
      <span className="flex-1">{label}</span>
      {lencana}
    </label>
  );
}

/** Pilihan ringkas berbentuk pil, untuk kelompok pilihan pendek yang boleh membungkus ke baris berikutnya. */
export function PilihanPil({
  nama,
  label,
  aktif,
  onUbah,
  gaya = "pil",
}: {
  nama: string;
  /** Biasanya teks; boleh elemen (mis. titik warna + teks) untuk menandai kategori lewat warna juga, tidak cuma teks. */
  label: ReactNode;
  aktif: boolean;
  onUbah: () => void;
  /** "tab": sama lebar, memenuhi satu baris penuh (mis. kelompok status yang selalu 3 pilihan) — dibedakan dari
   *  "pil" bawaan (lebar sesuai teks, boleh membungkus) yang dipakai saat jumlah/panjang pilihan tidak pasti. */
  gaya?: "pil" | "tab";
}) {
  if (gaya === "tab") {
    // Gaya sama dengan tab "Pilihan solusi" di layar detail kartu: trek abu (pembungkus di pemanggil) + segmen putih
    // terangkat untuk yang aktif, tanpa border — dibedakan dari "pil" bawaan di bawah yang pakai border+warna utama.
    return (
      <label className="relative flex flex-1">
        <input type="radio" name={nama} checked={aktif} onChange={onUbah} className="peer sr-only" />
        <span
          className={`flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-tombol px-2 py-2 text-kecil font-semibold leading-snug motion-safe:transition-colors peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-utama ${
            aktif ? "bg-white text-utama-gelap shadow-kartu" : "text-redup hover:text-tinta"
          }`}
        >
          {label}
        </span>
      </label>
    );
  }
  return (
    <label className="relative inline-flex">
      <input type="radio" name={nama} checked={aktif} onChange={onUbah} className="peer sr-only" />
      <span
        className={`inline-flex min-h-sentuh w-full cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-base peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-utama ${
          aktif ? "border-utama bg-utama font-semibold text-white" : "border-garisKontrol bg-white text-tinta"
        }`}
      >
        {label}
      </span>
    </label>
  );
}
