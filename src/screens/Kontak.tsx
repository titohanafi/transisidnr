import {
  Accessibility,
  Activity,
  ChevronDown,
  DraftingCompass,
  Hammer,
  HandHelping,
  Landmark,
  MapPin,
  MessageCircle,
  Phone,
  Siren,
  Stethoscope,
  TriangleAlert,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { Tanda } from "../components/Lencana";
import { LipatBaris } from "../components/Lipat";
import { PilihanPil } from "../components/Pilihan";
import { konten } from "../domain/content";
import type { KategoriKontak } from "../domain/konstanta";
import { kategoriUntukKartu, kelompokkanKontak, urlTelepon, urlWhatsAppKontak, type EntriKontak } from "../domain/kontak";
import { kumpulkanAhli } from "../domain/jelajah";
import { isi } from "../lib/teks";

const { kontak: t, igd, aksi } = konten.ui;

const tombolTelepon =
  "tekan inline-flex min-h-sentuh min-w-0 flex-1 items-center justify-center gap-2 rounded-tombol bg-utama px-3 py-2 text-center text-isi font-semibold text-white hover:bg-utama-gelap";
const tombolSekunder =
  "tekan inline-flex min-h-sentuh min-w-0 flex-1 items-center justify-center gap-2 rounded-tombol border border-utama/60 bg-white px-3 py-2 text-center text-isi font-semibold text-utama hover:bg-utama-muda";

// Ikon per jenis kontak (dekoratif; artinya sudah ada di nama jenis di sebelahnya).
const IKON_KATEGORI: Record<KategoriKontak, LucideIcon> = {
  darurat: Siren,
  layanan_pemerintah: Landmark,
  dokter_rehabilitasi: Stethoscope,
  prostetis_ortotis: Accessibility,
  okupasi_terapis: HandHelping,
  fisioterapis: Activity,
  tukang: Hammer,
  arsitek: DraftingCompass,
  komunitas: UsersRound,
};

function Aksi({ entri }: { entri: EntriKontak }) {
  return (
    <div className="mt-3 flex gap-2">
      {entri.telepon && (
        <a href={urlTelepon(entri.telepon)} className={tombolTelepon}>
          <Phone className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
          <span className="sr-only">{t.telepon} </span>
          {entri.telepon}
          <span className="sr-only">: {entri.nama}</span>
        </a>
      )}
      {entri.whatsapp && (
        <a href={urlWhatsAppKontak(entri.whatsapp)} target="_blank" rel="noopener noreferrer" className={tombolSekunder}>
          <MessageCircle className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
          {t.whatsapp}
          <span className="sr-only">: {entri.nama}</span>
        </a>
      )}
    </div>
  );
}

// Halaman Kontak: nomor darurat dan tanda bahaya di atas, lalu daftar ahli per jenis (peran, panduan terkait, dan kontak).
// Isi kontak ada di content/kontak.json; yang belum ada tampil "sedang disiapkan", tidak pernah diisi karangan.
export function Kontak() {
  const lokasi = useLocation();
  const kartuId = (lokasi.state as { kartuId?: string } | null)?.kartuId;
  const kartu = konten.kartu.find((k) => k.id === kartuId);
  const disarankan = kartu ? kategoriUntukKartu(kartu) : [];
  const [filter, setFilter] = useState<"semua" | KategoriKontak>("semua");

  const kelompok = kelompokkanKontak(konten.kontak, disarankan);
  const darurat = kelompok.find((g) => g.kategori.id === "darurat");
  const lainnya = kelompok.filter((g) => g.kategori.id !== "darurat");
  const tampil = filter === "semua" ? lainnya : lainnya.filter((g) => g.kategori.id === filter);
  const ahli = kumpulkanAhli(konten.kartu);

  return (
    <Halaman
      judul={t.judul}
      judulTersembunyi
      latarPutih
      kepalaPita="gelap"
      kepalaTumpang
      kepala={
        darurat && darurat.entri.length > 0 ? (
          <h2 id="nomor-darurat" className="flex items-center gap-2 text-subjudul text-white">
            <Siren className="h-5 w-5 shrink-0 text-daun" strokeWidth={2} aria-hidden="true" focusable="false" />
            {darurat.kategori.nama}
          </h2>
        ) : (
          <div aria-hidden="true" />
        )
      }
    >
      <div className="flex flex-col gap-bagian">
        {darurat && darurat.entri.length > 0 && (
          <section aria-labelledby="nomor-darurat" className="-mt-4 rounded-kartu border border-utama-redup bg-white p-4 shadow-kartu">
            <ul className="divide-y divide-utama-redup/60">
              {darurat.entri.map((e) =>
                e.telepon ? (
                  <li key={e.id}>
                    <a href={urlTelepon(e.telepon)} className="tekan flex min-h-[56px] items-center gap-3 py-3">
                      <Phone className="h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
                      <span className="min-w-0 flex-1 font-medium leading-snug">{e.nama.replace(/\s*\(\d+\)$/, "")}</span>
                      <span className="shrink-0 text-judulKartu font-bold tabular-nums text-utama">{e.telepon}</span>
                      <span className="sr-only">
                        {t.telepon} {e.telepon}
                      </span>
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        )}

        <section className="overflow-hidden rounded-kartu border border-catatan-garis bg-catatan-muda" aria-labelledby="tanda-bahaya">
          <details className="group">
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-3 text-catatan [&::-webkit-details-marker]:hidden">
              <TriangleAlert className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
              <h2 id="tanda-bahaya" className="flex-1 text-judulKartu">
                {igd.judul}
              </h2>
              <ChevronDown
                className="h-5 w-5 shrink-0 motion-safe:transition-transform group-open:rotate-180"
                strokeWidth={2}
                aria-hidden="true"
                focusable="false"
              />
            </summary>
            <div className="px-4 pb-4">
              <p>{igd.isi}</p>
              {igd.tandaBahaya.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {igd.tandaBahaya.map((x) => (
                    <li key={x} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-catatan" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3">{igd.menyusul}</p>
              )}
            </div>
          </details>
        </section>

        {kartu && disarankan.length > 0 && (
          <p role="note" className="rounded-kartu bg-utama-muda p-4">
            {isi(t.untukPanduan, { judul: kartu.judul })}
          </p>
        )}

        <h2 className="-mb-2 text-subjudul">{t.daftarJudul}</h2>

        <fieldset>
          <legend className="sr-only">{t.filterJudul}</legend>
          <div className="flex flex-wrap gap-2">
            <PilihanPil nama="kategori-kontak" label={t.filterSemua} aktif={filter === "semua"} onUbah={() => setFilter("semua")} />
            {lainnya.map((g) => (
              <PilihanPil
                key={g.kategori.id}
                nama="kategori-kontak"
                label={g.kategori.nama}
                aktif={filter === g.kategori.id}
                onUbah={() => setFilter(g.kategori.id)}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-bagian">
          {tampil.map((g) => {
            const info = ahli.find((a) => a.jenis === g.kategori.id);
            const saran = kartu?.bantuan?.find((b) => b.jenis === g.kategori.id);
            const Ikon = IKON_KATEGORI[g.kategori.id];
            return (
              <section
                key={g.kategori.id}
                className="overflow-hidden rounded-kartu border border-garis/70 bg-white shadow-kartu"
                aria-labelledby={`kat-${g.kategori.id}`}
              >
                <h2 id={`kat-${g.kategori.id}`} className="flex items-center gap-3 p-4 text-judulKartu">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda text-utama">
                    <Ikon className="h-6 w-6" strokeWidth={2} aria-hidden="true" focusable="false" />
                  </span>
                  {g.kategori.nama}
                </h2>
                <div className="divide-y divide-garis/60 border-t border-garis/60">
                  <div className="px-4 py-3">
                    <p className="text-kecil text-redup">{g.kategori.arti}</p>
                    {saran && (
                      <div className="mt-3">
                        <Tanda>{t.saranUntukPanduan}</Tanda>
                        <p className="mt-2">{saran.keterangan}</p>
                      </div>
                    )}
                  </div>
                  {g.entri.length === 0 ? (
                    <p className="px-4 py-3 text-redup">{t.kosong}</p>
                  ) : (
                    g.entri.map((e) => (
                      <div key={e.id} className="px-4 py-3">
                        <p className="font-semibold">{e.nama}</p>
                        {(e.kota || e.alamat) && (
                          <p className="mt-1 flex items-start gap-1.5 text-kecil text-redup">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
                            <span>{[e.kota, e.alamat].filter(Boolean).join(" · ")}</span>
                          </p>
                        )}
                        {e.catatan && <p className="mt-1 text-kecil text-redup">{e.catatan}</p>}
                        <Aksi entri={e} />
                      </div>
                    ))
                  )}
                  {info && (
                    <LipatBaris judul={`${t.panduanTerkait} (${info.panduan.length})`}>
                      <ul className="space-y-2">
                        {info.panduan.map((p) => (
                          <li key={p.id}>
                            <Link to={`/kartu/${p.id}`} className="font-semibold text-utama underline">
                              {p.judul}
                            </Link>
                            <p className="text-kecil text-redup">{p.keterangan}</p>
                          </li>
                        ))}
                      </ul>
                    </LipatBaris>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <p className="px-1 text-kecil text-redup">{aksi.ahli.nyeri}</p>
      </div>
    </Halaman>
  );
}
