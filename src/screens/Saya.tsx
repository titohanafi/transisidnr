import { CalendarDays, DoorOpen, Flag, ListChecks, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import { BarisTautan } from "../components/BarisTautan";
import { RiwayatCheckin } from "../components/CheckIn";
import { Halaman } from "../components/Halaman";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";
import { useRuangan } from "../state/useRuangan";
import { useStore } from "../state/store";

const { saya: t, umum, asesmen } = konten.ui;

const namaAktivitas = (id: string) => konten.asesmen.aktivitas.find((a) => a.id === id)?.label.split(" (")[0] ?? id;

// Ruang pribadi di perangkat: ringkasan jawaban, riwayat check-in, dan pengelolaan data.
// Nanti bisa menampung checklist perkembangan (butuh konten yang ditinjau ahli lebih dulu).
export function Saya() {
  const { state } = useStore();
  const { ruangan } = useRuangan();
  const status = Object.entries(state.asesmen.status);
  const adaJawaban = status.length > 0;
  const adaCheckin = Object.keys(state.riwayatCheckin).length > 0;

  const judulKartu = (id: string, Ikon: LucideIcon, teks: string) => (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
        <Ikon className="h-6 w-6 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
      </span>
      <h2 id={id} className="text-subjudul">
        {teks}
      </h2>
    </div>
  );

  // Ikon kecil di kiri tiap baris ringkasan (dekoratif; artinya ada di label).
  const ikonBaris = (Ikon: LucideIcon) => (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tombol bg-permukaan text-utama">
      <Ikon className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
    </span>
  );

  return (
    <Halaman
      judul={t.judul}
      judulTersembunyi
      latarPutih
      kepalaPita="gelap"
      kepalaTumpang
      kepala={
        <div className="flex justify-center">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-utama-redup bg-white text-utama shadow-kartu"
          >
            <UserRound className="h-8 w-8" strokeWidth={2} focusable="false" />
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-bagian">
        <section className="-mt-4 rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu" aria-labelledby="saya-jawaban">
          <h2 id="saya-jawaban" className="text-kecil font-semibold">
            {t.jawabanJudul}
          </h2>
          {adaJawaban ? (
            <>
              <dl className="mt-2 divide-y divide-garis/60">
                <div className="flex items-start gap-3 py-3.5">
                  {ikonBaris(DoorOpen)}
                  <div className="min-w-0 flex-1">
                    <dt className="text-kecil text-redup">{t.ruangan}</dt>
                    <dd className="font-medium">{ruangan?.nama ?? t.belumDipilih}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-3.5">
                  {ikonBaris(ListChecks)}
                  <div className="min-w-0 flex-1">
                    <dt className="text-kecil text-redup">{t.aktivitas}</dt>
                    <dd>
                      <ul className="mt-1 space-y-1.5">
                        {status.map(([id, st]) => (
                          <li key={id} className="flex items-baseline justify-between gap-3">
                            <span className="font-medium">{namaAktivitas(id)}</span>
                            <span className="rounded-full bg-permukaan px-2.5 py-0.5 text-right text-kecil text-redup">
                              {asesmen.aktivitas.status[st as keyof typeof asesmen.aktivitas.status]}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-3.5">
                  {ikonBaris(Flag)}
                  <div className="min-w-0 flex-1">
                    <dt className="text-kecil text-redup">{t.prioritas}</dt>
                    <dd className="font-medium">
                      {state.asesmen.prioritas.length > 0 ? state.asesmen.prioritas.map(namaAktivitas).join(", ") : t.belumDipilih}
                    </dd>
                  </div>
                </div>
              </dl>
              <TombolLink to="/mulai/1" gayaTombol="sekunder" className="mt-5 w-full">
                {t.ubah}
              </TombolLink>
            </>
          ) : (
            <>
              <p className="mt-3 text-redup">{t.belumJawab}</p>
              <TombolLink to="/mulai/1" className="mt-5 w-full">
                {t.mulai}
              </TombolLink>
            </>
          )}
        </section>

        <section className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu" aria-labelledby="saya-checkin">
          {judulKartu("saya-checkin", CalendarDays, t.riwayatJudul)}
          <div className="mt-4">{adaCheckin ? <RiwayatCheckin /> : <p className="text-redup">{t.riwayatKosong}</p>}</div>
        </section>

        <BarisTautan ke="/hapus" teks={umum.dataPrivasi} keterangan={t.dataIsi} Ikon={ShieldCheck} />
      </div>
    </Halaman>
  );
}
