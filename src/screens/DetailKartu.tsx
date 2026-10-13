import { useState } from "react";
import { useParams } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { LencanaSifat, LencanaStatus, Tanda } from "../components/Lencana";
import { PeringatanNonMedis } from "../components/PeringatanNonMedis";
import { TombolLink } from "../components/Tombol";
import { TAMPILKAN_ANGKA_DRAF, konten } from "../domain/content";
import { susunTingkat } from "../domain/engine";
import { istilahDalam } from "../domain/istilah";
import { TINGKAT, type Kartu, type Tingkat } from "../domain/schema";
import { bolehTampilkanUkuran } from "../domain/ukuran";
import { tingkatUtama } from "../components/KartuRingkas";
import { useRencana } from "../state/useRencana";

const { kartu: t, umum, rencana: tr } = konten.ui;

export function DetailKartu() {
  const { id, tingkat: tingkatParam } = useParams();
  const kartu = konten.kartu.find((k) => k.id === id);
  if (!kartu) {
    return (
      <Halaman judul={t.tidakDitemukan}>
        <TombolLink to="/rencana" className="mt-6">
          {t.kembaliKeRencana}
        </TombolLink>
      </Halaman>
    );
  }
  return <Isi kartu={kartu} tingkatAwal={TINGKAT.find((x) => x === tingkatParam)} />;
}

function Isi({ kartu, tingkatAwal }: { kartu: Kartu; tingkatAwal?: Tingkat }) {
  const { konteks } = useRencana();
  const tingkat = susunTingkat(kartu, konteks);
  const tampil = tingkat.filter((x) => x.tampil);
  const adaDisembunyikan = tingkat.some((x) => x.disembunyikanHunian);

  const awal = tampil.find((x) => x.tingkat === tingkatAwal) ?? tingkatUtama({ id: kartu.id, prioritas: false, isiMenyusul: false, tingkat });
  const [terbuka, setTerbuka] = useState<Set<Tingkat>>(new Set(awal ? [awal.tingkat] : []));
  const ubah = (x: Tingkat) =>
    setTerbuka((s) => {
      const n = new Set(s);
      if (n.has(x)) n.delete(x);
      else n.add(x);
      return n;
    });

  const tampilkanUkuran = bolehTampilkanUkuran(kartu.status_validasi, TAMPILKAN_ANGKA_DRAF);
  const istilah = istilahDalam(JSON.stringify(kartu), konten.ui.istilah);

  return (
    <Halaman judul={kartu.judul}>
      <div className="mt-2 flex flex-wrap gap-2">
        <LencanaStatus status={kartu.status_validasi} />
      </div>
      <PeringatanNonMedis />

      <section className="mt-5" aria-labelledby="situasi">
        <h2 id="situasi" className="text-xl font-bold">
          {t.situasi}
        </h2>
        <p className="mt-2">{kartu.situasi}</p>
      </section>

      {kartu.isi_menyusul || !kartu.solusi ? (
        <p className="mt-5 rounded-kartu border border-draf bg-draf-muda p-3 font-medium text-draf">{umum.isiMenyusul}</p>
      ) : (
        <>
          {kartu.kenapa_penting && (
            <section className="mt-5" aria-labelledby="kenapa">
              <h2 id="kenapa" className="text-xl font-bold">
                {t.kenapa}
              </h2>
              <p className="mt-2">{kartu.kenapa_penting}</p>
            </section>
          )}

          <section className="mt-5" aria-labelledby="solusi">
            <h2 id="solusi" className="text-xl font-bold">
              {t.solusi}
            </h2>
            <div className="mt-3 space-y-3">
              {tampil.map((x) => {
                const s = kartu.solusi?.[x.tingkat];
                if (!s) return null;
                const buka = terbuka.has(x.tingkat);
                const idPanel = `panel-${x.tingkat}`;
                return (
                  <div key={x.tingkat} className="rounded-kartu border border-garis bg-white">
                    <h3>
                      <button
                        type="button"
                        aria-expanded={buka}
                        aria-controls={idPanel}
                        onClick={() => ubah(x.tingkat)}
                        className="flex min-h-sentuh w-full items-center justify-between gap-2 p-3 text-left text-lg font-semibold"
                      >
                        <span>{t.tingkat[x.tingkat]}</span>
                        <span aria-hidden="true">{buka ? "−" : "+"}</span>
                      </button>
                    </h3>
                    <div className="flex flex-wrap gap-2 px-3 pb-3">
                      <LencanaSifat sifat={x.sifat} />
                      {x.ditandaiPermanen && <Tanda>{umum.menunggu}</Tanda>}
                      {x.ditonjolkan && <Tanda>{tr.cocokSewa}</Tanda>}
                      {x.diAtasBudget && <Tanda>{umum.diAtasBudget}</Tanda>}
                    </div>
                    <div id={idPanel} hidden={!buka} className="border-t border-garis p-3">
                      <p>{s.ringkasan}</p>

                      <h4 className="mt-4 font-semibold">{t.langkah}</h4>
                      <ol className="mt-1 list-decimal space-y-1 pl-6">
                        {s.langkah.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ol>

                      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                        <dt className="font-semibold">{t.biaya}</dt>
                        <dd>{s.biaya.kisaran_rp ?? umum.biayaMenyusul}</dd>
                        <dt className="font-semibold">{t.waktu}</dt>
                        <dd>{s.usaha.waktu ?? umum.menyusul}</dd>
                        <dt className="font-semibold">{t.kesulitan}</dt>
                        <dd>{s.usaha.kesulitan ?? umum.menyusul}</dd>
                      </dl>

                      {s.ukuran && s.ukuran.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold">{t.ukuran}</h4>
                          {tampilkanUkuran ? (
                            <ul className="mt-1 list-disc pl-6">
                              {s.ukuran.map((u) => (
                                <li key={u.label}>
                                  {u.label}: {u.nilai} {u.satuan}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-redup">{t.ukuranMenyusul}</p>
                          )}
                        </div>
                      )}

                      {s.barang.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold">{t.barang}</h4>
                          <ul className="mt-2 space-y-3">
                            {s.barang.map((b) => (
                              <li key={b.nama} className="rounded-tombol bg-kertas p-3">
                                <p className="font-medium">{b.nama}</p>
                                <p className="mt-1">
                                  <span className="font-semibold">{t.cek}:</span> {b.cek_kecocokan}
                                </p>
                                <p className="mt-1">
                                  <span className="font-semibold">{t.spesifikasi}:</span> {b.spesifikasi}
                                </p>
                                <p className="mt-1">
                                  <span className="font-semibold">{t.harga}:</span> {b.kisaran_harga ?? umum.menyusul}
                                </p>
                                {b.afiliasi && <p className="mt-1"><Tanda>{t.afiliasi}</Tanda></p>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {adaDisembunyikan && <p className="mt-3 text-redup">{t.tingkatDisembunyikan}</p>}
          </section>

          {kartu.bantuan && kartu.bantuan.length > 0 && (
            <section className="mt-5" aria-labelledby="bantuan">
              <h2 id="bantuan" className="text-xl font-bold">
                {t.bantuan}
              </h2>
              <ul className="mt-2 space-y-3">
                {kartu.bantuan.map((b) => (
                  <li key={b.jenis}>
                    <p className="font-semibold">{t.jenisBantuan[b.jenis].nama}</p>
                    <p className="text-sm text-redup">{t.jenisBantuan[b.jenis].arti}</p>
                    <p>{b.keterangan}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-redup">{t.direktoriMenyusul}</p>
            </section>
          )}

          {kartu.peran && (
            <section className="mt-5" aria-labelledby="peran">
              <h2 id="peran" className="sr-only">
                {t.peranPenyandang} / {t.peranCaregiver}
              </h2>
              <div className="space-y-3">
                <div className="rounded-kartu border border-garis bg-white p-3">
                  <h3 className="font-semibold">{t.peranPenyandang}</h3>
                  <p>{kartu.peran.penyandang_disabilitas}</p>
                </div>
                <div className="rounded-kartu border border-garis bg-white p-3">
                  <h3 className="font-semibold">{t.peranCaregiver}</h3>
                  <p>{kartu.peran.caregiver}</p>
                </div>
              </div>
            </section>
          )}

          {kartu.peringatan && (
            <section className="mt-5 rounded-kartu border-2 border-aksen bg-aksen-muda p-3" aria-labelledby="peringatan">
              <h2 id="peringatan" className="text-lg font-bold text-aksen">
                {t.peringatan}
              </h2>
              <p className="mt-1">{kartu.peringatan}</p>
            </section>
          )}

          {istilah.length > 0 && (
            <section className="mt-5" aria-labelledby="istilah">
              <h2 id="istilah" className="text-xl font-bold">
                {t.istilah}
              </h2>
              <dl className="mt-2 space-y-2">
                {istilah.map((i) => (
                  <div key={i.kata}>
                    <dt className="font-semibold">{i.kata}</dt>
                    <dd>{i.arti}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="mt-5" aria-labelledby="sumber">
            <h2 id="sumber" className="text-xl font-bold">
              {t.sumber}
            </h2>
            {kartu.sumber && kartu.sumber.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-6">
                {kartu.sumber.map((s) => (
                  <li key={s.judul}>
                    {s.url ? (
                      <a href={s.url} className="text-utama underline" rel="noopener noreferrer">
                        {s.judul}
                      </a>
                    ) : (
                      s.judul
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-redup">{t.sumberMenyusul}</p>
            )}
          </section>
        </>
      )}

      <TombolLink to="/rencana" gayaTombol="sekunder" className="mt-8">
        {t.kembaliKeRencana}
      </TombolLink>
    </Halaman>
  );
}
