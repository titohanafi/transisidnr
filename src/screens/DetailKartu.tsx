import { ChevronDown, Clock, Hammer, Hand, HeartHandshake, TriangleAlert, User, Wallet, Wrench, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { Ikon } from "../components/Ikon";
import { Lipat } from "../components/Lipat";
import { LencanaSifat, LencanaStatus, Tanda } from "../components/Lencana";
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
import { track } from "../lib/events";
import { useStore } from "../state/store";
import { useRencana } from "../state/useRencana";

const { kartu: t, umum, rencana: tr } = konten.ui;

// Setiap tingkat solusi punya ikon sendiri; latar kartunya satu warna netral tipis yang sama (tanpa bayangan). Nama tingkat tetap tertulis.
const IKON_TINGKAT: Record<Tingkat, LucideIcon> = {
  tanpa_biaya: Hand,
  alat_tanpa_bongkar: Wrench,
  renovasi: Hammer,
};

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
  const { state } = useStore();
  const adaJawaban = Object.keys(state.asesmen.status).length > 0;
  useEffect(() => {
    track("kartu_dibuka", { kartu_id: kartu.id });
  }, [kartu.id]);
  const tingkat = susunTingkat(kartu, konteks);
  const tampil = tingkat.filter((x) => x.tampil);
  const adaDisembunyikan = tingkat.some((x) => x.disembunyikanHunian);

  const awal =
    tampil.find((x) => x.tingkat === tingkatAwal) ?? tingkatUtama({ id: kartu.id, prioritas: false, isiMenyusul: false, tingkat });
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

  const atasJudul = (
    <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-kartu bg-white shadow-kartu">
      <Ikon kunci={kunciKelompok(kartu)} className="h-9 w-9" />
    </span>
  );

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
      <section className="mt-4 rounded-kartu border border-catatan-garis bg-catatan-muda p-4 text-catatan" aria-labelledby="situasi">
        <h2 id="situasi" className="text-kecil font-semibold uppercase tracking-wide">
          {t.situasi}
        </h2>
        <p className="mt-1 text-isi">{uraian}</p>
      </section>
    </>
  );

  return (
    <Halaman judul={kartu.judul} kepala={kepala} atasJudul={atasJudul} kepalaPita latarPutih>
      <div className="flex flex-col gap-bagian">
        {kartu.isi_menyusul || !kartu.solusi ? (
          <p className="rounded-kartu border border-draf bg-draf-muda p-4 font-medium text-draf">{umum.isiMenyusul}</p>
        ) : (
          <>
            <section aria-labelledby="solusi">
              <h2 id="solusi" className="text-subjudul">
                {t.solusi}
              </h2>
              <div className="mt-isi space-y-5">
                {tampil.map((x) => {
                  const s = kartu.solusi?.[x.tingkat];
                  if (!s) return null;
                  const buka = terbuka.has(x.tingkat);
                  const idPanel = `panel-${x.tingkat}`;
                  const IkonTingkat = IKON_TINGKAT[x.tingkat];
                  return (
                    <div key={x.tingkat} className="rounded-kartu bg-permukaan">
                      <h3>
                        <button
                          type="button"
                          aria-expanded={buka}
                          aria-controls={idPanel}
                          onClick={() => ubah(x.tingkat)}
                          className="flex min-h-sentuh w-full items-center gap-3 rounded-kartu px-4 pb-4 pt-4 text-left text-judulKartu"
                        >
                          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                            <IkonTingkat className="h-5 w-5 text-utama-gelap" strokeWidth={2} focusable="false" />
                          </span>
                          <span className="flex-1">{t.tingkat[x.tingkat]}</span>
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 text-utama-gelap motion-safe:transition-transform ${buka ? "rotate-180" : ""}`}
                            strokeWidth={2}
                            aria-hidden="true"
                            focusable="false"
                          />
                        </button>
                      </h3>
                      <p className="-mt-2 px-4 pb-4 text-redup">{s.ringkasan}</p>
                      <div className={`flex flex-wrap gap-2 px-4 empty:hidden ${buka ? "pb-3" : "pb-4"}`}>
                        {x.ditonjolkan && <Tanda>{tr.cocokSewa}</Tanda>}
                        {x.diAtasBudget && <Tanda>{umum.diAtasBudget}</Tanda>}
                      </div>
                      <div id={idPanel} hidden={!buka} className="mx-3 mb-3 rounded-tombol bg-white p-4">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <LencanaSifat sifat={x.sifat} />
                          {x.ditandaiPermanen && <Tanda>{umum.menunggu}</Tanda>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-permukaan px-3 py-1 text-kecil font-medium">
                            <Wallet className="h-4 w-4 shrink-0 text-redup" strokeWidth={2} aria-hidden="true" focusable="false" />
                            {s.biaya.kisaran_rp ?? umum.biayaMenyusul}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-permukaan px-3 py-1 text-kecil font-medium">
                            <Clock className="h-4 w-4 shrink-0 text-redup" strokeWidth={2} aria-hidden="true" focusable="false" />
                            {s.usaha.waktu ?? umum.menyusul}
                          </span>
                        </div>
                        <h4 className="mt-4 font-semibold">{t.langkah}</h4>
                        <ol className="mt-2 space-y-2">
                          {s.langkah.map((l, i) => (
                            <li key={l} className="flex gap-3">
                              <span
                                aria-hidden="true"
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-utama-muda text-sm font-bold text-utama-gelap"
                              >
                                {i + 1}
                              </span>
                              <span>{l}</span>
                            </li>
                          ))}
                        </ol>

                        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-redup">
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
                                <li key={b.nama} className="rounded-tombol bg-permukaan p-3">
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
                                  {b.afiliasi && (
                                    <p className="mt-1">
                                      <Tanda>{t.afiliasi}</Tanda>
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="mt-6 flex flex-col gap-2">
                          {/* Tukang tidak diulang di sini: tombolnya ada di "Kenali peran ahli", pada baris Tukang. */}
                          {aksiTersedia(kartu, x.tingkat)
                            .filter((j) => j !== "tukang")
                            .map((j) => (
                              <TombolAksi
                                key={j}
                                jenis={j}
                                kartuId={kartu.id}
                                tingkat={x.tingkat}
                                gayaTombol={j === "sendiri" ? "utama" : "sekunder"}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {adaDisembunyikan && <p className="mt-3 text-redup">{t.tingkatDisembunyikan}</p>}
            </section>

            {kartu.bantuan && kartu.bantuan.length > 0 && (
              <div>
                <TombolAksi jenis="ahli" kartuId={kartu.id} gayaTombol="sekunder" className="w-full" />
              </div>
            )}

            {kartu.peran && (
              <section aria-labelledby="peran">
                <h2 id="peran" className="sr-only">
                  {t.peranPenyandang} / {t.peranCaregiver}
                </h2>
                <div className="space-y-3">
                  <div className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
                        <User className="h-6 w-6 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
                      </span>
                      <h3 className="text-judulKartu">{t.peranPenyandang}</h3>
                    </div>
                    <p>{kartu.peran.penyandang_disabilitas}</p>
                  </div>
                  <div className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
                        <HeartHandshake className="h-6 w-6 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
                      </span>
                      <h3 className="text-judulKartu">{t.peranCaregiver}</h3>
                    </div>
                    <p>{kartu.peran.caregiver}</p>
                  </div>
                </div>
              </section>
            )}

            {kartu.peringatan && (
              <section className="rounded-kartu border border-aksen/30 bg-aksen-muda p-5" aria-labelledby="peringatan">
                <div className="flex items-center gap-3 text-aksen">
                  <TriangleAlert className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
                  <h2 id="peringatan" className="text-subjudul">
                    {t.peringatan}
                  </h2>
                </div>
                <p className="mt-2">{kartu.peringatan}</p>
              </section>
            )}

            {istilah.length > 0 && (
              <Lipat className="" judul={t.istilah}>
                <dl className="space-y-2">
                  {istilah.map((i) => (
                    <div key={i.kata}>
                      <dt className="font-semibold">{i.kata}</dt>
                      <dd>{i.arti}</dd>
                    </div>
                  ))}
                </dl>
              </Lipat>
            )}

            <Lipat className="" judul={t.sumber}>
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
            </Lipat>
          </>
        )}

        <PeringatanNonMedis className="" />

        <TombolLink to={adaJawaban ? "/rencana" : "/jelajah"} gayaTombol="sekunder">
          {adaJawaban ? t.kembaliKeRencana : t.kembaliKeJelajah}
        </TombolLink>
      </div>
    </Halaman>
  );
}
