import { konten } from "../domain/content";
import { bingkaiBenda, susunBenda, type JenisBenda } from "../domain/gambarBenda";
import type { SisiDinding } from "../domain/gambarShower";
import { LapisPrimitif } from "./GambarShower";

/** Gambar benda kamar mandi (kloset, wastafel, pintu) bergaya manual perakitan. Teks alternatif dari `content/ui.json` (pindai.gambarBenda). */
export function GambarBenda({ jenis, sisi = "kanan", className }: { jenis: JenisBenda; sisi?: SisiDinding; className?: string }) {
  return (
    <svg viewBox={bingkaiBenda(jenis, sisi).join(" ")} role="img" aria-label={konten.ui.pindai.gambarBenda[jenis]} className={className}>
      <g strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
        <LapisPrimitif daftar={susunBenda(jenis, sisi)} />
      </g>
    </svg>
  );
}
