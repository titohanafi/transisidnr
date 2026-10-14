import { Clock, TriangleAlert, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { Ilustrasi } from "../components/Ilustrasi";
import { HasilLangkah, LangkahChecklist } from "../components/LangkahChecklist";
import { LipatBaris } from "../components/Lipat";
import { LencanaStatus, Tanda } from "../components/Lencana";
import { PeringatanNonMedis } from "../components/PeringatanNonMedis";
import { TombolLink } from "../components/Tombol";
import { TAMPILKAN_ANGKA_DRAF, konten } from "../domain/content";
import { susunTingkat } from "../domain/engine";
import { istilahDalam } from "../domain/istilah";
import { kunciKelompok } from "../domain/jelajah";
import { TINGKAT, type Tingkat } from "../domain/konstanta";
import type { Kartu } from "../domain/schema";
import { bolehTampilkanUkuran } from "../domain/ukuran";
import { tingkatUtama } from "../components/KartuRingkas";
import { TombolAksi } from "../components/TombolAksi";
import { aksiTersedia } from "../domain/aksi";
import { ringkasRp } from "../lib/format";
import { track } from "../lib/events";
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
  useEffect(() => {
    track("kartu_dibuka", { kartu_id: kartu.id });
  }, [kartu.id]);
  const tingkat = susunTingkat(kartu, konteks);
  const tampil = tingkat.filter((x) => x.tampil);
  const adaDisembunyikan = tingkat.some((x) => x.disembunyikanHunian);

  const awal =
    tampil.find((x) => x.tingkat === tingkatAwal) ?? tingkatUtama({ id: kartu.id, prioritas: false, isiMenyusul: false, tingkat });
  // Pilihan solusi tampil sebagai tab: satu tingkat dipilih, isinya tampil di bawah deretan tab.
  const [aktifTingkat, setAktifTingkat] = useState<Tingkat | undefined>(awal?.tingkat);
  const pilihTab = (arah: number, dari: number) => {
    const berikut = tampil[(dari + arah + tampil.length) % tampil.length];
    setAktifTingkat(berikut.tingkat);
    document.getElementById(`tab-${berikut.tingkat}`)?.focus();
  };

  const aktif = tampil.find((x) => x.tingkat === aktifTingkat) ?? tampil[0];
  const biayaPil = (b: { kisaran_rp: string | null; estimasi_rp?: string | null }) =>
    b.kisaran_rp ? ringkasRp(b.kisaran_rp) : b.estimasi_rp ? `~${ringkasRp(b.estimasi_rp)}` : umum.biayaMenyusul;

  const tampilkanUkuran = bolehTampilkanUkuran(kartu.status_validasi, TAMPILKAN_ANGKA_DRAF);
  const istilah = istilahDalam(JSON.stringify(kartu), konten.ui.istilah);

  const kunciGrup = kunciKelompok(kartu);
  const namaGrup =
    kunciGrup === "caregiver"
      ? konten.ui.jelajah.caregiver
      : (konten.asesmen.aktivitas.find((a) => a.id === kunciGrup)?.label.split(" (")[0] ?? "");
  const atasJudul = namaGrup ? <p className="mb-1 text-kecil font-semibold text-utama-gelap">{namaGrup}</p> : null;

  // Situasi digabung dengan "kenapa penting" bila isinya berbeda, supaya tidak ada dua bagian yang saling mengulang.
  const norm = (x: string) =>
    x
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const kenapa = kartu.kenapa_penting;
  const sudahAda = !kenapa || norm(kartu.situasi).includes(norm(kenapa)) || norm(kenapa).includes(norm(kartu.situasi));
  const uraian = sudahAda
    ? kenapa && norm(kenapa).length > norm(kartu.situasi).length
      ? kenapa
      : kartu.situasi
    : `${kartu.situasi} ${kenapa}`;

  const kepala = (
    <>
      <div className="mt-2 empty:hidden">
        <LencanaStatus status={kartu.status_validasi} />
      </div>
      <section className="mt-4 rounded-kartu bg-utama-muda p-4" aria-labelledby="situasi">
        <h2 id="situasi" className="text-kecil font-semibold text-utama-gelap">
          {t.situasi}
        </h2>
        <p className="mt-1 text-isi">{uraian}</p>
      </section>
    </>
  );

  return (
    <Halaman judul={kartu.judul} kepala={kepala} atasJudul={atasJudul} hiasan={<Ilustrasi kunci={kunciGrup} />} kepalaPita latarPutih>
      <div className="flex flex-col gap-bagian">
        {kartu.peringatan && (
          <section
            className="flex items-start gap-3 rounded-kartu border border-catatan-garis bg-catatan-muda p-4 text-catatan"
            aria-labelledby="peringatan"
          >
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
            <div>
              <h2 id="peringatan" className="text-kecil font-semibold">
                {t.peringatan}
              </h2>
              <p className="mt-0.5 text-kecil">{kartu.peringatan}</p>
            </div>
          </section>
        )}

        {kartu.isi_menyusul || !kartu.solusi ? (
          <p className="rounded-kartu border border-draf bg-draf-muda p-4 font-medium text-draf">{umum.isiMenyusul}</p>
        ) : (
          <>
            <section aria-labelledby="solusi">
              <h2 id="solusi" className="text-subjudul">
                {t.solusi}
              </h2>
              <div
                role="tablist"
                aria-labelledby="solusi"
                className="mt-isi grid gap-1 rounded-kartu bg-permukaan p-1"
                style={{ gridTemplateColumns: `repeat(${tampil.length}, minmax(0, 1fr))` }}
              >
                {tampil.map((x, i) => {
                  const s = kartu.solusi?.[x.tingkat];
                  if (!s) return null;
                  const dipilih = aktif?.tingkat === x.tingkat;
                  return (
                    <button
                      key={x.tingkat}
                      id={`tab-${x.tingkat}`}
                      type="button"
                      role="tab"
                      aria-selected={dipilih}
                      aria-controls="panel-solusi"
                      tabIndex={dipilih ? 0 : -1}
                      onClick={() => setAktifTingkat(x.tingkat)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowRight") {
                          e.preventDefault();
                          pilihTab(1, i);
                        } else if (e.key === "ArrowLeft") {
                          e.preventDefault();
                          pilihTab(-1, i);
                        }
                      }}
                      className={`tekan flex min-h-[52px] items-center justify-center rounded-tombol px-2 py-2 text-center motion-safe:transition-colors ${
                        dipilih ? "bg-white text-utama-gelap shadow-kartu" : "text-redup hover:text-tinta"
                      }`}
                    >
                      <span className="text-kecil font-semibold leading-snug">{t.tingkat[x.tingkat]}</span>
                    </button>
                  );
                })}
              </div>
              {aktif && kartu.solusi?.[aktif.tingkat] && (
                <div
                  id="panel-solusi"
                  role="tabpanel"
                  aria-labelledby={`tab-${aktif.tingkat}`}
                  className="mt-3 rounded-kartu border border-garis bg-white p-4"
                >
                  {(() => {
                    const s = kartu.solusi![aktif.tingkat]!;
                    const x = aktif;
                    return (
                      <>
                        <p className="text-judulKartu text-tinta">{s.ringkasan}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-permukaan px-3 py-1 text-kecil font-medium">
                            <Wallet className="h-4 w-4 shrink-0 text-redup" strokeWidth={2} aria-hidden="true" focusable="false" />
                            {biayaPil(s.biaya)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-permukaan px-3 py-1 text-kecil font-medium">
                            <Clock className="h-4 w-4 shrink-0 text-redup" strokeWidth={2} aria-hidden="true" focusable="false" />
                            {s.usaha.waktu ?? umum.menyusul}
                          </span>
                          {x.ditonjolkan && <Tanda>{tr.cocokSewa}</Tanda>}
                          {x.diAtasBudget && <Tanda>{umum.diAtasBudget}</Tanda>}
                        </div>
                        {/* Ajakan bertindak ada di atas langkah; pertanyaan hasil di paling bawah. */}
                        {(aksiTersedia(kartu, x.tingkat).includes("beli") ||
                          (x.tingkat === "renovasi" && aksiTersedia(kartu, x.tingkat).includes("tukang"))) && (
                          <div className="mt-5 flex flex-col gap-5">
                            {aksiTersedia(kartu, x.tingkat).includes("beli") && (
                              <TombolAksi
                                jenis="beli"
                                kartuId={kartu.id}
                                tingkat={x.tingkat}
                                gayaTombol={x.tingkat === "renovasi" ? "sekunder" : "utama"}
                                className="w-full"
                              />
                            )}
                            {x.tingkat === "renovasi" && aksiTersedia(kartu, x.tingkat).includes("tukang") && (
                              <TombolAksi jenis="tukang" kartuId={kartu.id} tingkat={x.tingkat} gayaTombol="utama" className="w-full" />
                            )}
                          </div>
                        )}

                        <hr className="-mx-4 mt-5 border-t border-garis/70" />
                        <h4 className="mt-5 font-semibold">{t.langkah}</h4>
                        <div className="mt-2">
                          <LangkahChecklist kartu={kartu} tingkat={x.tingkat} langkah={s.langkah} peran={s.peran_langkah} />
                        </div>

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

                        <div className="mt-6 empty:hidden">
                          <HasilLangkah kartu={kartu} tingkat={x.tingkat} langkah={s.langkah} keTingkat={setAktifTingkat} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              {adaDisembunyikan && <p className="mt-3 text-redup">{t.tingkatDisembunyikan}</p>}
            </section>

            <div className="divide-y divide-garis/70 overflow-hidden rounded-kartu border border-garis bg-white">
              {istilah.length > 0 && (
                <LipatBaris judul={t.istilah}>
                  <dl className="space-y-2">
                    {istilah.map((i) => (
                      <div key={i.kata}>
                        <dt className="font-semibold">{i.kata}</dt>
                        <dd>{i.arti}</dd>
                      </div>
                    ))}
                  </dl>
                </LipatBaris>
              )}
              <LipatBaris judul={t.sumber}>
                {kartu.sumber && kartu.sumber.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-6">
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
                  <p className="text-redup">{t.sumberMenyusul}</p>
                )}
              </LipatBaris>
            </div>
          </>
        )}

        <PeringatanNonMedis className="" polos />
      </div>
    </Halaman>
  );
}
