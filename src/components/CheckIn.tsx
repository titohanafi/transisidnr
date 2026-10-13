import { useState } from "react";
import { konten } from "../domain/content";
import { hariTerakhir, kunciHari, labelHari, namaHariSingkat, tanggalDalamBulan } from "../lib/tanggal";
import { useStore } from "../state/store";
import { Tombol } from "./Tombol";

const t = konten.ui.checkin;

// Cek kondisi harian caregiver. Belum diisi hari ini: kartu pilihan emoji yang mengajak.
// Sudah diisi: mengecil jadi satu baris tenang, riwayat 7 hari dilipat. Jawaban disimpan lokal per hari.
export function CheckIn() {
  const { state, setCheckin } = useStore();
  const [mengubah, setMengubah] = useState(false);
  const hariIni = kunciHari();
  const jawabanHariIni = state.riwayatCheckin[hariIni] ?? null;
  const pilihan = t.pilihan.find((p) => p.id === jawabanHariIni);

  if (pilihan && !mengubah) {
    return (
      <section aria-label={t.label} className="rounded-kartu border border-garis bg-white px-3 py-2">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-3xl leading-none">
            {pilihan.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {t.hariIni}: {pilihan.label}
            </p>
            <p aria-live="polite" className="text-sm text-redup">
              {pilihan.balasan}
            </p>
          </div>
          <Tombol gayaTombol="sekunder" onClick={() => setMengubah(true)} className="shrink-0 !px-3 text-sm">
            {t.ubah}
          </Tombol>
        </div>
        <Riwayat />
      </section>
    );
  }

  return (
    <fieldset className="rounded-kartu bg-utama-muda p-4">
      <legend className="sr-only">{t.label}</legend>
      <p className="text-sm font-semibold text-utama-gelap">{t.label}</p>
      <p className="mt-0.5 text-lg font-bold leading-snug">{t.pertanyaan}</p>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {t.pilihan.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={jawabanHariIni === p.id}
            aria-label={p.label}
            onClick={() => {
              setCheckin(p.id);
              setMengubah(false);
            }}
            className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-tombol border-2 bg-white px-0.5 py-2 ${
              jawabanHariIni === p.id ? "border-utama" : "border-transparent"
            }`}
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              {p.emoji}
            </span>
            <span aria-hidden="true" className="text-xs font-semibold">
              {p.singkat}
            </span>
          </button>
        ))}
      </div>
      {mengubah && (
        <button type="button" onClick={() => setMengubah(false)} className="mt-2 min-h-sentuh text-sm font-semibold text-utama-gelap underline">
          {konten.ui.umum.kembali}
        </button>
      )}
    </fieldset>
  );
}

function Riwayat() {
  const { state } = useStore();
  const hariIni = kunciHari();
  const hari = hariTerakhir(7);
  const cari = (id: string | undefined) => t.pilihan.find((p) => p.id === id);
  return (
    <details className="group mt-1 border-t border-garis">
      <summary className="flex min-h-sentuh cursor-pointer list-none items-center justify-between text-sm font-semibold text-utama-gelap [&::-webkit-details-marker]:hidden">
        <span>{t.riwayatJudul}</span>
        <span aria-hidden="true" className="group-open:hidden">+</span>
        <span aria-hidden="true" className="hidden group-open:inline">−</span>
      </summary>
      <ol className="grid grid-cols-7 gap-1 pb-2 text-center text-xs">
        {[...hari].reverse().map((h) => {
          const p = cari(state.riwayatCheckin[h]);
          const ini = h === hariIni;
          return (
            <li key={h} className="flex flex-col items-center gap-1">
              <span className="sr-only">
                {ini ? t.hariIni : labelHari(h)}: {p?.label ?? t.belumDiisi}
              </span>
              <span aria-hidden="true" className={ini ? "font-bold text-utama-gelap" : "text-redup"}>
                {namaHariSingkat(h)}
              </span>
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg leading-none ${
                  p ? "border-utama bg-utama-muda" : "border-dashed border-garisKontrol text-redup"
                } ${ini ? "ring-2 ring-utama ring-offset-1" : ""}`}
              >
                {p ? p.emoji : "·"}
              </span>
              <span aria-hidden="true" className="text-redup">
                {tanggalDalamBulan(h)}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="pb-3 text-xs text-redup">{t.penutup}</p>
    </details>
  );
}
