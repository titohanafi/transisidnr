import { konten } from "../domain/content";
import { hariTerakhir, kunciHari, labelHari, namaHariSingkat, tanggalDalamBulan } from "../lib/tanggal";
import { useStore } from "../state/store";
import { PilihanPil } from "./Pilihan";

const t = konten.ui.checkin;

// Cek kondisi harian yang ringan untuk caregiver: satu baris pertanyaan, pilihan kecil, riwayat dilipat.
// Jawaban disimpan lokal per hari; tanpa skor dan tanpa diagnosis.
export function CheckIn() {
  const { state, setCheckin } = useStore();
  const hariIni = kunciHari();
  const jawabanHariIni = state.riwayatCheckin[hariIni] ?? null;
  const pilihan = t.pilihan.find((p) => p.id === jawabanHariIni);
  const cari = (id: string | undefined) => t.pilihan.find((p) => p.id === id);
  const labelDari = (id: string | undefined) => cari(id)?.label;
  const hari = hariTerakhir(7);
  const adaRiwayat = Object.keys(state.riwayatCheckin).length > 0;

  return (
    <fieldset className="rounded-kartu border border-garis bg-white p-3">
      <legend className="px-1 text-sm text-redup">{t.label}</legend>
      <p className="font-semibold">{t.pertanyaan}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {t.pilihan.map((p) => (
          <PilihanPil key={p.id} nama="checkin" label={`${p.emoji} ${p.label}`} aktif={jawabanHariIni === p.id} onUbah={() => setCheckin(p.id)} />
        ))}
      </div>
      <div aria-live="polite">
        {pilihan && (
          <p className="mt-3 text-sm text-redup">
            {pilihan.balasan} {t.penutup}
          </p>
        )}
      </div>
      {adaRiwayat && (
        <details className="group mt-3 border-t border-garis pt-1">
          <summary className="flex min-h-sentuh cursor-pointer list-none items-center justify-between text-sm font-semibold text-utama-gelap [&::-webkit-details-marker]:hidden">
            <span>{t.riwayatJudul}</span>
            <span aria-hidden="true" className="group-open:hidden">+</span>
            <span aria-hidden="true" className="hidden group-open:inline">−</span>
          </summary>
          <ol className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
            {[...hari].reverse().map((h) => {
              const id = state.riwayatCheckin[h];
              const label = labelDari(id);
              const ini = h === hariIni;
              return (
                <li key={h} className="flex flex-col items-center gap-1">
                  <span className="sr-only">
                    {ini ? t.hariIni : labelHari(h)}: {label ?? t.belumDiisi}
                  </span>
                  <span aria-hidden="true" className={ini ? "font-bold text-utama-gelap" : "text-redup"}>
                    {namaHariSingkat(h)}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg leading-none ${
                      id ? "border-utama bg-utama-muda text-utama-gelap" : "border-dashed border-garisKontrol text-redup"
                    } ${ini ? "ring-2 ring-utama ring-offset-1" : ""}`}
                  >
                    {id ? cari(id)?.emoji : "·"}
                  </span>
                  <span aria-hidden="true" className="text-redup">
                    {tanggalDalamBulan(h)}
                  </span>
                </li>
              );
            })}
          </ol>
          <ul aria-label={t.artiIkon} className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-redup">
            {t.pilihan.map((p) => (
              <li key={p.id} className="flex items-center gap-1">
                <span aria-hidden="true">{p.emoji}</span>
                {p.label}
              </li>
            ))}
          </ul>
        </details>
      )}
    </fieldset>
  );
}
