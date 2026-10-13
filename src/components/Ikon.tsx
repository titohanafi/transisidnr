import { DoorOpen, HeartHandshake, ShowerHead, Sparkles, Toilet, Droplets, type LucideIcon } from "lucide-react";
import type { KunciKelompok } from "../domain/jelajah";

// Ikon aktivitas dari Lucide (ISC), diimpor satu per satu agar bundel kecil. Selalu dekoratif:
// artinya sudah ada di teks di sebelahnya, jadi disembunyikan dari pembaca layar.
const ikon: Record<KunciKelompok, LucideIcon> = {
  mandi: ShowerHead,
  toilet: Toilet,
  wudhu: Droplets,
  grooming: Sparkles,
  umum: DoorOpen,
  caregiver: HeartHandshake,
};

export function Ikon({ kunci, className = "h-10 w-10" }: { kunci: KunciKelompok; className?: string }) {
  const Komponen = ikon[kunci];
  return <Komponen className={`shrink-0 text-utama ${className}`} strokeWidth={2} aria-hidden="true" focusable="false" />;
}

// Ikon gambar sendiri yang masih dipakai (hanya kamera di layar foto).
const garis = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const ikonAksi = {
  // Kamera
  foto: (
    <g {...garis}>
      <path d="M6 16h8l3-5h14l3 5h8v22H6z" />
      <circle cx="24" cy="26" r="7" />
    </g>
  ),
} as const;

export function IkonAksi({ kunci, className = "h-10 w-10" }: { kunci: keyof typeof ikonAksi; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 text-utama ${className}`} aria-hidden="true" focusable="false">
      {ikonAksi[kunci]}
    </svg>
  );
}
