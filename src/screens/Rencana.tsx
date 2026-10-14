import { useEffect } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDot,
  DoorOpen,
  Flag,
  Printer,
  Sun,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BarisTautan } from "../components/BarisTautan";
import { BilahKemajuan } from "../components/BilahKemajuan";
import { Halaman } from "../components/Halaman";
import { Ikon } from "../components/Ikon";
import { KartuHero, TautanHero } from "../components/KartuHero";
import { KartuRingkas } from "../components/KartuRingkas";
import { LencanaStatus } from "../components/Lencana";
import { Lipat } from "../components/Lipat";
import { PeringatanNonMedis } from "../components/PeringatanNonMedis";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";
import { terapkanHasil } from "../domain/hasil";
import { track } from "../lib/events";
import { formatRentang } from "../lib/format";
import { kunciHari } from "../lib/tanggal";
import { Jelajah } from "./Jelajah";
import { isi } from "../lib/teks";
import { useRencana } from "../state/useRencana";
import { useRuangan } from "../state/useRuangan";
import { useStore } from "../state/store";

const { rencana: t } = konten.ui;

// Jumlah panduan di samping judul bagian, dalam pil kecil.
function Hitungan({ n }: { n: number }) {
  return <span className="rounded-full bg-utama-muda px-2.5 py-0.5 text-kecil font-semibold tabular-nums text-utama-gelap">{n}</span>;
}

export function Rencana() {
  const { state } = useStore();
  const { rencana, masukan } = useRencana();
  const { ruangan } = useRuangan();
  const jumlahKartu = rencana.daftar.length;
  useEffect(() => {
    track("rencana_dibuat", { jumlah_kartu: jumlahKartu });
  }, [jumlahKartu]);

  // Belum menjawab: tab ini menampilkan semua panduan, bukan langsung ke pertanyaan.
  if (Object.keys(state.asesmen.status).length === 0) return <Jelajah />;

  // Bila caregiver bilang sedang lelah, tampilkan satu hal saja dan simpan sisanya di lipatan.
  // Yang dihitung hanya jawaban hari ini, supaya "lelah" minggu lalu tidak terus mengurangi rencana.
  const hariIni = state.riwayatCheckin[kunciHari()];
  const ringan = hariIni === "capek_fisik" || hariIni === "capek_emosi" || hariIni === "butuh_istirahat";
  const h = terapkanHasil(rencana, state.hasil, konten.kartu);

  const dataKartu = (id: string) => konten.kartu.find((k) => k.id === id);
  const lainnya = h.lainnya.filter((k) => !k.isiMenyusul);
  const disusun = h.lainnya.filter((k) => k.isiMenyusul);
  const pendamping = rencana.pendamping ? dataKartu(rencana.pendamping) : undefined;
  const satuHal = h.satuHal;
  const labelAkt = (id: string) => konten.asesmen.aktivitas.find((a) => a.id === id)?.label.split(" (")[0] ?? id;

  const daftarKartu = (daftar: typeof h.mulai) => (
    <div className="mt-isi space-y-4">
      {daftar.map((k) => (
        <KartuRingkas key={k.id} kartu={k} />
      ))}
    </div>
  );

  const daftarLengkap = (
    <div className="flex flex-col gap-bagian">
      {h.mulai.length > 0 && (
        <section aria-labelledby="mulai">
          <h2 id="mulai" className="flex items-center gap-2 text-subjudul">
            {t.mulaiDariSini}
            <Hitungan n={h.mulai.length} />
          </h2>
          {daftarKartu(h.mulai)}
        </section>
      )}

      {lainnya.length > 0 && (
        <section aria-labelledby="lainnya">
          <h2 id="lainnya" className="flex items-center gap-2 text-subjudul">
            {t.semuaRekomendasi}
            <Hitungan n={lainnya.length} />
          </h2>
          {daftarKartu(lainnya)}
        </section>
      )}

      {h.beres.length > 0 && (
        <Lipat className="" judul={isi(t.beres.lihat, { n: h.beres.length })}>
          <div className="space-y-3">
            {h.beres.map((k) => (
              <KartuRingkas key={k.id} kartu={k} />
            ))}
          </div>
        </Lipat>
      )}

      {disusun.length > 0 && (
        <Lipat className="" judul={`${t.sedangDisusun} (${disusun.length})`} buka={h.mulai.length === 0 && lainnya.length === 0}>
          <div className="space-y-3">
            {disusun.map((k) => (
              <KartuRingkas key={k.id} kartu={k} />
            ))}
          </div>
        </Lipat>
      )}
    </div>
  );

  // Pita kepala: dua baris berlabel (ruangan dan prioritas), tiap baris dengan jalan pintas untuk mengubahnya.
  const tautanUbah = "inline-flex min-h-sentuh shrink-0 items-center font-semibold text-utama underline";
  const kotakIkon = (Ikon: LucideIcon) => (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda text-utama">
      <Ikon className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
    </span>
  );
  const kepala = (
    <div className="mt-3 divide-y divide-utama-redup/60 rounded-kartu border border-utama-redup bg-white">
      {ruangan && (
        <div className="flex items-center gap-3 p-3">
          {kotakIkon(DoorOpen)}
          <div className="min-w-0 flex-1">
            <p className="text-kecil text-redup">{konten.ui.saya.ruangan}</p>
            <p className="font-semibold">{ruangan.nama}</p>
          </div>
          {konten.config.ruangan.length > 1 && (
            <Link to="/ruangan" className={tautanUbah}>
              {konten.ui.asesmen.ubahRuangan}
            </Link>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 p-3">
        {kotakIkon(Flag)}
        <div className="min-w-0 flex-1">
          <p className="text-kecil text-redup">{konten.ui.saya.prioritas}</p>
          <p className="font-semibold">{masukan.prioritas.map(labelAkt).join(", ")}</p>
        </div>
        <Link to="/asesmen/aktivitas" className={tautanUbah}>
          {t.ubahJawaban}
        </Link>
      </div>
    </div>
  );

  return (
    <Halaman judul={t.judul} kepala={kepala} kepalaPita="hijau" kepalaTumpang latarPutih>
      <div className="flex flex-col gap-bagian">
        {h.jumlahPanduan > 0 && (
          <section className="rounded-kartu border border-garis/70 bg-white p-4 shadow-kartu" aria-label={t.beres.judul}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda text-utama">
                <CircleCheck className="h-6 w-6" strokeWidth={2} aria-hidden="true" focusable="false" />
              </span>
              <p className="font-semibold">{isi(t.beres.ringkasan, { n: h.beres.length, total: h.jumlahPanduan })}</p>
            </div>
            <BilahKemajuan
              n={h.beres.length}
              total={h.jumlahPanduan}
              label={isi(t.beres.ringkasan, { n: h.beres.length, total: h.jumlahPanduan })}
              className="mt-3"
            />
            {h.beres.length === 0 && <p className="mt-3 text-kecil text-redup">{t.beres.kosong}</p>}
            <details className="group -mx-4 -mb-4 mt-4 border-t border-garis/60">
              <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-2 px-4 font-semibold text-utama [&::-webkit-details-marker]:hidden">
                <span>{t.beres.rincian}</span>
                <ChevronDown
                  className="h-5 w-5 shrink-0 motion-safe:transition-transform group-open:rotate-180"
                  strokeWidth={2}
                  aria-hidden="true"
                  focusable="false"
                />
              </summary>
              <ul className="divide-y divide-garis/60 border-t border-garis/60 px-4">
                {rencana.daftar
                  .filter((k) => !k.isiMenyusul)
                  .map((k) => {
                    // Urutan: hasil yang dicatat pengguna, lalu langkah yang sudah dicentang (setengah jalan), lalu belum dicoba.
                    const hasil = state.hasil[k.id]?.status;
                    const setengah = Object.entries(state.checklist).some(
                      ([kunci, nomor]) => kunci.startsWith(`${k.id}:`) && nomor.length > 0,
                    );
                    const status = hasil ?? (setengah ? "sedang" : "belum");
                    // Pil status: ikon + teks + warna lembut (arti tidak bergantung pada warna saja).
                    const { Ikon, kelas, label } = {
                      cukup: {
                        Ikon: CircleCheck,
                        kelas: "border-utama bg-utama-muda text-utama-gelap",
                        label: konten.ui.jelajah.status.cukup,
                      },
                      masih_sulit: {
                        Ikon: CircleAlert,
                        kelas: "border-aksen bg-aksen-muda text-aksen",
                        label: konten.ui.jelajah.status.masih_sulit,
                      },
                      sedang: { Ikon: CircleDot, kelas: "border-info bg-info-muda text-info", label: t.beres.sedang },
                      belum: { Ikon: Circle, kelas: "border-garisKontrol bg-permukaan text-redup", label: t.beres.belumDicoba },
                    }[status];
                    return (
                      <li key={k.id}>
                        <Link to={`/kartu/${k.id}`} className="tekan flex min-h-[56px] items-center gap-3 py-3">
                          <span className="min-w-0 flex-1">
                            <span className="block leading-snug">{dataKartu(k.id)?.judul}</span>
                            <span
                              className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-kecil font-medium ${kelas}`}
                            >
                              <Ikon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden="true" focusable="false" />
                              {label}
                            </span>
                          </span>
                          <ChevronRight className="h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </details>
          </section>
        )}

        {rencana.kosong ? (
          <section className="rounded-kartu bg-utama-muda p-5" aria-labelledby="kosong">
            <h2 id="kosong" className="text-subjudul">
              {t.kosongJudul}
            </h2>
            <p className="mt-2">{t.kosongIsi}</p>
          </section>
        ) : (
          <>
            {satuHal && (
              <KartuHero
                id="satu-hal"
                ikon={<Sun className="h-9 w-9 shrink-0 text-daun" strokeWidth={2} aria-hidden="true" focusable="false" />}
                judul={t.satuHal}
              >
                <p className="relative mt-2.5 text-lg">{satuHal.langkah}</p>
                <p className="relative mt-2 text-kecil text-utama-redup">
                  {isi(t.dariKartu, { judul: dataKartu(satuHal.kartuId)?.judul ?? "" })}
                </p>
                <TautanHero to={`/kartu/${satuHal.kartuId}/${satuHal.tingkat}`}>{t.lihatKartu}</TautanHero>
              </KartuHero>
            )}

            {!satuHal && h.mulai.length === 0 && (
              <p role="note" className="rounded-kartu border border-draf bg-draf-muda p-4 text-draf">
                {t.belumAdaSiap}
              </p>
            )}

            {(rencana.total.diketahui || rencana.kebutuhanJangkaPanjangBelumJelas) && (
              <div className="flex items-start gap-3 rounded-kartu border border-garis/70 bg-white p-4 shadow-kartu">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda text-utama">
                  <Wallet className="h-6 w-6" strokeWidth={2} aria-hidden="true" focusable="false" />
                </span>
                <div className="min-w-0 flex-1 self-center">
                  {rencana.total.diketahui && (
                    <p className="font-medium">
                      {isi(t.total, { rentang: formatRentang({ min: rencana.total.minRp, max: rencana.total.maksRp }) })}
                    </p>
                  )}
                  {rencana.kebutuhanJangkaPanjangBelumJelas && (
                    <p className={`text-kecil text-redup ${rencana.total.diketahui ? "mt-1" : ""}`}>{t.belumJelas}</p>
                  )}
                </div>
              </div>
            )}

            {ringan ? (
              <Lipat className="" judul={t.ringan.lihatNanti}>
                {daftarLengkap}
              </Lipat>
            ) : (
              daftarLengkap
            )}
          </>
        )}

        <ul className="space-y-3">
          <li>
            <BarisTautan ke="/cetak" teks={t.cetak} Ikon={Printer} />
          </li>
          <li>
            <BarisTautan ke="/jelajah" teks={t.semuaPanduan} Ikon={BookOpen} />
          </li>
        </ul>

        {pendamping && (
          <section aria-labelledby="pendamping">
            <h2 id="pendamping" className="text-subjudul">
              {t.pendampingJudul}
            </h2>
            <article className="mt-isi rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
                  <Ikon kunci="caregiver" className="h-6 w-6" />
                </span>
                <h3 className="text-judulKartu">{pendamping.judul}</h3>
              </div>
              <div className="mt-2 empty:hidden">
                <LencanaStatus status={pendamping.status_validasi} />
              </div>
              <p className="mt-2 text-redup">{pendamping.situasi}</p>
              <TombolLink to={`/kartu/${pendamping.id}`} className="mt-4 w-full">
                {t.bukaKartu}
                <span className="sr-only">: {pendamping.judul}</span>
              </TombolLink>
            </article>
          </section>
        )}
      </div>
      <PeringatanNonMedis />
    </Halaman>
  );
}
