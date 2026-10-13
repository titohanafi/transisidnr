import { Link } from "react-router-dom";
import { Tanda } from "./Lencana";
import { konten } from "../domain/content";
import type { AlatItem } from "../domain/jelajah";
import { track } from "../lib/events";

const { kartu: tk, umum, jelajah: tj, aksi } = konten.ui;
const t = aksi.beli;

// Spesifikasi dan harga sama-sama belum ada: cukup satu baris, bukan dua baris "menyusul".
const belumAdaDetail = (b: AlatItem) =>
  b.kisaran_harga === null && /^menyusul/i.test(b.spesifikasi);

// Daftar alat dari semua panduan. Cara cek kecocokan tampil di atas tombol; tombol produk aktif hanya bila ada tautan.
export function DaftarAlat({ alat }: { alat: AlatItem[] }) {
  if (alat.length === 0) return <p className="mt-5">{tj.alat.kosong}</p>;
  return (
    <ul className="mt-5 space-y-4">
      {alat.map((b) => (
        <li
          key={b.nama}
          className="rounded-kartu border border-garis bg-white p-4"
        >
          <h2 className="text-lg font-semibold">{b.nama}</h2>
          <p className="mt-2 rounded-tombol bg-aksen-muda p-2">
            <span className="font-semibold">{tk.cek}:</span> {b.cek_kecocokan}
          </p>
          {belumAdaDetail(b) ? (
            <p className="mt-2 text-redup">{tj.alat.detailMenyusul}</p>
          ) : (
            <>
              <p className="mt-2">
                <span className="font-semibold">{tk.spesifikasi}:</span>{" "}
                {b.spesifikasi}
              </p>
              <p className="mt-1">
                <span className="font-semibold">{tk.harga}:</span>{" "}
                {b.kisaran_harga ?? umum.menyusul}
              </p>
            </>
          )}
          {b.afiliasi && (
            <div className="mt-2">
              <Tanda>{t.afiliasi}</Tanda>
              <p className="mt-1 text-sm text-redup">{t.afiliasiPenjelasan}</p>
            </div>
          )}
          <p className="mt-3 text-sm text-redup">
            {tj.alat.dipakaiDi}:{" "}
            {b.panduan.map((p, i) => (
              <span key={p.id}>
                {i > 0 && ", "}
                <Link
                  to={`/kartu/${p.id}/${p.tingkat}`}
                  className="text-utama underline"
                >
                  {p.judul}
                </Link>
              </span>
            ))}
          </p>
          <div className="mt-3">
            {b.link ? (
              <a
                href={b.link}
                target="_blank"
                rel={
                  b.afiliasi
                    ? "noopener noreferrer sponsored"
                    : "noopener noreferrer"
                }
                onClick={() =>
                  track("aksi_klik", {
                    jenis: "produk",
                    kartu_id: b.panduan[0].id,
                    afiliasi: b.afiliasi,
                  })
                }
                className="inline-flex min-h-sentuh w-full items-center justify-center rounded-tombol bg-utama px-5 py-2 font-semibold text-white hover:bg-utama-gelap"
              >
                {t.lihatProduk}
                <span className="sr-only">: {b.nama}</span>
              </a>
            ) : (
              <p className="text-sm text-redup">{t.linkMenyusul}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
