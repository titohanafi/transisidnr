import { useEffect, useRef, useState } from "react";
import { H, titikDinding, W } from "../domain/denahGeometri";
import { DIM } from "../domain/dimensiGambar";
import { gambarBenda, type JenisBenda } from "../domain/gambarBenda";
import {
  garisUbin,
  gambarShower,
  keRuang,
  kotak,
  poligon,
  type Dinding,
  type Kerangka,
  type Primitif,
  type Titik,
} from "../domain/gambarShower";
import { susunSepanjangDinding, type BendaDinding } from "../domain/tataLetak";
import { OBJEK_DENAH, type LetakDenah, type ObjekDenah, type VarianShower } from "../domain/pindai";
import { bangunProyeksi } from "../lib/proyeksiIso3D";
import { LapisPrimitif } from "./GambarShower";

const JENIS_BENDA_DENAH: Record<Exclude<ObjekDenah, "area_mandi">, JenisBenda> = {
  pintu: "pintu",
  kloset: "kloset_duduk",
  wastafel: "wastafel",
};

// Seluruh gambar dalam cm nyata (1 satuan = 1 cm, sama dengan panel): ruangan seluas ruang dalam toilet PerMen
// (`DIM.ruang`), benda memakai dimensi dari `DIM`. Kamera bekerja dalam meter, jadi koordinat dibagi 100.
const LEBAR = DIM.ruang.lebar;
const DALAM = DIM.ruang.dalam;
const TINGGI = DIM.ruang.tinggi;
const TEBAL = DIM.ruang.tebalDinding;
// Setengah-tinggi pandangan awal kamera (meter); gambar lalu dipas-kan ke kanvas, jadi nilainya tidak menentukan ukuran.
const FRUSTUM_AWAL = 2.2;
// Margin gambar terhadap tepi kanvas (pecahan lebar/tinggi).
const MARGIN = 0.05;

/**
 * Benda yang tidak digambar karena dinding tempatnya menempel tidak digambar (dinding samping berlawanan dan dinding
 * depan): dari luar mereka tampak dari belakang dan melayang. Berlaku sama untuk semua benda, termasuk pintu.
 */
export function bendaTersembunyi(letak: (id: ObjekDenah) => LetakDenah, sisiSamping: "kiri" | "kanan"): ObjekDenah[] {
  return OBJEK_DENAH.filter((id) => {
    const dinding = titikDinding(letak(id)).dinding;
    return dinding !== "belakang" && dinding !== sisiSamping;
  });
}

/** Azimuth kamera (radian) supaya dinding samping yang digambar SELALU di sisi jauh dari kamera (tidak menghalangi
 *  benda): kamera di (+X,+Z) (45°) membuat sisi kiri+belakang jauh; kamera di (-X,+Z) (135°) membuat kanan+belakang jauh. */
function azimuthDariSudut(sisiSamping: "kiri" | "kanan"): number {
  return sisiSamping === "kanan" ? (3 * Math.PI) / 4 : Math.PI / 4;
}

/** Permukaan dalam dinding (cm dari pusat ruangan): ruang dalam persis seluas `DIM.ruang`, dinding di luarnya. */
function bidangDalam(dinding: Dinding): number {
  switch (dinding) {
    case "belakang":
      return -DALAM / 2;
    case "depan":
      return DALAM / 2;
    case "kiri":
      return -LEBAR / 2;
    case "kanan":
      return LEBAR / 2;
  }
}

/** Titik benda sepanjang dindingnya (cm dari tengah dinding), dari `letak` yang sama dengan denah tampak atas. */
function sepanjangDinding(letak: LetakDenah): number {
  const t = titikDinding(letak);
  return t.dinding === "belakang" || t.dinding === "depan" ? ((t.x - W / 2) / W) * LEBAR : ((t.y - H / 2) / H) * DALAM;
}

// Setengah lebar tiap benda sepanjang dindingnya (cm), untuk menjaga jarak antar benda di satu dinding. Kloset: tangki dan
// mangkuk yang bergeser; shower: bilik pancuran minimum PerMen (90 cm).
const SETENGAH_LEBAR: Record<ObjekDenah, number> = {
  pintu: DIM.pintu.bukaanBersih / 2 + 4,
  kloset: 26,
  wastafel: DIM.wastafel.lebarBak / 2,
  area_mandi: 45,
};

/** Posisi tengah tiap benda sepanjang dindingnya (cm), digeser seperlunya supaya tidak berdempetan. */
function posisiSepanjang(letak: (id: ObjekDenah) => LetakDenah): Record<ObjekDenah, number> {
  const perDinding = new Map<Dinding, BendaDinding[]>();
  for (const id of OBJEK_DENAH) {
    const l = letak(id);
    const dinding = titikDinding(l).dinding;
    const daftar = perDinding.get(dinding) ?? [];
    daftar.push({ id, awal: sepanjangDinding(l), setengah: SETENGAH_LEBAR[id] });
    perDinding.set(dinding, daftar);
  }
  const hasil = {} as Record<ObjekDenah, number>;
  for (const [dinding, daftar] of perDinding) {
    const panjang = dinding === "belakang" || dinding === "depan" ? LEBAR : DALAM;
    Object.assign(hasil, susunSepanjangDinding(daftar, panjang));
  }
  return hasil;
}

/**
 * Tampilan isometrik tingkat-ruangan (prototipe di belakang flag `VITE_ISO_3D`), seluruhnya gambar SVG bergaya manual
 * perakitan dalam cm nyata: lantai dan dinding berkeramik (belakang selalu, satu dinding samping sesuai `sudutAktif.x`),
 * lalu keempat benda (pintu, kloset, wastafel, shower) diposisikan sesuai `letak(id)` yang sama dengan denah tampak atas.
 * Kamera ortografik isometrik sungguhan berputar mengelilingi ruangan (`bangunProyeksi`), jadi sudut pandang tetap
 * benar; tidak ada Three.js, kanvas WebGL, atau model 3D yang dimuat (ringan untuk kuota rendah).
 */
export function PratinjauRuangIso3D({
  letak,
  sudutAktif,
  varianShower = "tidak_jelas",
  tampilkanSemua = false,
  kelas = "h-96 w-full",
}: {
  letak: (id: ObjekDenah) => LetakDenah;
  sudutAktif: { x: "kiri" | "kanan" };
  varianShower?: VarianShower;
  /** Tampilkan juga benda yang biasanya disembunyikan (di dinding yang tidak digambar). */
  tampilkanSemua?: boolean;
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
    const dasar = bangunProyeksi(azimuthDariSudut(sudutAktif.x), ukuran.lebar, ukuran.tinggi, FRUSTUM_AWAL);
    const lihat = { x: sudutAktif.x === "kanan" ? -1 : 1, y: 1 } as const;

    // Pas-kan ruangan (lantai dan puncak dinding yang digambar) ke kanvas: diperbesar sebesar mungkin dan dipusatkan,
    // berapa pun bentuk kartunya.
    const sisiX = sudutAktif.x === "kanan" ? LEBAR / 2 : -LEBAR / 2;
    const dm = (x: number, y: number, z: number) => dasar(x / 100, y / 100, z / 100);
    const sudutRuang = [
      dm(-LEBAR / 2, -DALAM / 2, 0),
      dm(LEBAR / 2, -DALAM / 2, 0),
      dm(LEBAR / 2, DALAM / 2, 0),
      dm(-LEBAR / 2, DALAM / 2, 0),
      dm(-LEBAR / 2 - TEBAL, -DALAM / 2 - TEBAL, TINGGI),
      dm(LEBAR / 2 + TEBAL, -DALAM / 2 - TEBAL, TINGGI),
      dm(sisiX, DALAM / 2, TINGGI),
    ];
    const [xMin, xMax] = [Math.min(...sudutRuang.map((t) => t[0])), Math.max(...sudutRuang.map((t) => t[0]))];
    const [yMin, yMax] = [Math.min(...sudutRuang.map((t) => t[1])), Math.max(...sudutRuang.map((t) => t[1]))];
    const pembesaran = Math.min((ukuran.lebar * (1 - 2 * MARGIN)) / (xMax - xMin), (ukuran.tinggi * (1 - 2 * MARGIN)) / (yMax - yMin));
    const proyeksi = (x: number, y: number, z: number): Titik => {
      const [px, py] = dm(x, y, z);
      return [(px - (xMin + xMax) / 2) * pembesaran + ukuran.lebar / 2, (py - (yMin + yMax) / 2) * pembesaran + ukuran.tinggi / 2];
    };

    const kerangkaDinding = (dinding: Dinding): Kerangka => ({
      dinding,
      sepanjang: 0,
      bidang: bidangDalam(dinding),
      proyeksi,
      skala: 1,
      lihat,
    });

    // Lantai menutup seluruh telapak dinding: ruang dalam ditambah tebal dinding belakang dan dinding samping yang digambar.
    const [lantaiKiri, lantaiKanan] = sudutAktif.x === "kiri" ? [-LEBAR / 2 - TEBAL, LEBAR / 2] : [-LEBAR / 2, LEBAR / 2 + TEBAL];
    const lantai = poligon(
      "latar",
      [
        proyeksi(lantaiKiri, -DALAM / 2 - TEBAL, 0),
        proyeksi(lantaiKanan, -DALAM / 2 - TEBAL, 0),
        proyeksi(lantaiKanan, DALAM / 2, 0),
        proyeksi(lantaiKiri, DALAM / 2, 0),
      ],
      "netral",
    );
    // Dinding setebal TEBAL di luar ruang dalam. Dinding belakang melebar sampai menutupi ujung dinding samping; dinding
    // samping dimulai dari permukaan dalam dinding belakang. Garis keramik dimulai dari sudut pojok belakang.
    const kBelakang = kerangkaDinding("belakang");
    const kSamping = kerangkaDinding(sudutAktif.x);
    const dinding: Primitif[] = [
      ...kotak(kBelakang, -LEBAR / 2 - TEBAL, LEBAR / 2 + TEBAL, -TEBAL, 0, 0, TINGGI, "netral"),
      ...garisUbin(kBelakang, -LEBAR / 2, LEBAR / 2, TINGGI, -LEBAR / 2),
      ...kotak(kSamping, -DALAM / 2, DALAM / 2, -TEBAL, 0, 0, TINGGI, "netral"),
      ...garisUbin(kSamping, -DALAM / 2, DALAM / 2, TINGGI, -DALAM / 2),
    ];

    const tersembunyi = tampilkanSemua ? [] : bendaTersembunyi(letak, sudutAktif.x);
    const posisi = posisiSepanjang(letak);
    const susunan = OBJEK_DENAH.map((id) => {
      const letakId = letak(id);
      const kerangka: Kerangka = { ...kerangkaDinding(titikDinding(letakId).dinding), sepanjang: posisi[id] };
      // Benda yang disembunyikan tidak digambar sama sekali (termasuk pintu, tanpa garis bukaan).
      if (tersembunyi.includes(id)) return null;
      const daftar: Primitif[] =
        id === "area_mandi" ? gambarShower(varianShower, "kondisi", { kerangka }) : gambarBenda(JENIS_BENDA_DENAH[id], kerangka);
      // Urutan gambar dari belakang ke depan: titik pijak benda yang lebih rendah di layar berarti lebih dekat kamera.
      const [x, y] = keRuang(kerangka, 0, 0);
      return { id, daftar, kedalaman: proyeksi(x, y, 0)[1] };
    })
      .filter((b) => b !== null)
      .sort((a, b) => a.kedalaman - b.kedalaman);

    gambar = (
      <svg
        viewBox={`0 0 ${ukuran.lebar} ${ukuran.tinggi}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <g strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round">
          <LapisPrimitif daftar={[lantai, ...dinding]} garisDasar={1.6} />
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
