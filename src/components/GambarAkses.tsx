import { useId } from "react";
import { konten } from "../domain/content";
import { susunAkses } from "../domain/gambarAkses";
import { LEBAR_KANVAS, TINGGI_KANVAS, type ModeGambar, type SisiDinding } from "../domain/gambarShower";
import { LapisPrimitif } from "./GambarShower";

/** Gambar akses mandi (bak mandi tembok, ember di bangku, area shower rata) bergaya manual perakitan. Teks alternatif dari `content/ui.json`. */
export function GambarAkses({ mode, sisi = "kanan", className }: { mode: ModeGambar; sisi?: SisiDinding; className?: string }) {
  const penanda = `${useId()}-ujung`;
  return (
    <svg viewBox={`0 0 ${LEBAR_KANVAS} ${TINGGI_KANVAS}`} role="img" aria-label={konten.ui.pindai.gambarAkses[mode]} className={className}>
      <defs>
        <marker id={penanda} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="fill-tinta" />
        </marker>
      </defs>
      <g strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
        <LapisPrimitif daftar={susunAkses(mode, sisi)} penanda={penanda} />
      </g>
    </svg>
  );
}
