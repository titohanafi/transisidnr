import { ClipboardCheck, ExternalLink, Hammer } from "lucide-react";
import { AksiHalaman, KembaliKeRencana, useKonteksAksi } from "../components/AksiHalaman";
import { Tanda } from "../components/Lencana";
import { TombolAksi } from "../components/TombolAksi";
import { aksiTersedia } from "../domain/aksi";
import { konten } from "../domain/content";
import { track } from "../lib/events";

const { aksi, kartu: tk, umum } = konten.ui;
const t = aksi.beli;

// Beli: cara cek kecocokan tampil DI ATAS tombol; tombol produk hanya aktif bila tautan ada.
export function AksiBeli() {
  const ctx = useKonteksAksi();
  if (!ctx) return <KembaliKeRencana />;
  const barang = ctx.kartu.solusi![ctx.tingkat]!.barang;

  return (
    <AksiHalaman judul={ctx.kartu.judul} labelAtas={t.label} kartu={ctx.kartu} tingkat={ctx.tingkat} latarPutih tanpaKembali>
      {barang.length === 0 ? (
        <p>{t.kosong}</p>
      ) : (
        <>
          <ul className="space-y-5">
            {barang.map((b) => (
              <li key={b.nama} className="overflow-hidden rounded-kartu border border-garis bg-white">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-judulKartu">{b.nama}</h2>
                    {b.afiliasi && <Tanda>{t.afiliasi}</Tanda>}
                  </div>
                  {b.afiliasi && <p className="mt-1 text-kecil text-redup">{t.afiliasiPenjelasan}</p>}

                  <div className="mt-4 flex gap-3 rounded-tombol border border-catatan-garis bg-catatan-muda p-4 text-catatan">
                    <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
                    <p>{b.cek_kecocokan}</p>
                  </div>
                </div>

                <dl className="divide-y divide-garis/70 border-t border-garis/70">
                  <div className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                    <dt className="text-redup">{tk.spesifikasi}</dt>
                    <dd className="text-right font-medium">{b.spesifikasi}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                    <dt className="text-redup">{tk.harga}</dt>
                    <dd className="text-right font-medium">{b.kisaran_harga ?? umum.menyusul}</dd>
                  </div>
                </dl>

                <div className="border-t border-garis/70 p-5">
                  {b.link ? (
                    <a
                      href={b.link}
                      target="_blank"
                      rel={b.afiliasi ? "noopener noreferrer sponsored" : "noopener noreferrer"}
                      onClick={() => track("aksi_klik", { jenis: "produk", kartu_id: ctx.kartu.id, afiliasi: b.afiliasi })}
                      className="tekan inline-flex min-h-sentuh w-full items-center justify-center gap-2 rounded-tombol bg-utama px-5 py-2 font-semibold text-white hover:bg-utama-gelap"
                    >
                      {t.lihatProduk}
                      <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden="true" focusable="false" />
                      <span className="sr-only">: {b.nama}</span>
                    </a>
                  ) : (
                    <p className="flex min-h-sentuh items-center justify-center gap-2 rounded-tombol bg-permukaan px-5 py-2 text-redup">
                      <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden="true" focusable="false" />
                      {t.linkMenyusul}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {aksiTersedia(ctx.kartu, ctx.tingkat).includes("tukang") && (
            <section className="rounded-kartu bg-permukaan p-5" aria-label={tk.jembatanPasang}>
              <div className="flex gap-3">
                <Hammer className="mt-0.5 h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
                <p>{tk.jembatanPasang}</p>
              </div>
              <TombolAksi jenis="tukang" kartuId={ctx.kartu.id} tingkat={ctx.tingkat} gayaTombol="sekunder" className="mt-4 w-full" />
            </section>
          )}
        </>
      )}
    </AksiHalaman>
  );
}
