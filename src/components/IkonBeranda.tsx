import { ClipboardList, MessagesSquare, Wrench } from "lucide-react";

// Ikon Beranda dari Lucide (ISC), diimpor satu per satu agar bundel tetap kecil. Dekoratif: artinya sudah ada di teks.
const ikon = {
  rencana: ClipboardList,
  alat: Wrench,
  ahli: MessagesSquare,
} as const;

export function IkonBeranda({ kunci, className = "h-8 w-8" }: { kunci: keyof typeof ikon; className?: string }) {
  const Komponen = ikon[kunci];
  return <Komponen className={`shrink-0 ${className}`} strokeWidth={2} aria-hidden="true" focusable="false" />;
}
