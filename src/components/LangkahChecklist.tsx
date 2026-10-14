import { kunciChecklist } from "../domain/aksi";
import { konten } from "../domain/content";
import { TINGKAT } from "../domain/konstanta";
import type { Kartu, Tingkat } from "../domain/schema";
import { isi } from "../lib/teks";
import { useStore } from "../state/store";
import { BilahKemajuan } from "./BilahKemajuan";
import { Tombol, TombolLink } from "./Tombol";

const t = konten.ui.aksi.sendiri;

/**
 * Daftar langkah yang bisa dicentang langsung di panel solusi (tersimpan di perangkat), plus pertanyaan hasil
 * setelah semua langkah selesai. Hasil dipakai Panduan Saya untuk menandai beres atau menyarankan tingkat berikutnya.
 */
export function LangkahChecklist({
  kartu,
  tingkat,
  langkah,
  keTingkat,
}: {
  kartu: Kartu;
  tingkat: Tingkat;
  langkah: string[];
  /** Pindah ke tingkat solusi lain di halaman yang sama. */
  keTingkat: (t: Tingkat) => void;
}) {
  const { state, toggleLangkah, setHasil } = useStore();
  const kunci = kunciChecklist(kartu.id, tingkat);
  const selesai = (state.checklist[kunci] ?? []).filter((n) => n < langkah.length);
  const semuaSelesai = langkah.length > 0 && selesai.length === langkah.length;
  const hasil = state.hasil[kartu.id];
  const hasilIni = hasil && hasil.tingkat === tingkat ? hasil.status : null;
  const berikut = TINGKAT.find((x) => TINGKAT.indexOf(x) > TINGKAT.indexOf(tingkat) && kartu.solusi?.[x]);
  const progres = isi(t.progres, { n: selesai.length, total: langkah.length });
  const dorongan =
    selesai.length === 0 ? null : semuaSelesai ? t.selesai : selesai.length * 2 >= langkah.length ? t.dorongan.separuh : t.dorongan.mulai;

  return (
    <div>
      <p className="font-semibold" aria-live="polite">
        {progres}
      </p>
      <BilahKemajuan n={selesai.length} total={langkah.length} label={progres} />
      <ul className="mt-3 space-y-2">
        {langkah.map((l, i) => {
          const centang = selesai.includes(i);
          return (
            <li key={i}>
              <label
                className={`flex min-h-sentuh cursor-pointer items-start gap-3 rounded-tombol p-3 ${centang ? "bg-utama-muda" : "bg-permukaan"}`}
              >
                <input
                  type="checkbox"
                  checked={centang}
                  onChange={() => toggleLangkah(kunci, i)}
                  className="mt-0.5 h-6 w-6 shrink-0 accent-utama"
                />
                <span className={centang ? "line-through" : ""}>{l}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">
        {dorongan && (
          <p key={dorongan} className="mt-3 rounded-tombol bg-utama-muda p-4 font-medium motion-safe:animate-muncul">
            {dorongan}
          </p>
        )}
      </div>

      {semuaSelesai && (
        <section className="mt-5 border-t border-garis/70 pt-4" aria-labelledby={`hasil-${tingkat}`}>
          <h4 id={`hasil-${tingkat}`} className="font-semibold">
            {t.hasil.judul}
          </h4>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Tombol
              gayaTombol={hasilIni === "cukup" ? "utama" : "sekunder"}
              aria-pressed={hasilIni === "cukup"}
              onClick={() => setHasil(kartu.id, hasilIni === "cukup" ? null : { status: "cukup", tingkat })}
            >
              {t.hasil.cukup}
            </Tombol>
            <Tombol
              gayaTombol={hasilIni === "masih_sulit" ? "utama" : "sekunder"}
              aria-pressed={hasilIni === "masih_sulit"}
              onClick={() => setHasil(kartu.id, hasilIni === "masih_sulit" ? null : { status: "masih_sulit", tingkat })}
            >
              {t.hasil.sulit}
            </Tombol>
          </div>
          <div aria-live="polite">
            {hasilIni === "cukup" && (
              <>
                <p className="mt-3 motion-safe:animate-muncul">{t.hasil.balasCukup}</p>
                <TombolLink to="/rencana" className="mt-3 w-full">
                  {t.hasil.keRencana}
                </TombolLink>
              </>
            )}
            {hasilIni === "masih_sulit" && (
              <>
                <p className="mt-3 motion-safe:animate-muncul">{berikut ? t.hasil.balasSulit : t.hasil.terakhir}</p>
                {berikut ? (
                  <Tombol className="mt-3 w-full" onClick={() => keTingkat(berikut)}>
                    {t.hasil.berikutnya}
                  </Tombol>
                ) : (
                  <TombolLink to={`/aksi/ahli/${kartu.id}`} className="mt-3 w-full">
                    {konten.ui.aksi.tombol.ahli}
                  </TombolLink>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
