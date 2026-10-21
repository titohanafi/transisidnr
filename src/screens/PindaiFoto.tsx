import { Camera, CircleCheck, Image as IkonGaleri, Info, Loader2, ScanLine } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DenahKamarMandi } from "../components/DenahKamarMandi";
import { Halaman } from "../components/Halaman";
import { HiasanLingkaran } from "../components/KartuHero";
import { PilihanPil } from "../components/Pilihan";
import { PeringatanNonMedis } from "../components/PeringatanNonMedis";
import { Tombol, TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";
import { hitungSkor, nomorItemHasil, POSISI_BAWAAN, type ObjekDenah, type PosisiObjek, type StatusItem } from "../domain/pindai";
import { kecilkanFoto } from "../lib/foto";
import { GalatPindai, pindaiFoto } from "../lib/pindai";
import { isi } from "../lib/teks";

const t = konten.ui.pindai;
const ID_ITEM = t.item.map((i) => i.id);

type Tahap =
  | { nama: "pilih" }
  | { nama: "siap" }
  | { nama: "memindai" }
  | { nama: "galat"; pesan: string }
  | { nama: "ceklis"; jawaban: Record<string, StatusItem> }
  | {
      nama: "hasil";
      /** Dipakai untuk menentukan penjelasan di "Rincian per indikator": kalimat "dinilai AI" hanya masuk akal
       *  kalau datang dari foto - dari ceklis manual, user sendiri yang mengisi semuanya dari awal. */
      sumber: "pindai" | "ceklis";
      temuan: Record<string, StatusItem>;
      objek: Record<ObjekDenah, PosisiObjek>;
    };

const GAYA_STATUS: Record<StatusItem, string> = {
  ramah: "border-utama bg-utama-muda text-utama-gelap",
  perhatian: "border-aksen bg-aksen-muda text-aksen",
  tidak_jelas: "border-garis bg-white text-redup",
};

// Dipakai di dua tempat dengan pertanyaan yang sama persis (`it.cek`): ceklis manual (tanpa foto) dan "Rincian per
// hal" di hasil Pindai (mengoreksi jawaban Gemini) - supaya keduanya terasa sebagai satu alur yang sama, bukan dua
// cara menjawab yang berbeda.
const PILIHAN_STATUS: readonly [StatusItem, string][] = [
  ["ramah", t.ya],
  ["perhatian", t.tidak],
  ["tidak_jelas", t.tidakYakin],
];

// Foto hanya ada di memori layar ini (tidak disimpan); hasil dihitung aplikasi dari temuan per hal.
export function PindaiFoto() {
  const kamera = useRef<HTMLInputElement>(null);
  const galeri = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [tahap, setTahap] = useState<Tahap>({ nama: "pilih" });
  const [galatBaca, setGalatBaca] = useState<string | null>(null);

  const pilih = async (berkas: File | undefined) => {
    if (!berkas) return;
    setGalatBaca(null);
    try {
      // Mode dev: abaikan berkas yang sungguhan dipilih, selalu pakai satu foto contoh supaya hasil (termasuk
      // perkiraan posisi denah) bisa dibandingkan dari foto yang sama setiap kali dicoba.
      const sumber =
        import.meta.env.VITE_PINDAI_MOCK === "true" ? await (await fetch("/__mock/foto-pindai.jpg")).blob() : berkas;
      setFoto(await kecilkanFoto(sumber));
      setTahap({ nama: "siap" });
    } catch {
      setGalatBaca(t.gagalBaca);
    }
  };

  const pindai = async () => {
    if (!foto) return;
    setTahap({ nama: "memindai" });
    try {
      const hasil = await pindaiFoto(foto, ID_ITEM);
      if (!hasil.kamarMandi) setTahap({ nama: "galat", pesan: t.bukanKamarMandi });
      else setTahap({ nama: "hasil", sumber: "pindai", temuan: hasil.temuan, objek: hasil.objek });
    } catch (e) {
      const kode = e instanceof GalatPindai ? e.kode : null;
      setTahap({
        nama: "galat",
        pesan: kode === "belum_diatur" ? t.belumDiatur : kode === "terlalu_sering" ? t.terlaluSering : t.gagalPindai,
      });
    }
  };

  const ulang = () => {
    setFoto(null);
    setTahap({ nama: "pilih" });
  };

  const masukan = (ref: React.RefObject<HTMLInputElement>, capture?: "environment") => (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      capture={capture}
      hidden
      onChange={(e) => {
        void pilih(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  const pemilih = (
    <div className="flex flex-col gap-3">
      <Tombol onClick={() => kamera.current?.click()} className="gap-2">
        <Camera className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
        {t.ambil}
      </Tombol>
      <Tombol gayaTombol="sekunder" onClick={() => galeri.current?.click()} className="gap-2">
        <IkonGaleri className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
        {t.galeri}
      </Tombol>
    </div>
  );

  return (
    <Halaman judul={t.judul} judulTersembunyi latarPutih>
      {masukan(kamera, "environment")}
      {masukan(galeri)}

      {/* Backdrop hijau pucat (warna sama seperti segmen pencarian di Beranda, "bg-permukaan"), dibangun manual di
          sini — bukan lewat <Halaman kepalaPita> — supaya bilah atas tidak pernah ikut berubah warna. Dibuat edge-
          to-edge lewat -mx-4 -mt-6 (menegasikan padding bawaan <main>), yang hanya rapi kalau h1 di atasnya tidak
          tampil (judulTersembunyi) — sama seperti alasan Beranda menyembunyikan h1-nya sendiri.
          Jarak antar-bagian lain di bawah ini dipusatkan lewat `gap-bagian` (bukan mb-4/mt-6 per elemen). */}
      <div className="flex flex-col gap-bagian">
        {/* Judul hero ("Kamar mandi Anda") selalu tampil, di semua tahap — supaya tidak hilang-muncul begitu foto
            dipilih. Penjelasan cuma tampil di tahap "pilih" (sebelum ada foto); begitu ada foto, kartunya dibungkus
            penuh di dalam backdrop yang sama (bukan cuma menumpang di atasnya) supaya latar hijau menutup seluruh
            tinggi kartu, bukan cuma mengintip di separuh atas seperti kartu tip. */}
        <div
          className={`-mx-4 -mt-6 bg-permukaan px-4 pt-6 ${tahap.nama === "pilih" ? "pb-28" : tahap.nama === "hasil" ? "pb-14" : "pb-6"}`}
        >
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
            <h2 className="text-subjudul text-tinta">{t.heroJudul}</h2>
          </div>
          {tahap.nama === "pilih" && <p className="mt-isi text-redup">{t.penjelasan}</p>}
          {foto && (
            <div className="relative mt-isi overflow-hidden rounded-kartu border border-garis/70 bg-kertas shadow-kartu">
              <img src={foto} alt={t.alt} className="max-h-64 w-full object-contain" />
              {tahap.nama === "memindai" && (
                <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-kartu">
                  {/* Vinyet gelap lembut agar sinar pindai terlihat kontras di atas foto apa pun */}
                  <div className="absolute inset-0 bg-tinta/20" />
                  {/* Kisi titik halus dan statis, kesan "dibaca sistem" tanpa berkedip-kedip */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.55)_1px,transparent_1.5px)] bg-[length:18px_18px] opacity-25" />

                  <div className="absolute inset-x-0 h-2/5 animate-pindai bg-gradient-to-b from-transparent via-utama/50 to-transparent blur-[3px] motion-reduce:hidden" />
                  <div className="absolute inset-x-0 top-[-10%] h-px animate-pindai bg-utama-redup shadow-[0_0_14px_3px_rgba(15,94,99,0.85)] motion-reduce:hidden" />

                  {/* Bingkai sudut ala bidik kamera, statis supaya tidak ramai */}
                  {[
                    "left-2 top-2 border-l-2 border-t-2 rounded-tl-sm",
                    "right-2 top-2 border-r-2 border-t-2 rounded-tr-sm",
                    "left-2 bottom-2 border-l-2 border-b-2 rounded-bl-sm",
                    "right-2 bottom-2 border-r-2 border-b-2 rounded-br-sm",
                  ].map((gaya) => (
                    <span key={gaya} className={`absolute h-6 w-6 border-utama-redup ${gaya}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {tahap.nama === "pilih" && (
          <>
            <section className="-mt-28 rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
              {/* Gaya label (kecil, bukan h2 sejajar judul hero) supaya tidak bersaing dengan judul "Kamar mandi
                  Anda" di atasnya — sama seperti pola label "Hasil pemindaian" / "Situasi" di tempat lain. */}
              <h2 className="mb-2 text-kecil font-semibold text-utama-gelap">{t.tipJudul}</h2>
              <ul className="space-y-2">
                {t.tip.map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </section>
            {pemilih}
            {galatBaca && (
              <p role="alert" className="text-bahaya">
                {galatBaca}
              </p>
            )}
          </>
        )}

        {tahap.nama === "siap" && (
          <>
            <p className="text-kecil text-redup">{t.privasi}</p>
            <div className="flex flex-col gap-3">
              <Tombol onClick={() => void pindai()} className="gap-2">
                <ScanLine className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
                {t.pindai}
              </Tombol>
              <Tombol gayaTombol="sekunder" onClick={() => galeri.current?.click()}>
                {t.gantiFoto}
              </Tombol>
            </div>
          </>
        )}

        {tahap.nama === "memindai" && (
          <p role="status" className="flex items-center gap-3 rounded-kartu bg-utama-muda p-4 text-utama-gelap">
            <Loader2 className="h-6 w-6 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" focusable="false" />
            {t.memindai}
          </p>
        )}

        {tahap.nama === "galat" && (
          <>
            <p role="alert" className="rounded-kartu border border-bahaya bg-bahaya-muda p-4 text-tinta">
              {tahap.pesan}
            </p>
            <div className="flex flex-col gap-3">
              {(tahap.pesan === t.gagalPindai || tahap.pesan === t.terlaluSering) && <Tombol onClick={() => void pindai()}>{t.coba}</Tombol>}
              <Tombol gayaTombol="sekunder" onClick={() => setTahap({ nama: "ceklis", jawaban: {} })}>
                {t.nilaiSendiri}
              </Tombol>
              <Tombol gayaTombol="sekunder" onClick={ulang}>
                {t.gantiFoto}
              </Tombol>
            </div>
          </>
        )}

        {tahap.nama === "ceklis" && (
          <section aria-labelledby="judul-ceklis">
            <h2 id="judul-ceklis" className="mb-1 text-judulKartu">
              {t.ceklisJudul}
            </h2>
            <p className="mb-4 text-redup">{t.ceklisPenjelasan}</p>
            <div className="flex flex-col gap-4">
              {t.item.map((it) => (
                <fieldset key={it.id} className="rounded-kartu border border-garis/70 bg-white p-4 shadow-kartu">
                  <legend className="px-1 font-semibold">{it.nama}</legend>
                  <p className="mb-3">{it.cek}</p>
                  <div className="flex flex-wrap gap-2">
                    {PILIHAN_STATUS.map(([nilai, label]) => (
                      <PilihanPil
                        key={nilai}
                        nama={`cek-${it.id}`}
                        label={label}
                        aktif={tahap.jawaban[it.id] === nilai}
                        onUbah={() => setTahap({ nama: "ceklis", jawaban: { ...tahap.jawaban, [it.id]: nilai } })}
                      />
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <Tombol
              className="mt-4 w-full"
              onClick={() => setTahap({ nama: "hasil", sumber: "ceklis", temuan: tahap.jawaban, objek: POSISI_BAWAAN })}
            >
              {t.lihatHasil}
            </Tombol>
          </section>
        )}

        {tahap.nama === "hasil" && <Hasil sumber={tahap.sumber} temuan={tahap.temuan} objek={tahap.objek} onUlang={ulang} />}
      </div>
    </Halaman>
  );
}

function Hasil({
  sumber,
  temuan: temuanAwal,
  objek,
  onUlang,
}: {
  sumber: "pindai" | "ceklis";
  temuan: Record<string, StatusItem>;
  objek: Record<ObjekDenah, PosisiObjek>;
  onUlang: () => void;
}) {
  // Jawaban Gemini (atau ceklis manual) cuma titik awal: tiap hal di "Rincian per hal" bisa dikoreksi user sendiri
  // (lihat pil Ya/Tidak/Tidak yakin di bawah), karena penyandang disabilitas/caregiver yang paling tahu kondisi
  // ruangnya sendiri, bukan tebakan dari foto. Perubahan ikut mengubah denah, ringkasan, dan tab - satu sumber data.
  const [temuan, setTemuan] = useState(temuanAwal);
  const skor = hitungSkor(temuan, ID_ITEM);
  const tingkat = t.tingkat[skor.tingkat];
  const NOMOR_ITEM = nomorItemHasil(ID_ITEM, temuan);
  // Status tab dikendalikan dari sini (bukan di dalam DenahKamarMandi) supaya "Rincian per hal" di bawah ikut
  // berganti isi mengikuti tab yang sama persis dengan yang mengatur sorotan di denah - satu tab, dua tampilan.
  const [filter, setFilter] = useState<StatusItem>("perhatian");
  const butirFilter = t.item.filter((it) => (temuan[it.id] ?? "tidak_jelas") === filter);
  return (
    <>
      <section aria-labelledby="judul-hasil" className="relative -mt-16 overflow-hidden rounded-kartu bg-utama p-5 text-white shadow-angkat">
        <HiasanLingkaran />
        <div className="relative">
          <p className="text-kecil font-semibold text-white">{t.hasilJudul}</p>
          <div className="mt-1 flex items-center gap-3">
            <CircleCheck className="h-8 w-8 shrink-0 text-daun" strokeWidth={2} aria-hidden="true" focusable="false" />
            <h2 id="judul-hasil" tabIndex={-1} className="text-judulUtama">
              {tingkat.judul}
            </h2>
          </div>
          <p className="mt-2.5 text-isi text-utama-redup">{tingkat.isi}</p>
          {/* Statistik (berapa hal yang mendukung/belum jelas) digabung satu kalimat, ditaruh sebagai banner di
              dalam kartu hasil (bukan terpisah) — warna disesuaikan untuk latar teal (bukan warna "info" biru
              yang dipakai di atas latar putih), tetap satu baris ringkas supaya kartu tidak padat. */}
          {(skor.jelas > 0 || skor.tidakJelas > 0) && (
            <p role="note" className="mt-4 flex items-start gap-2 rounded-tombol border border-white/25 bg-white/10 p-3 text-kecil">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-daun" strokeWidth={2} aria-hidden="true" focusable="false" />
              {skor.jelas > 0 && skor.tidakJelas > 0
                ? isi(t.ringkasanGabungan, { ramah: skor.ramah, jelas: skor.jelas, tidakJelas: skor.tidakJelas })
                : skor.jelas > 0
                  ? isi(t.ringkasan, { ramah: skor.ramah, jelas: skor.jelas })
                  : isi(t.tidakJelasJumlah, { n: skor.tidakJelas })}
            </p>
          )}
        </div>
      </section>

      {/* "Rincian per hal" dirender sebagai children DenahKamarMandi, di dalam kartu yang sama dengan denah+toggle
          (bukan section terpisah di bawahnya) - supaya isi tab status yang aktif terlihat sebagai satu kesatuan. */}
      <DenahKamarMandi temuan={temuan} objek={objek} filter={filter} onUbahFilter={setFilter}>
        <section aria-labelledby="judul-temuan">
          <div className="mb-isi">
            <h2 id="judul-temuan" className="text-judulKartu">
              {t.temuanJudul}
            </h2>
            {sumber === "pindai" && <p className="mt-1 text-kecil text-redup">{t.temuanPenjelasan}</p>}
          </div>
          {butirFilter.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {butirFilter.map((it) => (
                <li key={it.id} className="rounded-tombol border border-garis/70 p-3">
                  <p className="flex items-center gap-2 font-semibold">
                    {NOMOR_ITEM[it.id] !== undefined && (
                      <span
                        aria-hidden="true"
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-mikro font-bold ${GAYA_STATUS[filter]}`}
                      >
                        {NOMOR_ITEM[it.id]}
                      </span>
                    )}
                    {it.nama}
                  </p>
                  <p className="mt-1 text-kecil text-redup">{it.cek}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PILIHAN_STATUS.map(([nilai, label]) => (
                      <PilihanPil
                        key={nilai}
                        nama={`temuan-${it.id}`}
                        label={label}
                        aktif={(temuan[it.id] ?? "tidak_jelas") === nilai}
                        onUbah={() => setTemuan((prev) => ({ ...prev, [it.id]: nilai }))}
                      />
                    ))}
                  </div>
                  {filter === "perhatian" && (
                    <Link
                      to={`/kartu/${it.kartu}`}
                      className="mt-2 inline-flex min-h-sentuh items-center font-semibold text-utama underline"
                    >
                      {t.lihatPanduan}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-kecil text-redup">{t.temuanKosong}</p>
          )}
        </section>
      </DenahKamarMandi>

      <PeringatanNonMedis />
      <div className="flex flex-col gap-3">
        <TombolLink to="/rencana">{t.keRencana}</TombolLink>
        <Tombol gayaTombol="sekunder" onClick={onUlang}>
          {t.ulang}
        </Tombol>
      </div>
    </>
  );
}
