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
