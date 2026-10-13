import type { ReactNode } from "react";

// Satu pilihan besar (radio atau checkbox) dengan area sentuh luas.
export function Pilihan({ tipe, nama, label, aktif, nonaktif, onUbah, ikon, lencana }: {
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
      className={`flex min-h-sentuh items-center gap-3 rounded-kartu border-2 p-3 ${
        aktif ? "border-utama bg-utama-muda font-semibold" : "border-garis bg-white"
      } ${nonaktif ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        type={tipe}
        name={nama}
        checked={aktif}
        disabled={nonaktif}
        onChange={onUbah}
        className="h-6 w-6 shrink-0 accent-utama"
      />
      {ikon}
      <span className="flex-1">{label}</span>
      {lencana}
    </label>
  );
}

/** Pilihan ringkas berbentuk pil, untuk kelompok pilihan pendek yang boleh membungkus ke baris berikutnya. */
export function PilihanPil({ nama, label, aktif, onUbah }: {
  nama: string;
  label: string;
  aktif: boolean;
  onUbah: () => void;
}) {
  return (
    <label className="relative inline-flex">
      <input type="radio" name={nama} checked={aktif} onChange={onUbah} className="peer sr-only" />
      <span
        className={`inline-flex min-h-sentuh cursor-pointer items-center rounded-full border-2 px-4 py-2 text-base peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-utama ${
          aktif ? "border-utama bg-utama font-semibold text-white" : "border-garisKontrol bg-white text-tinta"
        }`}
      >
        {label}
      </span>
    </label>
  );
}
