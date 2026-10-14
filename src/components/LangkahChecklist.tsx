import { kunciChecklist } from "../domain/aksi";
import { konten } from "../domain/content";
import { Hammer, HeartHandshake, User, Users, type LucideIcon } from "lucide-react";
import type { PeranLangkah } from "../domain/konstanta";
import { ringkasLangkah, tingkatSetelah } from "../domain/langkah";
import type { Kartu, Tingkat } from "../domain/schema";
import { isi } from "../lib/teks";
import { useStore } from "../state/store";
import { BilahKemajuan } from "./BilahKemajuan";
import { Tombol, TombolLink } from "./Tombol";

const t = konten.ui.aksi.sendiri;
const namaPeran = konten.ui.kartu.peranLangkah;
const IKON_PERAN: Record<PeranLangkah, LucideIcon> = {
  penyandang_disabilitas: User,
  caregiver: HeartHandshake,
  bersama: Users,
  tukang: Hammer,
};

/**
 * Daftar langkah yang bisa dicentang langsung di panel solusi (tersimpan di perangkat), plus pertanyaan hasil
 * setelah semua langkah selesai. Hasil dipakai Panduan Saya untuk menandai beres atau menyarankan tingkat berikutnya.
 */
export function LangkahChecklist({
  kartu,
  tingkat,
  langkah,
  peran,
}: {
  kartu: Kartu;
  tingkat: Tingkat;
  langkah: string[];
  /** Siapa yang mengerjakan tiap langkah (urutan sama dengan `langkah`); bila kosong, tidak ada penanda. */
  peran?: readonly PeranLangkah[];
}) {
  const { state, toggleLangkah } = useStore();
  const kunci = kunciChecklist(kartu.id, tingkat);
  const { selesai, dorongan: kodeDorongan } = ringkasLangkah(state.checklist[kunci] ?? [], langkah.length);
  const progres = isi(t.progres, { n: selesai.length, total: langkah.length });
  const dorongan =
    kodeDorongan === "selesai"
      ? t.selesai
      : kodeDorongan === "separuh"
        ? t.dorongan.separuh
        : kodeDorongan === "mulai"
          ? t.dorongan.mulai
          : null;

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
                <span>
                  <span className={centang ? "line-through" : ""}>{l}</span>
                  {peran?.[i] && <PenandaPeran peran={peran[i]} />}
                </span>
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
    </div>
  );
}

/**
 * Pertanyaan "Bagaimana hasilnya?" yang muncul setelah semua langkah tercentang. Diletakkan terpisah dari daftar
 * langkah supaya bisa ada di bagian paling bawah panel. Hasil dipakai Panduan Saya (beres atau tingkat berikutnya).
 */
export function HasilLangkah({
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
  const { state, setHasil } = useStore();
  const { semuaSelesai } = ringkasLangkah(state.checklist[kunciChecklist(kartu.id, tingkat)] ?? [], langkah.length);
  const hasil = state.hasil[kartu.id];
  const hasilIni = hasil && hasil.tingkat === tingkat ? hasil.status : null;
  const berikut = tingkatSetelah(kartu, tingkat);
  if (!semuaSelesai) return null;

  return (
    <section className="border-t border-garis/70 pt-4" aria-labelledby={`hasil-${tingkat}`}>
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
            {berikut && (
              <Tombol className="mt-3 w-full" onClick={() => keTingkat(berikut)}>
                {t.hasil.berikutnya}
              </Tombol>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/** Penanda kecil siapa yang mengerjakan langkah. Teks selalu ada, ikon hanya hiasan. */
function PenandaPeran({ peran }: { peran: PeranLangkah }) {
  const Ikon = IKON_PERAN[peran];
  return (
    <span className="mt-1 flex items-center gap-1.5 text-mikro font-medium text-redup">
      <Ikon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
      {namaPeran[peran]}
    </span>
  );
}
