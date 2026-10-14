import { Link } from "react-router-dom";
import { konten } from "../domain/content";
import { kunciKelompok } from "../domain/jelajah";
import type { Kartu } from "../domain/schema";
import { Ikon } from "./Ikon";

const { umum } = konten.ui;

// Panduan yang isinya belum ada: baris ringkas dan redup supaya tidak mengalahkan panduan yang sudah berisi.
export function KartuKerangka({ kartu }: { kartu: Kartu }) {
  return (
    <Link
      to={`/kartu/${kartu.id}`}
      className="flex min-h-sentuh items-center gap-3 rounded-kartu border border-dashed border-garisKontrol bg-transparent p-3 hover:bg-white"
    >
      <Ikon kunci={kunciKelompok(kartu)} className="h-7 w-7 shrink-0 opacity-70" />
      <span className="flex-1">
        <span className="block font-semibold leading-snug">{kartu.judul}</span>
        <span className="block text-sm text-redup">{umum.isiMenyusul}</span>
      </span>
      <span aria-hidden className="text-xl text-redup">
        ›
      </span>
    </Link>
  );
}
