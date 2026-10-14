import { Link } from "react-router-dom";
import { konten } from "../domain/content";
import type { AhliItem } from "../domain/jelajah";

const { kartu: tk, jelajah: tj, aksi } = konten.ui;

// Daftar jenis ahli dari semua panduan, dengan panduan yang mereka bantu. Direktori orangnya belum ada.
export function DaftarAhli({ ahli }: { ahli: AhliItem[] }) {
  if (ahli.length === 0) return <p className="mt-5">{tj.ahli.kosong}</p>;
  return (
    <>
      <ul className="mt-5 space-y-4">
        {ahli.map((a) => (
          <li key={a.jenis} className="rounded-kartu border border-garis/70 bg-white shadow-kartu p-4">
            <h2 className="text-subjudul">{tk.jenisBantuan[a.jenis].nama}</h2>
            <p className="text-sm text-redup">{tk.jenisBantuan[a.jenis].arti}</p>
            <p className="mt-3 font-semibold">{tj.ahli.membantuDi}</p>
            <ul className="mt-1 space-y-2">
              {a.panduan.map((p) => (
                <li key={p.id}>
                  <Link to={`/kartu/${p.id}`} className="text-utama underline">
                    {p.judul}
                  </Link>
                  <p>{p.keterangan}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-medium">{tk.direktoriMenyusul}</p>
      <p role="note" className="mt-4 rounded-kartu border border-aksen bg-aksen-muda p-4">
        {aksi.ahli.nyeri}
      </p>
    </>
  );
}
