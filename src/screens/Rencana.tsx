import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { BarisRuangan } from "../components/BarisRuangan";
import { BilahKemajuan } from "../components/BilahKemajuan";
import { Halaman } from "../components/Halaman";
import { Ikon } from "../components/Ikon";
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

  if (Object.keys(state.asesmen.status).length === 0)
    return <Navigate to="/asesmen/aktivitas" replace />;

  // Bila caregiver bilang sedang lelah, tampilkan satu hal saja dan simpan sisanya di lipatan.
  // Yang dihitung hanya jawaban hari ini, supaya "lelah" minggu lalu tidak terus mengurangi rencana.
  const hariIni = state.riwayatCheckin[kunciHari()];
  const ringan =
    hariIni === "capek_fisik" ||
    hariIni === "capek_emosi" ||
    hariIni === "butuh_istirahat";
  const h = terapkanHasil(rencana, state.hasil, konten.kartu);

  const dataKartu = (id: string) => konten.kartu.find((k) => k.id === id);
  const lainnya = h.lainnya.filter((k) => !k.isiMenyusul);
  const disusun = h.lainnya.filter((k) => k.isiMenyusul);
  const pendamping = rencana.pendamping
    ? dataKartu(rencana.pendamping)
    : undefined;
  const satuHal = h.satuHal;
  const labelAkt = (id: string) =>
    konten.asesmen.aktivitas.find((a) => a.id === id)?.label.split(" (")[0] ??
    id;

  const daftarLengkap = (
    <>
      {h.mulai.length > 0 && (
        <section className="mt-5" aria-labelledby="mulai">
          <h2 id="mulai" className="text-xl font-bold">
            {t.mulaiDariSini}
          </h2>
          <div className="mt-3 space-y-3">
            {h.mulai.map((k) => (
              <KartuRingkas key={k.id} kartu={k} />
            ))}
          </div>
        </section>
      )}

      {lainnya.length > 0 && (
        <section className="mt-6" aria-labelledby="lainnya">
          <h2 id="lainnya" className="text-xl font-bold">
            {t.semuaRekomendasi}
          </h2>
          <div className="mt-3 space-y-3">
            {lainnya.map((k) => (
              <KartuRingkas key={k.id} kartu={k} />
            ))}
          </div>
        </section>
      )}

      {h.beres.length > 0 && (
        <Lipat judul={isi(t.beres.lihat, { n: h.beres.length })}>
          <div className="space-y-3">
            {h.beres.map((k) => (
              <KartuRingkas key={k.id} kartu={k} />
            ))}
          </div>
        </Lipat>
      )}

      {disusun.length > 0 && (
        <Lipat
          judul={`${t.sedangDisusun} (${disusun.length})`}
          buka={h.mulai.length === 0 && lainnya.length === 0}
        >
          <div className="space-y-3">
            {disusun.map((k) => (
              <KartuRingkas key={k.id} kartu={k} />
            ))}
          </div>
        </Lipat>
      )}
    </>
  );

  return (
    <Halaman judul={t.judul}>
      <BarisRuangan />
      {h.jumlahPanduan > 0 && (
        <section
          className="mt-3 rounded-kartu bg-aksen-muda p-3"
          aria-label={t.beres.judul}
        >
          <p className="font-semibold">
            {isi(t.beres.ringkasan, {
              n: h.beres.length,
              total: h.jumlahPanduan,
            })}
          </p>
          <BilahKemajuan
            n={h.beres.length}
            total={h.jumlahPanduan}
            label={isi(t.beres.ringkasan, {
              n: h.beres.length,
              total: h.jumlahPanduan,
            })}
          />
        </section>
      )}
      {ringan && (
        <p
          role="note"
          className="mt-2 rounded-kartu bg-aksen-muda p-3 motion-safe:animate-muncul"
        >
          {t.ringan.catatan}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {masukan.prioritas.map((a) => (
          <Tanda key={a}>{labelAkt(a)}</Tanda>
        ))}
        <Link
          to="/asesmen/aktivitas"
          className="inline-flex min-h-sentuh items-center text-utama underline"
        >
          {t.ubahJawaban}
        </Link>
      </div>

      {rencana.kosong ? (
        <section
          className="mt-5 rounded-kartu border border-utama bg-utama-muda p-4"
          aria-labelledby="kosong"
        >
          <h2 id="kosong" className="text-lg font-semibold">
            {t.kosongJudul}
          </h2>
          <p className="mt-2">{t.kosongIsi}</p>
        </section>
      ) : (
        <>
          {satuHal && (
            <section
              className="mt-5 rounded-kartu border-2 border-utama bg-utama-muda p-4"
              aria-labelledby="satu-hal"
            >
              <h2 id="satu-hal" className="text-lg font-bold">
                {t.satuHal}
              </h2>
              <p className="mt-2 text-lg">{satuHal.langkah}</p>
              <p className="mt-2 text-sm text-redup">
                {isi(t.dariKartu, {
                  judul: dataKartu(satuHal.kartuId)?.judul ?? "",
                })}
              </p>
              <TombolLink
                to={`/kartu/${satuHal.kartuId}/${satuHal.tingkat}`}
                className="mt-3"
              >
                {t.lihatKartu}
              </TombolLink>
            </section>
          )}

          {!satuHal && h.mulai.length === 0 && (
            <p
              role="note"
              className="mt-5 rounded-kartu border border-draf bg-draf-muda p-3 text-draf"
            >
              {t.belumAdaSiap}
            </p>
          )}

          {rencana.total.diketahui && (
            <p className="mt-4 font-medium">
              {isi(t.total, {
                rentang: formatRentang({
                  min: rencana.total.minRp,
                  max: rencana.total.maksRp,
                }),
              })}
            </p>
          )}
          {rencana.kebutuhanJangkaPanjangBelumJelas && (
            <p className="mt-3 text-sm text-redup">{t.belumJelas}</p>
          )}

          {ringan ? (
            <Lipat judul={t.ringan.lihatNanti}>
              <div className="-mt-3">{daftarLengkap}</div>
            </Lipat>
          ) : (
            daftarLengkap
          )}
        </>
      )}

      <div className="mt-6">
        <TombolLink to="/cetak" gayaTombol="sekunder" className="w-full">
          {t.cetak}
        </TombolLink>
      </div>

      {pendamping && (
        <section className="mt-8" aria-labelledby="pendamping">
          <h2 id="pendamping" className="text-xl font-bold">
            {t.pendampingJudul}
          </h2>
          <article className="mt-3 rounded-kartu border border-garis bg-white p-4">
            <div className="flex items-start gap-3">
              <Ikon kunci="caregiver" className="mt-0.5 h-9 w-9" />
              <h3 className="text-lg font-semibold leading-snug">
                {pendamping.judul}
              </h3>
            </div>
            <div className="mt-2 empty:hidden">
              <LencanaStatus status={pendamping.status_validasi} />
            </div>
            <p className="mt-2 text-redup">{pendamping.situasi}</p>
            <TombolLink to={`/kartu/${pendamping.id}`} className="mt-3 w-full">
              {t.bukaKartu}
              <span className="sr-only">: {pendamping.judul}</span>
            </TombolLink>
          </article>
        </section>
      )}
      <PeringatanNonMedis />
    </Halaman>
  );
}
