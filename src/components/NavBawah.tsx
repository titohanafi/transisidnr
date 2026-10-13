import { konten } from "../domain/content";
import { Tombol } from "./Tombol";

// Tombol kembali/lanjut di bagian bawah layar, mudah dijangkau satu tangan.
export function NavBawah({ onKembali, onLanjut, lanjutNonaktif, teksLanjut }: {
  onKembali: () => void;
  onLanjut: () => void;
  lanjutNonaktif?: boolean;
  teksLanjut?: string;
}) {
  const { umum } = konten.ui;
  return (
    <div className="sticky bottom-0 mt-auto flex gap-3 bg-kertas pb-4 pt-6">
      <Tombol gayaTombol="sekunder" onClick={onKembali} className="flex-1">
        {umum.kembali}
      </Tombol>
      <Tombol onClick={onLanjut} disabled={lanjutNonaktif} className="flex-1">
        {teksLanjut ?? umum.lanjut}
      </Tombol>
    </div>
  );
}
