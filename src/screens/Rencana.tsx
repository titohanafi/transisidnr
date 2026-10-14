import { useEffect } from "react";
import { BookOpen, Printer, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { BarisTautan } from "../components/BarisTautan";
import { BarisRuangan } from "../components/BarisRuangan";
import { BilahKemajuan } from "../components/BilahKemajuan";
import { Halaman } from "../components/Halaman";
import { Ikon } from "../components/Ikon";
import { KartuHero, TautanHero } from "../components/KartuHero";
import { KartuRingkas } from "../components/KartuRingkas";
import { LencanaStatus, Tanda } from "../components/Lencana";
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
import { useStore } from "../state/store";

const { rencana: t } = konten.ui;

export function Rencana() {
  const { state } = useStore();
  const { rencana, masukan } = useRencana();
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
    <div className="mt-isi space-y-3">
      {daftar.map((k) => (
        <KartuRingkas key={k.id} kartu={k} />
      ))}
    </div>
  );

  const daftarLengkap = (
    <div className="flex flex-col gap-bagian">
      {h.mulai.length > 0 && (
        <section aria-labelledby="mulai">
          <h2 id="mulai" className="text-subjudul">
            {t.mulaiDariSini}
          </h2>
          {daftarKartu(h.mulai)}
        </section>
      )}

      {lainnya.length > 0 && (
        <section aria-labelledby="lainnya">
          <h2 id="lainnya" className="text-subjudul">
            {t.semuaRekomendasi}
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

  // Pita kepala: ruangan yang dikerjakan dan prioritas pengguna, dengan jalan pintas mengubah jawaban.
  const kepala = (
    <>
      <BarisRuangan />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {masukan.prioritas.map((a) => (
          <Tanda key={a}>{labelAkt(a)}</Tanda>
        ))}
        <Link to="/asesmen/aktivitas" className="inline-flex min-h-sentuh items-center font-semibold text-utama underline">
          {t.ubahJawaban}
        </Link>
      </div>
    </>
  );

  return (
    <Halaman judul={t.judul} kepala={kepala}>
      <div className="flex flex-col gap-bagian">
        {ringan && (
          <p role="note" className="rounded-kartu bg-aksen-muda p-4 motion-safe:animate-muncul">
            {t.ringan.catatan}
          </p>
        )}

        {h.jumlahPanduan > 0 && (
          <section className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu" aria-label={t.beres.judul}>
            <p className="font-semibold">{isi(t.beres.ringkasan, { n: h.beres.length, total: h.jumlahPanduan })}</p>
            <BilahKemajuan
              n={h.beres.length}
              total={h.jumlahPanduan}
              label={isi(t.beres.ringkasan, { n: h.beres.length, total: h.jumlahPanduan })}
            />
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
              <div className="rounded-kartu bg-permukaan p-4">
                {rencana.total.diketahui && (
                  <p className="font-medium">
                    {isi(t.total, { rentang: formatRentang({ min: rencana.total.minRp, max: rencana.total.maksRp }) })}
                  </p>
                )}
                {rencana.kebutuhanJangkaPanjangBelumJelas && (
                  <p className={`text-kecil text-redup ${rencana.total.diketahui ? "mt-2" : ""}`}>{t.belumJelas}</p>
                )}
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
