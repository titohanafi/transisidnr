import { ClipboardList } from "lucide-react";

// Ikon Beranda dari Lucide (ISC). Dekoratif: artinya sudah ada di teks.
export function IkonBeranda({ className = "h-8 w-8" }: { kunci?: "rencana"; className?: string }) {
  return <ClipboardList className={`shrink-0 ${className}`} strokeWidth={2} aria-hidden="true" focusable="false" />;
}
