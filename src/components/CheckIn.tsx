import { useState } from "react";
import { Link } from "react-router-dom";
import { konten } from "../domain/content";
import { hariTerakhir, kunciHari, labelHari, namaHariSingkat, tanggalDalamBulan } from "../lib/tanggal";
import { useStore } from "../state/store";

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
      <section aria-label={t.label} className="flex items-center gap-3 rounded-kartu border border-garis bg-white px-4 py-3">
        <span aria-hidden="true" className="text-3xl leading-none">
          {pilihan.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {t.hariIni}: {pilihan.label}
          </p>
          <Link
            to={pilihan.bantuan.panduan ? `/kartu/${pilihan.bantuan.panduan}` : (pilihan.bantuan.ke ?? "/")}
            className="inline-flex min-h-sentuh items-center text-sm font-semibold text-utama-gelap underline"
          >
            {pilihan.bantuan.tombol}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setMengubah(true)}
          className="-mr-2 min-h-sentuh min-w-sentuh shrink-0 px-2 text-sm font-semibold text-utama-gelap underline"
        >
          {t.ubah}
        </button>
      </section>
    );
  }

  return (
    <fieldset className="rounded-kartu bg-utama-muda p-4">
      <legend className="sr-only">{t.label}</legend>
      <p aria-hidden="true" className="text-sm font-semibold text-utama-gelap">
        {t.label}
      </p>
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

/** Deretan 7 hari terakhir. Dipakai di layar Saya. */
export function RiwayatCheckin() {
  const { state } = useStore();
  const hariIni = kunciHari();
  const hari = hariTerakhir(7);
  const cari = (id: string | undefined) => t.pilihan.find((p) => p.id === id);
  return (
    <div>
      <ol className="grid grid-cols-7 gap-1 text-center text-xs">
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
      <p className="mt-3 text-xs text-redup">{t.penutup}</p>
    </div>
  );
}
