import { MessageCircle, Phone, TriangleAlert } from "lucide-react";
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
  "tekan inline-flex min-h-sentuh items-center justify-center gap-2 rounded-tombol bg-utama px-4 text-isi font-semibold text-white hover:bg-utama-gelap";
const tombolSekunder =
  "tekan inline-flex min-h-sentuh items-center justify-center gap-2 rounded-tombol border border-utama/60 bg-white px-4 text-isi font-semibold text-utama hover:bg-utama-muda";

function Aksi({ entri }: { entri: EntriKontak }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {entri.telepon && (
        <a href={urlTelepon(entri.telepon)} className={tombolTelepon}>
          <Phone className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
          {t.telepon}
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
    <Halaman judul={t.judul} judulTersembunyi kepala={<p className="mt-2 text-redup">{t.pengantar}</p>}>
      <div className="flex flex-col gap-bagian">
        <section className="rounded-kartu border border-bahaya/25 bg-bahaya-muda p-5" aria-labelledby="darurat">
          <div className="flex items-center gap-3 text-bahaya">
            <TriangleAlert className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
            <h2 id="darurat" className="text-subjudul">
              {igd.judul}
            </h2>
          </div>
          <p className="mt-2">{igd.isi}</p>
          {igd.tandaBahaya.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {igd.tandaBahaya.map((x) => (
                <li key={x} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-bahaya" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3">{igd.menyusul}</p>
          )}
          {darurat && darurat.entri.length > 0 && (
            <ul className="mt-4 space-y-3 border-t border-bahaya/25 pt-4">
              {darurat.entri.map((e) => (
                <li key={e.id}>
                  <p className="font-semibold">{e.nama}</p>
                  {e.catatan && <p className="text-kecil text-redup">{e.catatan}</p>}
                  <Aksi entri={e} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {kartu && disarankan.length > 0 && (
          <p role="note" className="rounded-kartu bg-utama-muda p-4">
            {isi(t.untukPanduan, { judul: kartu.judul })}
          </p>
        )}

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

        <div className="flex flex-col gap-4">
          {tampil.map((g) => {
            const info = ahli.find((a) => a.jenis === g.kategori.id);
            const saran = kartu?.bantuan?.find((b) => b.jenis === g.kategori.id);
            return (
              <section
                key={g.kategori.id}
                className="overflow-hidden rounded-kartu border border-garis bg-white"
                aria-labelledby={`kat-${g.kategori.id}`}
              >
                <div className="p-4">
                  <h2 id={`kat-${g.kategori.id}`} className="text-judulKartu">
                    {g.kategori.nama}
                  </h2>
                  <p className="mt-1 text-kecil text-redup">{g.kategori.arti}</p>
                  {saran && (
                    <div className="mt-3">
                      <Tanda>{t.saranUntukPanduan}</Tanda>
                      <p className="mt-2">{saran.keterangan}</p>
                    </div>
                  )}
                </div>
                <div className="divide-y divide-garis/70 border-t border-garis/70">
                  {g.entri.length === 0 ? (
                    <p className="p-4 text-redup">{t.kosong}</p>
                  ) : (
                    g.entri.map((e) => (
                      <div key={e.id} className="p-4">
                        <p className="font-semibold">{e.nama}</p>
                        {(e.kota || e.alamat || e.catatan) && (
                          <p className="text-kecil text-redup">{[e.kota, e.alamat, e.catatan].filter(Boolean).join(" · ")}</p>
                        )}
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
