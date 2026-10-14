import { AksiHalaman, KembaliKeRencana, useKonteksAksi } from "../components/AksiHalaman";
import { Tanda } from "../components/Lencana";
import { Tombol } from "../components/Tombol";
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
    <AksiHalaman judul={t.judul} kartu={ctx.kartu} tingkat={ctx.tingkat} pengantar={barang.length > 0 ? t.bantuan : undefined}>
      {barang.length === 0 ? (
        <p>{t.kosong}</p>
      ) : (
        <>
          <ul className="space-y-4">
            {barang.map((b) => (
              <li key={b.nama} className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
                <h2 className="text-judulKartu">{b.nama}</h2>
                <p className="mt-2 rounded-tombol bg-aksen-muda p-3">
                  <span className="font-semibold">{tk.cek}:</span> {b.cek_kecocokan}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">{tk.spesifikasi}:</span> {b.spesifikasi}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">{tk.harga}:</span> {b.kisaran_harga ?? umum.menyusul}
                </p>
                {b.afiliasi && (
                  <div className="mt-2">
                    <Tanda>{t.afiliasi}</Tanda>
                    <p className="mt-1 text-sm text-redup">{t.afiliasiPenjelasan}</p>
                  </div>
                )}
                <div className="mt-4">
                  {b.link ? (
                    <a
                      href={b.link}
                      target="_blank"
                      rel={b.afiliasi ? "noopener noreferrer sponsored" : "noopener noreferrer"}
                      onClick={() => track("aksi_klik", { jenis: "produk", kartu_id: ctx.kartu.id, afiliasi: b.afiliasi })}
                      className="inline-flex min-h-sentuh w-full items-center justify-center rounded-tombol bg-utama px-5 py-2 font-semibold text-white hover:bg-utama-gelap"
                    >
                      {t.lihatProduk}
                      <span className="sr-only">: {b.nama}</span>
                    </a>
                  ) : (
                    <>
                      <Tombol disabled className="w-full">
                        {t.lihatProduk}
                        <span className="sr-only">: {b.nama}</span>
                      </Tombol>
                      <p className="mt-1 text-sm text-redup">{t.linkMenyusul}</p>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </AksiHalaman>
  );
}
