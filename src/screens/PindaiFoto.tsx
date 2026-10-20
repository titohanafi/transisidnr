import { Camera, CircleCheck, Image as IkonGaleri, Loader2, ScanLine } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DenahKamarMandi } from "../components/DenahKamarMandi";
import { Halaman } from "../components/Halaman";
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
  | { nama: "hasil"; temuan: Record<string, StatusItem>; objek: Record<ObjekDenah, PosisiObjek> };

const LABEL_STATUS: Record<StatusItem, string> = t.status;
const GAYA_STATUS: Record<StatusItem, string> = {
  ramah: "border-utama bg-utama-muda text-utama-gelap",
  perhatian: "border-aksen bg-aksen-muda text-aksen",
  tidak_jelas: "border-garis bg-white text-redup",
};

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
      else setTahap({ nama: "hasil", temuan: hasil.temuan, objek: hasil.objek });
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
    <Halaman
      judul={t.judul}
      // Ikon+penjelasan cuma tampil sebelum ada foto (tahap "pilih"); dibuat elemen biasa di badan halaman (bukan
      // pita berwarna) supaya header tidak berganti warna tiap pindah tahap — sebelumnya pita gelap dipakai di sini
      // lalu hilang begitu foto dipilih, yang membuat bilah atas ikut melompat warna setiap kali bolak-balik tahap.
      kepala={
        tahap.nama === "pilih" ? (
          <div className="mt-3 flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda text-utama"
            >
              <ScanLine className="h-5 w-5" strokeWidth={2} focusable="false" />
            </span>
            <p className="text-redup">{t.penjelasan}</p>
          </div>
        ) : undefined
      }
      latarPutih
    >
      {masukan(kamera, "environment")}
      {masukan(galeri)}

      {/* Jarak antar-bagian di bawah ini dipusatkan lewat `gap-bagian` (bukan mb-4/mt-6 per elemen) supaya ritmenya rata. */}
      <div className="flex flex-col gap-bagian">
        {foto && (
          <div className="relative overflow-hidden rounded-kartu border border-garis/70 bg-kertas shadow-kartu">
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

        {tahap.nama === "pilih" && (
          <>
            <section className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
              <h2 className="mb-2 text-judulKartu">{t.tipJudul}</h2>
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
                    {(
                      [
                        ["ramah", t.ya],
                        ["perhatian", t.tidak],
                        ["tidak_jelas", t.tidakYakin],
                      ] as const
                    ).map(([nilai, label]) => (
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
            <Tombol className="mt-4 w-full" onClick={() => setTahap({ nama: "hasil", temuan: tahap.jawaban, objek: POSISI_BAWAAN })}>
              {t.lihatHasil}
            </Tombol>
          </section>
        )}

        {tahap.nama === "hasil" && <Hasil temuan={tahap.temuan} objek={tahap.objek} onUlang={ulang} />}
      </div>
    </Halaman>
  );
}

function Hasil({
  temuan,
  objek,
  onUlang,
}: {
  temuan: Record<string, StatusItem>;
  objek: Record<ObjekDenah, PosisiObjek>;
  onUlang: () => void;
}) {
  const skor = hitungSkor(temuan, ID_ITEM);
  const tingkat = t.tingkat[skor.tingkat];
  const NOMOR_ITEM = nomorItemHasil(ID_ITEM, temuan);
  return (
    <>
      <section aria-labelledby="judul-hasil" className="rounded-kartu border border-utama bg-utama-muda p-5">
        <p className="text-kecil font-semibold text-utama-gelap">{t.hasilJudul}</p>
        <h2 id="judul-hasil" tabIndex={-1} className="text-judulKartu text-tinta">
          {tingkat.judul}
        </h2>
        <p className="mt-2">{tingkat.isi}</p>
        {skor.jelas > 0 && <p className="mt-2 font-semibold">{isi(t.ringkasan, { ramah: skor.ramah, jelas: skor.jelas })}</p>}
        {skor.tidakJelas > 0 && <p className="text-kecil text-redup">{isi(t.tidakJelasJumlah, { n: skor.tidakJelas })}</p>}
      </section>

      <DenahKamarMandi temuan={temuan} objek={objek} />

      <section aria-labelledby="judul-temuan">
        <h2 id="judul-temuan" className="mb-isi text-judulKartu">
          {t.temuanJudul}
        </h2>
        <div className="flex flex-col gap-isi">
          {/* Dikelompokkan per status (perlu perhatian dulu, paling actionable) bukan urutan konten, supaya hal yang
              perlu ditindaklanjuti terlihat lebih dulu. Kelompok kosong (mis. tidak ada yang "tidak jelas") dilewati. */}
          {(["perhatian", "tidak_jelas", "ramah"] as const).map((s) => {
            const butir = t.item.filter((it) => (temuan[it.id] ?? "tidak_jelas") === s);
            if (butir.length === 0) return null;
            return (
              <div key={s}>
                <h3 className={`mb-2 inline-flex items-center rounded-full border px-3 py-1 text-kecil font-semibold ${GAYA_STATUS[s]}`}>
                  {LABEL_STATUS[s]} ({butir.length})
                </h3>
                <ul className="flex flex-col gap-3">
                  {butir.map((it) => (
                    <li key={it.id} className="rounded-kartu border border-garis/70 bg-white p-4 shadow-kartu">
                      <p className="flex items-center gap-2 font-semibold">
                        {NOMOR_ITEM[it.id] !== undefined && (
                          <span
                            aria-hidden="true"
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-mikro font-bold ${GAYA_STATUS[s]}`}
                          >
                            {NOMOR_ITEM[it.id]}
                          </span>
                        )}
                        {it.nama}
                      </p>
                      <p className="mt-1 text-kecil text-redup">{it.cek}</p>
                      {s === "perhatian" && (
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
              </div>
            );
          })}
        </div>
      </section>

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
