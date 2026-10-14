import { CircleAlert, CircleCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { konten } from "../domain/content";
import type { Kartu } from "../domain/schema";
import { useStore } from "../state/store";

const status = konten.ui.jelajah.status;

// Baris panduan di dalam kartu kelompok: judul, penanda hasil (beres atau masih sulit) bila pengguna sudah mencatatnya, dan panah.
export function KartuBaris({ kartu }: { kartu: Kartu }) {
  const hasil = useStore().state.hasil[kartu.id]?.status;
  return (
    <Link to={`/kartu/${kartu.id}`} className="tekan flex min-h-[56px] items-center gap-3 px-4 py-3 hover:bg-utama-muda">
      <span className="flex-1 leading-snug">{kartu.judul}</span>
      {hasil === "cukup" && (
        <span className="inline-flex shrink-0 items-center gap-1 text-kecil font-medium text-utama-gelap">
          <CircleCheck className="h-4 w-4" strokeWidth={2} aria-hidden="true" focusable="false" />
          {status.cukup}
        </span>
      )}
      {hasil === "masih_sulit" && (
        <span className="inline-flex shrink-0 items-center gap-1 text-kecil font-medium text-aksen">
          <CircleAlert className="h-4 w-4" strokeWidth={2} aria-hidden="true" focusable="false" />
          {status.masih_sulit}
        </span>
      )}
      <ChevronRight className="h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
    </Link>
  );
}
