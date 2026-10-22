import { useEffect, useRef, useState } from "react";
import { titikDinding } from "../domain/denahGeometri";
import { gambarBenda, type JenisBenda } from "../domain/gambarBenda";
import { gambarShower, keRuang, kotak, poligon, TINGGI_DINDING_PANEL, type Kerangka, type Primitif } from "../domain/gambarShower";
import { LANTAI_DALAM, LANTAI_LEBAR, posisiTigaMenempel } from "../domain/isoTigaGeometri";
import { OBJEK_DENAH, type LetakDenah, type ObjekDenah, type VarianShower } from "../domain/pindai";
import { bangunProyeksi } from "../lib/proyeksiIso3D";
import { LapisPrimitif } from "./GambarShower";
import { TEBAL_DINDING, TINGGI_DINDING } from "./iso3dKalibrasi";

const JENIS_BENDA_DENAH: Record<Exclude<ObjekDenah, "area_mandi">, JenisBenda> = {
  pintu: "pintu",
  kloset: "kloset_duduk",
  wastafel: "wastafel",
};

// Frustum harus cukup besar untuk memuat lantai DAN tinggi dinding (kalau TINGGI_DINDING dinaikkan, bagian atas
// dinding/pintu bisa terpotong) — dicek visual.
const UKURAN_FRUSTUM = Math.max(Math.hypot(LANTAI_LEBAR, LANTAI_DALAM) / 2, TINGGI_DINDING * 1.1) * 1.2;
// Setengah-lebar lantai di layar pada sudut isometrik, dengan sedikit ruang tepi; kanvas yang lebih sempit dari
// tingginya memperbesar frustum supaya ruangan tidak terpotong di kiri-kanan.
const SETENGAH_LEBAR_LAYAR = ((LANTAI_LEBAR + LANTAI_DALAM) / Math.SQRT2 / 2) * 1.08;
const SKALA = TINGGI_DINDING / TINGGI_DINDING_PANEL;

/** Azimuth kamera (radian) supaya dinding samping yang digambar SELALU di sisi jauh dari kamera (tidak menghalangi
 *  benda): kamera di (+X,+Z) (45°) membuat sisi kiri+belakang jauh; kamera di (-X,+Z) (135°) membuat kanan+belakang jauh. */
function azimuthDariSudut(sisiSamping: "kiri" | "kanan"): number {
  return sisiSamping === "kanan" ? (3 * Math.PI) / 4 : Math.PI / 4;
}

/** Permukaan dalam dinding (dinding setebal TEBAL_DINDING berpusat di garis lantai). */
function bidangDalam(dinding: "belakang" | "depan" | "kiri" | "kanan"): number {
  switch (dinding) {
    case "belakang":
      return -LANTAI_DALAM / 2 + TEBAL_DINDING / 2;
    case "depan":
      return LANTAI_DALAM / 2 - TEBAL_DINDING / 2;
    case "kiri":
      return -LANTAI_LEBAR / 2 + TEBAL_DINDING / 2;
    case "kanan":
      return LANTAI_LEBAR / 2 - TEBAL_DINDING / 2;
  }
}

/**
 * Tampilan isometrik tingkat-ruangan (prototipe di belakang flag `VITE_ISO_3D`), seluruhnya gambar SVG bergaya manual
 * perakitan: lantai dan dinding polos (belakang selalu, satu dinding samping sesuai `sudutAktif.x`), lalu keempat benda
 * (pintu, kloset, wastafel, shower) diposisikan sesuai `letak(id)` yang sama dengan denah tampak atas. Kamera
 * ortografik isometrik sungguhan berputar mengelilingi ruangan (`bangunProyeksi`), jadi sudut pandang tetap benar;
 * tidak ada Three.js, kanvas WebGL, atau model 3D yang dimuat (ringan untuk kuota rendah).
 */
export function PratinjauRuangIso3D({
  letak,
  sudutAktif,
  varianShower = "tidak_jelas",
  kelas = "h-96 w-full",
}: {
  letak: (id: ObjekDenah) => LetakDenah;
  sudutAktif: { x: "kiri" | "kanan" };
  varianShower?: VarianShower;
  kelas?: string;
}) {
  const pembungkusRef = useRef<HTMLDivElement>(null);
  const [ukuran, setUkuran] = useState<{ lebar: number; tinggi: number } | null>(null);
  useEffect(() => {
    const el = pembungkusRef.current;
    if (!el) return;
    const ukur = () => setUkuran(el.clientWidth > 0 && el.clientHeight > 0 ? { lebar: el.clientWidth, tinggi: el.clientHeight } : null);
    ukur();
    const pengamat = new ResizeObserver(ukur);
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);

  let gambar = null;
  if (ukuran) {
    const proyeksi = bangunProyeksi(
      azimuthDariSudut(sudutAktif.x),
      ukuran.lebar,
      ukuran.tinggi,
      Math.max(UKURAN_FRUSTUM, (SETENGAH_LEBAR_LAYAR * ukuran.tinggi) / ukuran.lebar),
    );
    const lihat = { x: sudutAktif.x === "kanan" ? -1 : 1, y: 1 } as const;

    // Lantai dan dinding polos. Dinding digambar setebal TEBAL_DINDING (satuan ruangan; dibagi SKALA ke satuan panel).
    const lantai = poligon(
      "latar",
      [
        proyeksi(-LANTAI_LEBAR / 2, -LANTAI_DALAM / 2, 0),
        proyeksi(LANTAI_LEBAR / 2, -LANTAI_DALAM / 2, 0),
        proyeksi(LANTAI_LEBAR / 2, LANTAI_DALAM / 2, 0),
        proyeksi(-LANTAI_LEBAR / 2, LANTAI_DALAM / 2, 0),
      ],
      "netral",
    );
    const tebalPanel = TEBAL_DINDING / SKALA;
    const kerangkaDinding = (dinding: "belakang" | "kiri" | "kanan"): Kerangka => ({
      dinding,
      sepanjang: 0,
      bidang: bidangDalam(dinding),
      proyeksi,
      skala: SKALA,
      lihat,
    });
    const setengahLebar = LANTAI_LEBAR / 2 / SKALA;
    const setengahDalam = LANTAI_DALAM / 2 / SKALA;
    const dindingBelakang = kotak(
      kerangkaDinding("belakang"),
      -setengahLebar - tebalPanel,
      setengahLebar + tebalPanel,
      -tebalPanel,
      0,
      0,
      TINGGI_DINDING_PANEL,
      "netral",
    );
    // Dinding samping dimulai dari permukaan dalam dinding belakang supaya sambungan sudutnya tidak bergaris ganda.
    const dindingSamping = kotak(
      kerangkaDinding(sudutAktif.x),
      -setengahDalam + tebalPanel / 2,
      setengahDalam + tebalPanel,
      -tebalPanel,
      0,
      0,
      TINGGI_DINDING_PANEL,
      "netral",
    );

    const susunan = OBJEK_DENAH.map((id) => {
      const letakId = letak(id);
      const dinding = titikDinding(letakId).dinding;
      const posisi = posisiTigaMenempel(letakId);
      const kerangka: Kerangka = {
        dinding,
        sepanjang: dinding === "belakang" || dinding === "depan" ? posisi.x : posisi.z,
        bidang: bidangDalam(dinding),
        proyeksi,
        skala: SKALA,
        lihat,
      };
      const daftar: Primitif[] =
        id === "area_mandi" ? gambarShower(varianShower, "kondisi", { kerangka }) : gambarBenda(JENIS_BENDA_DENAH[id], kerangka);
      // Urutan gambar dari belakang ke depan: titik pijak benda yang lebih rendah di layar berarti lebih dekat kamera.
      const [x, y] = keRuang(kerangka, 0, 0);
      return { id, daftar, kedalaman: proyeksi(x, y, 0)[1] };
    }).sort((a, b) => a.kedalaman - b.kedalaman);

    gambar = (
      <svg viewBox={`0 0 ${ukuran.lebar} ${ukuran.tinggi}`} className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
        <g strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round">
          <LapisPrimitif daftar={[lantai, ...dindingBelakang, ...dindingSamping]} garisDasar={1.6} />
          {susunan.map((b) => (
            <g key={b.id}>
              <LapisPrimitif daftar={b.daftar} tebal={0.75} garisDasar={1.6} />
            </g>
          ))}
        </g>
      </svg>
    );
  }

  return (
    <div ref={pembungkusRef} className={`relative mx-auto ${kelas}`}>
      {gambar}
    </div>
  );
}
