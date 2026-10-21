import { Info, X, ZoomIn } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { PilihanPil } from "./Pilihan";
import { konten } from "../domain/content";
import {
  nomorItemHasil,
  POSISI_BAWAAN,
  posisiPersenDenah,
  STATUS_ITEM,
  type DindingDenah,
  type LetakDenah,
  type ObjekDenah,
  type PosisiObjek,
  type StatusItem,
} from "../domain/pindai";

const t = konten.ui.pindai;
const ID_ITEM = t.item.map((i) => i.id);
/** Nama tiap hal, dipakai untuk popover saat badge nomor di denah diketuk. */
const NAMA_ITEM: Record<string, string> = Object.fromEntries(t.item.map((i) => [i.id, i.nama]));

const GAYA_BADGE: Record<StatusItem, string> = {
  ramah: "border-utama bg-utama-muda text-utama-gelap",
  perhatian: "border-aksen bg-aksen-muda text-aksen",
  tidak_jelas: "border-garis bg-white text-redup",
};
const WARNA_GARIS: Record<StatusItem, string> = { ramah: "text-utama-gelap", perhatian: "text-aksen", tidak_jelas: "text-garisKontrol" };
// Latar badge nomor diberi warna muda saat cocok filter (bukan cuma warna garis/teks): hijau ("ramah") dan abu netral
// (benda tidak cocok filter) bisa serupa gelapnya di lingkaran kecil kalau cuma dibedakan dari warna garis tipis saja
// — latar berwarna membuat badge yang disorot jelas beda dari yang tidak, terlepas mirip-tidaknya warna garisnya.
// "ramah" pakai "utama-redup" (bukan "utama-muda" yang dipakai badge pil lain): "utama-muda" terlalu pucat untuk
// lingkaran sekecil ini, nyaris menyatu dengan latar denah — jadi tidak cukup membedakan dari latar putih netral.
const LATAR_BADGE: Record<StatusItem, string> = { ramah: "fill-utama-redup", perhatian: "fill-aksen-muda", tidak_jelas: "fill-white" };

// Ukuran denah (viewBox): ruangan memanjang (bukan persegi), meniru proporsi kamar mandi pada umumnya.
const W = 200;
const H = 300;
const PAD = 10;
// Seberapa jauh benda digambar dari garis dinding (supaya terlihat "menempel" tanpa menimpa garisnya).
const JARAK_DINDING = 35;

// Proyeksi isometrik (opsi gaya tampilan kedua, lihat `tampilan` di DenahKamarMandi): koordinat benda yang sama
// persis dengan tampak atas (dari `letak`/`titikDinding`, tidak dihitung ulang) cuma diproyeksikan lewat `iso()`
// supaya posisi, status, dan koreksi user tetap satu sumber data — yang beda cuma cara menggambarnya.
const ISO_SUDUT = (30 * Math.PI) / 180;
const ISO_COS = Math.cos(ISO_SUDUT);
const ISO_SIN = Math.sin(ISO_SUDUT);
const ISO_TINGGI_DINDING = 85;
// viewBox dan pergeseran dipilih manual supaya ruangan (W×H di atas, diproyeksikan lewat sudut 30°) pas di tengah
// dengan sedikit jarak ke tepi, termasuk ruang di atas untuk dinding yang menjulang.
const ISO_VW = 454;
const ISO_VH = 356;
const ISO_OX = 270;
const ISO_OY = 95;

/** Fungsi murni: titik (x,y) tampak-atas + ketinggian opsional -> titik 2D isometrik di viewBox ISO_VW×ISO_VH. */
function iso(x: number, y: number, z = 0): { x: number; y: number } {
  return { x: (x - y) * ISO_COS + ISO_OX, y: (x + y) * ISO_SIN - z + ISO_OY };
}

/** Jajaran genjang isometrik dari persegi panjang tampak-atas berpusat (x,y), setengah-lebar rx dan setengah-tinggi ry. */
function isoPersegi(x: number, y: number, rx: number, ry: number, z = 0): string {
  return [iso(x - rx, y - ry, z), iso(x + rx, y - ry, z), iso(x + rx, y + ry, z), iso(x - rx, y + ry, z)]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
}

/** Elips isometrik dari lingkaran tampak-atas berpusat (x,y) berjari-jari r — dipakai untuk lingkaran "ruang gerak". */
function isoLingkaran(x: number, y: number, r: number, z = 0): string {
  return Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const p = iso(x + r * Math.cos(a), y + r * Math.sin(a), z);
    return `${p.x},${p.y}`;
  }).join(" ");
}

/**
 * Tiga sisi balok isometrik yang kelihatan dari sudut kamera denah ini (selalu dari arah depan-kiri, lihat
 * `ISO_OX`/`ISO_OY`): atas, depan (menghadap +y/ke arah "depan"), dan kiri (menghadap -x/ke arah "kiri") — sisi
 * belakang dan kanan tidak pernah terlihat jadi tidak digambar. Dipakai supaya benda (kloset, wastafel, pintu)
 * kelihatan benar-benar 3D, bukan jejak datar seperti zona (area mandi/ruang gerak) yang memang bukan benda fisik.
 */
function isoBalokSisi(x: number, y: number, rx: number, ry: number, tinggi: number, z = 0): { atas: string; depan: string; kiri: string } {
  const titik = (px: number, py: number, pz: number) => iso(px, py, pz);
  const ke = (titikSudut: { x: number; y: number }[]) => titikSudut.map((p) => `${p.x},${p.y}`).join(" ");
  return {
    atas: ke([
      titik(x - rx, y - ry, z + tinggi),
      titik(x + rx, y - ry, z + tinggi),
      titik(x + rx, y + ry, z + tinggi),
      titik(x - rx, y + ry, z + tinggi),
    ]),
    depan: ke([titik(x - rx, y + ry, z), titik(x + rx, y + ry, z), titik(x + rx, y + ry, z + tinggi), titik(x - rx, y + ry, z + tinggi)]),
    kiri: ke([titik(x - rx, y - ry, z), titik(x - rx, y + ry, z), titik(x - rx, y + ry, z + tinggi), titik(x - rx, y - ry, z + tinggi)]),
  };
}

/** Balok isometrik berwarna status, 3 sisi diberi opasitas beda (atas paling terang, kiri paling gelap) supaya terasa punya kedalaman. */
function ObjekIso({
  x,
  y,
  rx,
  ry,
  tinggi,
  z = 0,
  kelas,
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  tinggi: number;
  z?: number;
  kelas: string;
}) {
  const sisi = isoBalokSisi(x, y, rx, ry, tinggi, z);
  return (
    <g className={kelas} stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" fill="currentColor">
      <polygon points={sisi.kiri} fillOpacity={0.45} />
      <polygon points={sisi.depan} fillOpacity={0.3} />
      <polygon points={sisi.atas} fillOpacity={0.12} />
    </g>
  );
}

/**
 * Titik tempel benda ke dinding: koordinat sepanjang dinding dari posisi AI, koordinat tegak lurus dipaksa dekat
 * dinding. Dindingnya sendiri sudah pasti dari AI (bukan ditebak dari grid), jadi tidak ada ambiguitas pojok lagi.
 */
function titikDinding({ dinding, posisi }: LetakDenah): {
  x: number;
  y: number;
  dinding: DindingDenah;
} {
  const { kiri, atas } = posisiPersenDenah({ dinding, posisi });
  const x = PAD + (kiri / 100) * (W - 2 * PAD);
  const y = PAD + (atas / 100) * (H - 2 * PAD);
  if (dinding === "kiri") return { x: PAD + JARAK_DINDING, y, dinding };
  if (dinding === "kanan") return { x: W - PAD - JARAK_DINDING, y, dinding };
  if (dinding === "depan") return { x, y: H - PAD - JARAK_DINDING, dinding };
  return { x, y: PAD + JARAK_DINDING, dinding };
}

type Letak = LetakDenah;

/**
 * Badge bulat bernomor, supaya denah bisa dikorelasikan dengan baris yang cocok di "Rincian per indikator". Bisa diketuk
 * untuk menampilkan nama bendanya langsung di denah — cuma kemudahan visual (denah tetap `aria-hidden`; nama dan
 * statusnya tetap tertulis lengkap di "Rincian per indikator" untuk pembaca layar).
 */
function NomorBadge({
  x,
  y,
  nomor,
  warna,
  latar,
  id,
  terbuka,
  onToggle,
  batas = { kiri: PAD, kanan: W - PAD, atas: PAD },
}: {
  x: number;
  y: number;
  nomor: number;
  warna: string;
  /** Kelas fill lingkaran (mis. "fill-utama-muda" saat disorot) — dibedakan dari latar putih polos supaya badge yang
   *  disorot filter jelas beda dari yang tidak, tidak cuma mengandalkan warna garis tipis yang bisa mirip-mirip gelapnya. */
  latar: string;
  id: string;
  /** Status "terbuka" dikendalikan dari DenahKamarMandi (bukan state lokal di sini) supaya cuma satu popover yang
   *  bisa terbuka dalam satu waktu di seluruh denah — dua popover yang dibuka bersamaan gampang bertabrakan di ruang
   *  sekecil ini begitu makin banyak hal berstatus sama (lihat juga daftar nama di bawah toggle, bukan tampilkan
   *  semua popover sekaligus, untuk alasan yang sama). */
  terbuka: boolean;
  onToggle: () => void;
  /** Batas tepi tempat popover dijepit — baku untuk denah tampak atas (W×H); tampilan isometrik punya viewBox
   *  sendiri yang jauh lebih lebar, jadi mengirim batasnya sendiri di sini (lihat `denahSvgIso`). */
  batas?: { kiri: number; kanan: number; atas: number };
}) {
  const tampilkanPopover = terbuka;
  const nama = NAMA_ITEM[id] ?? "";
  const lebar = Math.max(44, nama.length * 5.6 + 16);
  const diAtas = y - 28 >= batas.atas; // kalau badge terlalu dekat dinding atas, popover ditaruh di bawah badge saja
  const pusatPopoverY = diAtas ? y - 27 : y + 27;
  const xPopover = Math.max(batas.kiri, Math.min(batas.kanan - lebar, x - lebar / 2));
  // Segitiga penunjuk dari popover ke badge nomornya: basisnya digeser sejajar x badge (dijepit ke dalam lebar
  // popover) supaya tetap menunjuk ke nomor yang benar walau kotak popovernya sendiri bergeser karena mepet tepi denah.
  const xSegitiga = Math.max(xPopover + 6, Math.min(xPopover + lebar - 6, x));
  const ySegitigaBasis = diAtas ? pusatPopoverY + 9 : pusatPopoverY - 9;
  const ySegitigaUjung = diAtas ? ySegitigaBasis + 5 : ySegitigaBasis - 5;
  return (
    <g>
      {/* stroke="none" ditulis eksplisit: badge ini kadang dipakai di dalam <g> yang sudah punya stroke/strokeWidth
          sendiri (mis. Pintu), dan tanpa ini garis ketebalannya ikut menimpa angkanya jadi tebal. pointerEvents="auto"
          juga eksplisit: badge ini bisa berdekatan dengan elemen dekoratif komponen LAIN yang sengaja dibuat
          pointerEvents="none" (supaya tidak menutupi klik badge ini) — auto memastikan badge sendiri tetap bisa
          diketuk terlepas dari pointer-events apa pun yang diwarisi dari pembungkusnya. */}
      <g
        className={`${warna} cursor-pointer`}
        stroke="none"
        pointerEvents="auto"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <circle cx={x} cy={y} r={9} className={latar} stroke="currentColor" strokeWidth={1.5} />
        <text
          x={x}
          y={y + 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight={400}
          fill="currentColor"
          stroke="none"
        >
          {nomor}
        </text>
      </g>
      {tampilkanPopover && (
        // stroke="none" eksplisit: sama seperti badge-nya sendiri, popover ini bisa dipakai di dalam <g> yang sudah
        // punya stroke/strokeWidth sendiri (mis. Pintu) — tanpa ini, teks popover ikut mewarisi garis tebal itu dan
        // jadi tidak terbaca (ini bug yang sama persis dengan bug angka "3" yang pernah diperbaiki, tapi kena bagian lain).
        <g pointerEvents="none" stroke="none">
          <rect x={xPopover} y={pusatPopoverY - 9} width={lebar} height={18} rx={4} className="fill-tinta" />
          <polygon
            points={`${xSegitiga - 5},${ySegitigaBasis} ${xSegitiga + 5},${ySegitigaBasis} ${xSegitiga},${ySegitigaUjung}`}
            className="fill-tinta"
          />
          <text x={xPopover + lebar / 2} y={pusatPopoverY + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={9} fill="white">
            {nama}
          </text>
        </g>
      )}
    </g>
  );
}

/** Fungsi murni: geser titik (x,y) ke arah ruangan (menjauhi dinding yang ditempel) sejauh `jarak`. */
function dorongKeDalam(x: number, y: number, dinding: DindingDenah, jarak: number): { x: number; y: number } {
  if (dinding === "kiri") return { x: x + jarak, y };
  if (dinding === "kanan") return { x: x - jarak, y };
  if (dinding === "depan") return { x, y: y - jarak };
  return { x, y: y + jarak };
}

/** Fungsi murni: paksa koordinat tegak lurus ke garis dinding persis (bukan digeser JARAK_DINDING seperti titikDinding) —
 *  dipakai di tampilan isometrik untuk daun pintu, yang digambar menempel rata dinding, bukan menjorok ke ruangan. */
function keDinding(x: number, y: number, dinding: DindingDenah): { x: number; y: number } {
  if (dinding === "kiri") return { x: PAD, y };
  if (dinding === "kanan") return { x: W - PAD, y };
  if (dinding === "depan") return { x, y: H - PAD };
  return { x, y: PAD };
}

/** Fungsi murni: pintu digambar menempel dinding sebagai celah + daun pintu terbuka + lintasan ayun putus-putus. */
function Pintu({
  letak,
  warna,
  latar,
  nomor,
  terbukaId,
  onToggleId,
}: {
  letak: Letak;
  warna: string;
  latar: string;
  nomor?: number;
  terbukaId: string | null;
  onToggleId: (id: string) => void;
}) {
  const { x, y, dinding } = titikDinding(letak);
  const panjang = 68;
  if (dinding === "kiri" || dinding === "kanan") {
    const sisi = dinding === "kiri" ? -1 : 1;
    const xDinding = dinding === "kiri" ? PAD : W - PAD;
    const xBuka = xDinding - sisi * panjang * 0.8;
    return (
      <g className={warna} stroke="currentColor" fill="none" strokeWidth={2}>
        <line x1={xDinding} y1={y - panjang / 2} x2={xDinding} y2={y + panjang / 2} stroke="white" strokeWidth={3} />
        <line x1={xDinding} y1={y - panjang / 2} x2={xBuka} y2={y} />
        <path
          d={`M ${xDinding} ${y + panjang / 2} A ${panjang} ${panjang} 0 0 ${dinding === "kiri" ? 1 : 0} ${xBuka} ${y}`}
          strokeDasharray="4 4"
          opacity={0.6}
        />
        {/* Badge digeser lebih jauh ke ruangan (bukan persis di ujung ayunan), supaya tidak menumpuk garis daun+lintasan pintu yang bertemu di satu titik — tapi tidak sejauh 46 (dulu), yang membuatnya terlihat terlalu jauh dari gambar pintunya. */}
        {nomor !== undefined && (
          <NomorBadge
            {...dorongKeDalam(x, y, dinding, 34)}
            nomor={nomor}
            warna={warna}
            latar={latar}
            id="pintu"
            terbuka={terbukaId === "pintu"}
            onToggle={() => onToggleId("pintu")}
          />
        )}
      </g>
    );
  }
  const sisi = dinding === "belakang" ? -1 : 1;
  const yDinding = dinding === "belakang" ? PAD : H - PAD;
  const yBuka = yDinding - sisi * panjang * 0.8;
  return (
    <g className={warna} stroke="currentColor" fill="none" strokeWidth={2}>
      <line x1={x - panjang / 2} y1={yDinding} x2={x + panjang / 2} y2={yDinding} stroke="white" strokeWidth={3} />
      <line x1={x - panjang / 2} y1={yDinding} x2={x} y2={yBuka} />
      <path
        d={`M ${x + panjang / 2} ${yDinding} A ${panjang} ${panjang} 0 0 ${dinding === "belakang" ? 0 : 1} ${x} ${yBuka}`}
        strokeDasharray="4 4"
        opacity={0.6}
      />
      {nomor !== undefined && (
        <NomorBadge
          {...dorongKeDalam(x, y, dinding, 34)}
          nomor={nomor}
          warna={warna}
          latar={latar}
          id="pintu"
          terbuka={terbukaId === "pintu"}
          onToggle={() => onToggleId("pintu")}
        />
      )}
    </g>
  );
}

/** Kloset menempel dinding (tangki di sisi dinding, mangkuk menghadap ruangan); tidak berstatus sendiri, hanya patokan lokasi pegangan. */
function Kloset({
  letak,
  warnaPegangan,
  latarPegangan,
  nomorPegangan,
  terbukaId,
  onToggleId,
}: {
  letak: Letak;
  warnaPegangan: string;
  latarPegangan: string;
  nomorPegangan?: number;
  terbukaId: string | null;
  onToggleId: (id: string) => void;
}) {
  const { x, y, dinding } = titikDinding(letak);
  const tangki =
    dinding === "kiri"
      ? { x: x - 32, y: y - 17, w: 20, h: 34 }
      : dinding === "kanan"
        ? { x: x + 12, y: y - 17, w: 20, h: 34 }
        : dinding === "depan"
          ? { x: x - 17, y: y + 12, w: 34, h: 20 }
          : { x: x - 17, y: y - 32, w: 34, h: 20 };
  // Garis pegangan digambar di sisi mangkuk yang menghadap ruangan (berlawanan arah tangki).
  const garis =
    dinding === "kiri"
      ? { x1: x + 24, y1: y - 23, x2: x + 24, y2: y + 23 }
      : dinding === "kanan"
        ? { x1: x - 24, y1: y - 23, x2: x - 24, y2: y + 23 }
        : dinding === "depan"
          ? { x1: x - 23, y1: y - 24, x2: x + 23, y2: y - 24 }
          : { x1: x - 23, y1: y + 24, x2: x + 23, y2: y + 24 };
  return (
    <g>
      {/* pointerEvents="none": bentuk dekoratif ini bisa menumpuk area badge nomor benda LAIN (mis. pegangan ini
          berdekatan dengan zona area mandi); tanpa ini klik di atasnya akan tertangkap di sini, bukan di badge. */}
      <g className="text-garisKontrol" stroke="currentColor" fill="white" strokeWidth={1.5} pointerEvents="none">
        <rect x={tangki.x} y={tangki.y} width={tangki.w} height={tangki.h} rx={2} />
        <ellipse cx={x} cy={y} rx={22} ry={27} />
      </g>
      {/* Pegangan (dan area mandi/ruang gerak di bawah) bukan benda fisik yang kelihatan bentuknya di foto asli —
          beda dari pintu/kloset/wastafel yang memang ada wujudnya — jadi cuma ditampilkan saat pil status yang
          cocok diklik (dikondisikan sama seperti badge-nya, `nomorPegangan !== undefined`), bukan selalu digambar netral. */}
      {nomorPegangan !== undefined && (
        <line {...garis} className={warnaPegangan} stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" />
      )}
      {nomorPegangan !== undefined && (
        <NomorBadge
          {...dorongKeDalam(x, y, dinding, 43)}
          nomor={nomorPegangan}
          warna={warnaPegangan}
          latar={latarPegangan}
          id="pegangan"
          terbuka={terbukaId === "pegangan"}
          onToggle={() => onToggleId("pegangan")}
        />
      )}
    </g>
  );
}

/** Wastafel menempel dinding: konter + keran, dengan ruang kosong di depannya untuk kursi roda. */
function Wastafel({
  letak,
  warna,
  latar,
  nomor,
  terbukaId,
  onToggleId,
}: {
  letak: Letak;
  warna: string;
  latar: string;
  nomor?: number;
  terbukaId: string | null;
  onToggleId: (id: string) => void;
}) {
  const { x, y, dinding } = titikDinding(letak);
  const kotak =
    dinding === "kiri"
      ? { x: x - 33, y: y - 25, w: 36, h: 50 }
      : dinding === "kanan"
        ? { x: x - 3, y: y - 25, w: 36, h: 50 }
        : dinding === "depan"
          ? { x: x - 25, y: y - 3, w: 50, h: 36 }
          : { x: x - 25, y: y - 33, w: 50, h: 36 };
  return (
    <g>
      <g className={warna} stroke="currentColor" fill="white" strokeWidth={1.5} pointerEvents="none">
        <rect x={kotak.x} y={kotak.y} width={kotak.w} height={kotak.h} rx={4} />
      </g>
      {/* Keran digambar sebagai bentuk tampak atas (badan + ujung cerat), konsisten dengan gaya gambar benda lain
          (garis+isian, bukan ikon generik) — dibuat netral (bukan warna status) supaya tidak kelihatan seperti
          badge nomor kedua di sebelahnya. */}
      <g className="text-garisKontrol" stroke="currentColor" fill="white" strokeWidth={1} pointerEvents="none">
        <rect x={x - 1.5} y={y - 4} width={3} height={6} rx={1.5} />
        <circle cx={x} cy={y + 3} r={1.5} />
      </g>
      {nomor !== undefined && (
        <NomorBadge
          {...dorongKeDalam(x, y, dinding, 24)}
          nomor={nomor}
          warna={warna}
          latar={latar}
          id="wastafel"
          terbuka={terbukaId === "wastafel"}
          onToggle={() => onToggleId("wastafel")}
        />
      )}
    </g>
  );
}

/** Zona shower memanjang sepanjang dinding (bukan satu titik): diarsir, dengan tanda shower dan keran. */
function AreaMandi({
  letak,
  warna,
  latarAreaMandi,
  warnaJangkauan,
  latarJangkauan,
  nomorAreaMandi,
  nomorJangkauan,
  terbukaId,
  onToggleId,
}: {
  letak: Letak;
  warna: string;
  latarAreaMandi: string;
  warnaJangkauan: string;
  latarJangkauan: string;
  nomorAreaMandi?: number;
  nomorJangkauan?: number;
  terbukaId: string | null;
  onToggleId: (id: string) => void;
}) {
  const { x, y, dinding } = titikDinding(letak);
  const panjangZona = 150;
  const tebalZona = 72;
  // Jarak aman dari dua ujung dinding: benda lain (kloset/wastafel di dinding belakang, pintu di dinding depan) bisa
  // ada di pojok seberang dinding ini, jadi zona tidak boleh digambar sampai mepet pojok — nanti malah menabraknya.
  const JARAK_POJOK_BELAKANG = 65;
  const JARAK_POJOK_DEPAN = 35;
  const zona =
    dinding === "kiri"
      ? {
          x: PAD,
          y: Math.max(PAD + JARAK_POJOK_BELAKANG, Math.min(H - PAD - JARAK_POJOK_DEPAN - panjangZona, y - panjangZona / 2)),
          w: tebalZona,
          h: panjangZona,
        }
      : dinding === "kanan"
        ? {
            x: W - PAD - tebalZona,
            y: Math.max(PAD + JARAK_POJOK_BELAKANG, Math.min(H - PAD - JARAK_POJOK_DEPAN - panjangZona, y - panjangZona / 2)),
            w: tebalZona,
            h: panjangZona,
          }
        : dinding === "depan"
          ? { x: Math.max(PAD, Math.min(W - PAD - panjangZona, x - panjangZona / 2)), y: H - PAD - tebalZona, w: panjangZona, h: tebalZona }
          : { x: Math.max(PAD, Math.min(W - PAD - panjangZona, x - panjangZona / 2)), y: PAD, w: panjangZona, h: tebalZona };
  const idArsir = `arsir-${dinding}`;
  const tengahZona = { x: zona.x + zona.w / 2, y: zona.y + zona.h / 2 };
  // Badge nomor area mandi diletakkan di ujung zona yang dekat pintu (bukan dekat dinding belakang), supaya tidak
  // menumpuk dengan badge pegangan — kloset (dan pegangannya) biasanya ada di ujung zona yang dekat dinding belakang.
  const sudutAreaMandi =
    dinding === "kiri" || dinding === "kanan" ? { x: tengahZona.x, y: zona.y + zona.h - 18 } : { x: zona.x + zona.w - 18, y: tengahZona.y };
  // Gambar kepala shower digeser ke tempat badge "jangkauan" dulu berada (bukan tengah zona) — badge sendiri
  // dipindah ke tengah zona (lihat di bawah) supaya keduanya tertukar posisi sesuai permintaan.
  // Sisi zona yang menempel dinding sungguhan (dipakai supaya ujung pipa pas di garis dinding, tidak kelebihan/kurang).
  const sisiDinding = dinding === "kiri" ? zona.x : dinding === "kanan" ? zona.x + zona.w : dinding === "depan" ? zona.y + zona.h : zona.y;
  const JARI_SHOWER = 10;
  const PANJANG_PIPA = 8;
  const JARAK_PUSAT_SHOWER = JARI_SHOWER + PANJANG_PIPA; // jarak pusat kepala shower dari dinding
  const letakShower =
    dinding === "kiri"
      ? { x: sisiDinding + JARAK_PUSAT_SHOWER, y: tengahZona.y }
      : dinding === "kanan"
        ? { x: sisiDinding - JARAK_PUSAT_SHOWER, y: tengahZona.y }
        : dinding === "depan"
          ? { x: tengahZona.x, y: sisiDinding - JARAK_PUSAT_SHOWER }
          : { x: tengahZona.x, y: sisiDinding + JARAK_PUSAT_SHOWER };
  // Ujung pipa dibuat PERSIS di garis dinding (bukan geser sejauh jarak tetap dari pusat kepala shower) — supaya
  // tidak pernah kelebihan keluar garis dinding, berapa pun radius/panjang pipa yang dipakai di atas.
  const ujungPipa = dinding === "kiri" || dinding === "kanan" ? { x: sisiDinding, y: letakShower.y } : { x: letakShower.x, y: sisiDinding };
  return (
    <g>
      {/* Zona shower (rect+arsir) dan jangkauan (lingkaran+ikon tangan) bukan benda fisik yang kelihatan bentuknya
          di foto asli — beda dari pintu/kloset/wastafel yang memang ada wujudnya di foto — jadi cuma digambar saat
          pil status yang cocok diklik (dikondisikan sama seperti badge-nya masing-masing), bukan selalu tampil netral. */}
      {nomorAreaMandi !== undefined && (
        <>
          <defs>
            <pattern id={idArsir} width={6} height={6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1={0} y1={0} x2={0} y2={6} stroke="currentColor" strokeWidth={1} />
            </pattern>
          </defs>
          <g className={warna} stroke="currentColor" fill="none" strokeWidth={1.5} pointerEvents="none">
            <rect x={zona.x} y={zona.y} width={zona.w} height={zona.h} rx={3} />
            {/* Rect arsir ini fill-nya pattern (bukan "none"), jadi tanpa pointerEvents="none" seluruh kotaknya tetap
                "padat" untuk hit-testing walau terlihat transparan — ini akar masalah klik badge pegangan kloset
                tertangkap di sini padahal secara visual area ini translusen. */}
            <rect x={zona.x} y={zona.y} width={zona.w} height={zona.h} rx={3} fill={`url(#${idArsir})`} opacity={0.5} />
            <circle cx={tengahZona.x} cy={tengahZona.y} r={3} fill="currentColor" />
          </g>
        </>
      )}
      {nomorJangkauan !== undefined && (
        // Kepala shower digambar tampak atas: lingkaran lubang semprot (diperbesar + lebih rapat supaya tidak
        // mirip lubang pembuangan lantai) PLUS lengan pipa pendek ke arah dinding — pembeda utama dari lubang
        // pembuangan, yang tidak punya pipa. Posisinya ditukar dengan badge nomornya (dulu di sini), supaya badge
        // tetap di tengah zona (titik paling lapang) dan gambar shower sendiri yang digeser ke tepi.
        <g className={warnaJangkauan} stroke="currentColor" fill="white" strokeWidth={1.5} pointerEvents="none">
          <line x1={letakShower.x} y1={letakShower.y} x2={ujungPipa.x} y2={ujungPipa.y} strokeWidth={3} strokeLinecap="round" />
          <circle cx={letakShower.x} cy={letakShower.y} r={JARI_SHOWER} />
          <g fill="currentColor" stroke="none">
            {[
              [0, 0],
              [-4, -4],
              [4, -4],
              [-4, 4],
              [4, 4],
              [0, -5.5],
              [0, 5.5],
            ].map(([dx, dy]) => (
              <circle key={`${dx}-${dy}`} cx={letakShower.x + dx} cy={letakShower.y + dy} r={1.1} />
            ))}
          </g>
        </g>
      )}
      {nomorAreaMandi !== undefined && (
        <NomorBadge
          {...sudutAreaMandi}
          nomor={nomorAreaMandi}
          warna={warna}
          latar={latarAreaMandi}
          id="area_mandi"
          terbuka={terbukaId === "area_mandi"}
          onToggle={() => onToggleId("area_mandi")}
        />
      )}
      {nomorJangkauan !== undefined && (
        // Digeser lebih jauh ke ruangan (menjauhi dinding) dari tengah zona, supaya tidak mepet dengan gambar kepala
        // shower yang digambar dekat dinding (lihat `letakShower`) — jaraknya dibuat lebih dari jumlah radius keduanya.
        <NomorBadge
          {...dorongKeDalam(tengahZona.x, tengahZona.y, dinding, 9)}
          nomor={nomorJangkauan}
          warna={warnaJangkauan}
          latar={latarJangkauan}
          id="jangkauan"
          terbuka={terbukaId === "jangkauan"}
          onToggle={() => onToggleId("jangkauan")}
        />
      )}
    </g>
  );
}

/** Denah tampak atas: posisi benda dari perkiraan AI (atau tata letak bawaan), bukan ukuran—hanya arah menempel dinding. */
export function DenahKamarMandi({
  temuan,
  objek,
  filter,
  onUbahFilter,
  children,
}: {
  temuan: Record<string, StatusItem>;
  objek: Record<ObjekDenah, PosisiObjek>;
  /** Status yang sedang aktif di tab filter — dikendalikan dari pemanggil (bukan state lokal) supaya "Rincian per
   *  hal" di PindaiFoto.tsx bisa ikut berganti isi mengikuti tab yang sama, bukan tab terpisah yang tidak nyambung. */
  filter: StatusItem;
  onUbahFilter: (s: StatusItem) => void;
  /** "Rincian per indikator" dari PindaiFoto.tsx, dirender di dalam kontainer kartu yang sama dengan denah+toggle —
   *  supaya isi tab (denah dan rinciannya) terlihat sebagai satu kesatuan, bukan dua kartu terpisah. */
  children?: ReactNode;
}) {
  const status = (id: string) => temuan[id] ?? "tidak_jelas";
  const NOMOR_ITEM = nomorItemHasil(ID_ITEM, temuan);
  const letak = (id: ObjekDenah): Letak => {
    const o = objek[id];
    return o.dinding === "tidak_terlihat" ? POSISI_BAWAAN[id] : { dinding: o.dinding, posisi: o.posisi };
  };

  // Denah difilter per status (pil di atas): hanya hal yang cocok status-nya yang diberi warna+nomor; sisanya
  // digambar redup tanpa nomor, supaya tiap tab fokus ke satu kategori tanpa kehilangan konteks letak ruangan.
  const cocok = (id: string) => status(id) === filter;
  // Objek yang tidak cocok filter tetap digambar jelas (warna netral), bukan diredupkan nyaris transparan — supaya
  // tetap terlihat bentuk dan letak ruangan sepenuhnya di tiap tab, hanya warna status+nomor yang berubah mengikuti filter.
  const warna = (id: string) => (cocok(id) ? WARNA_GARIS[status(id)] : "text-garisKontrol");
  const latar = (id: string) => (cocok(id) ? LATAR_BADGE[status(id)] : "fill-white");
  const nomor = (id: string): number | undefined => (cocok(id) ? NOMOR_ITEM[id] : undefined);
  const nomorRuang = nomor("ruang");
  const nomorLantai = nomor("lantai");

  // Hanya satu badge yang popovernya boleh terbuka dalam satu waktu (diketuk langsung di denah) — dua popover yang
  // terbuka bersamaan gampang bertabrakan di ruang SVG sekecil ini, apalagi sekarang user bisa mengoreksi banyak hal
  // jadi berstatus sama lewat "Rincian per indikator" sehingga satu tab bisa berisi sampai 7 badge sekaligus.
  const [terbukaId, setTerbukaId] = useState<string | null>(null);
  const onToggleId = (id: string) => setTerbukaId((t) => (t === id ? null : id));

  // Gaya tampilan denah: "atas" (bawaan) atau "isometrik" — keduanya menggambar temuan/posisi yang sama persis
  // (lihat `denahSvgIso`, yang memproyeksikan titik yang sama dari `letak`/`titikDinding`), cuma bentuk gambarnya
  // yang beda. Dipilih sekali per sesi (bukan disimpan), konsisten dengan fitur Pindai lain yang tidak menyimpan state.
  const [tampilan, setTampilan] = useState<"atas" | "isometrik">("atas");
  const batasIso = { kiri: 8, kanan: ISO_VW - 8, atas: 8 };

  // Dipakai dua kali dengan ukuran berbeda (inline di kartu, dan lebih besar di popup "perbesar denah") — isinya
  // sama persis, cuma lebar maksimumnya yang beda, supaya tidak ada dua salinan markup yang bisa tidak sinkron.
  const denahSvg = (ukuran: string) => (
    <svg viewBox={`0 0 ${W} ${H}`} className={`mx-auto text-garisKontrol ${ukuran}`} aria-hidden="true" focusable="false">
      <rect
        x={PAD / 2}
        y={PAD / 2}
        width={W - PAD}
        height={H - PAD}
        rx={6}
        className="fill-permukaan"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Area lantai ditandai garis putus-putus (sama seperti lingkaran "ruang gerak" dan zona "area mandi") —
          bukan benda fisik yang kelihatan garis batasnya di foto asli, jadi cuma digambar saat pil status "lantai"
          diklik (`nomorLantai !== undefined`), sama seperti overlay lain; tekstur titik-titik di bawah ini tetap
          selalu tampil (representasi lantai itu sendiri yang memang selalu ada wujudnya). */}
      {nomorLantai !== undefined && (
        <rect
          x={PAD + 4}
          y={PAD + 4}
          width={W - 2 * PAD - 8}
          height={H - 2 * PAD - 8}
          rx={4}
          fill="none"
          className={warna("lantai")}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          opacity={0.6}
        />
      )}
      {Array.from({ length: 10 }, (_, baris) =>
        Array.from({ length: 7 }, (_, kolom) => (
          <circle
            key={`${baris}-${kolom}`}
            cx={PAD + 14 + kolom * 26}
            cy={PAD + 14 + baris * 28}
            r={1.3}
            className={warna("lantai")}
            fill="currentColor"
            opacity={0.45}
          />
        )),
      )}
      {/* Ruang putar kursi roda bukan benda fisik yang kelihatan bentuknya di foto asli (beda dari pintu/wastafel
          yang memang ada wujudnya) — jadi lingkarannya cuma digambar saat pil status "ruang" diklik, sama seperti
          badge-nya (`nomorRuang !== undefined`), bukan selalu tampil netral. */}
      {nomorRuang !== undefined && (
        <circle
          cx={W / 2}
          cy={H / 2}
          r={68}
          fill="none"
          className={warna("ruang")}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          opacity={0.6}
        />
      )}
      {/* "Lantai" mewakili seluruh ruangan (teksturnya tetap fisik, terlihat di foto apa pun), jadi tetap selalu
          tergambar; badge nomornya saja yang cuma muncul kalau status-nya cocok filter. */}
      {nomorRuang !== undefined && (
        <NomorBadge
          x={W / 2}
          y={H / 2}
          nomor={nomorRuang}
          warna={warna("ruang")}
          latar={latar("ruang")}
          id="ruang"
          terbuka={terbukaId === "ruang"}
          onToggle={() => onToggleId("ruang")}
        />
      )}
      {nomorLantai !== undefined && (
        // Digeser sedikit ke atas dari tengah persis (bukan W/2,H/2) supaya tidak menumpuk badge "ruang" kalau
        // keduanya kebetulan tampil bersamaan (status sama, cocok filter yang sama) — jaraknya (45) lebih jauh
        // dari jumlah radius kedua badge, jadi selalu terpisah jelas.
        <NomorBadge
          x={W / 2}
          y={H / 2 - 45}
          nomor={nomorLantai}
          warna={warna("lantai")}
          latar={latar("lantai")}
          id="lantai"
          terbuka={terbukaId === "lantai"}
          onToggle={() => onToggleId("lantai")}
        />
      )}

      <Pintu
        letak={letak("pintu")}
        warna={warna("pintu")}
        latar={latar("pintu")}
        nomor={nomor("pintu")}
        terbukaId={terbukaId}
        onToggleId={onToggleId}
      />
      <Kloset
        letak={letak("kloset")}
        warnaPegangan={warna("pegangan")}
        latarPegangan={latar("pegangan")}
        nomorPegangan={nomor("pegangan")}
        terbukaId={terbukaId}
        onToggleId={onToggleId}
      />
      <Wastafel
        letak={letak("wastafel")}
        warna={warna("wastafel")}
        latar={latar("wastafel")}
        nomor={nomor("wastafel")}
        terbukaId={terbukaId}
        onToggleId={onToggleId}
      />
      <AreaMandi
        letak={letak("area_mandi")}
        warna={warna("area_mandi")}
        latarAreaMandi={latar("area_mandi")}
        warnaJangkauan={warna("jangkauan")}
        latarJangkauan={latar("jangkauan")}
        nomorAreaMandi={nomor("area_mandi")}
        nomorJangkauan={nomor("jangkauan")}
        terbukaId={terbukaId}
        onToggleId={onToggleId}
      />
    </svg>
  );

  // Gaya isometrik: proyeksi 3D sederhana (lihat `iso`/`isoKotak`/`isoLingkaran`) dari koordinat tampak-atas yang
  // sama persis — jejak tiap benda digambar sebagai kotak/jajaran genjang rata lantai, bukan bentuk detail seperti
  // di tampak atas (kloset/wastafel bukan digambar presisi) - penyederhanaan ini sengaja, supaya tetap ringan dan
  // mudah dirawat, sementara semua interaksi (badge bisa diketuk, ikut tab status, posisi ikut koreksi user) tetap
  // identik dengan tampak atas karena sumber datanya (`letak`, `warna`, `latar`, `nomor`, `terbukaId`) sama persis.
  const denahSvgIso = (ukuran: string) => {
    const lantai = [iso(0, 0), iso(W, 0), iso(W, H), iso(0, H)].map((p) => `${p.x},${p.y}`).join(" ");
    const dindingBelakang = [iso(0, 0, 0), iso(W, 0, 0), iso(W, 0, ISO_TINGGI_DINDING), iso(0, 0, ISO_TINGGI_DINDING)]
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
    const dindingKanan = [iso(W, 0, 0), iso(W, H, 0), iso(W, H, ISO_TINGGI_DINDING), iso(W, 0, ISO_TINGGI_DINDING)]
      .map((p) => `${p.x},${p.y}`)
      .join(" ");

    // Titik asli (sebelum digeser `dorongKeDalam`) dipakai untuk jejak benda di lantai; titik yang sudah digeser ke
    // arah ruangan dipakai untuk badge-nya — persis seperti pembagian x/y di tampak atas (lihat `Pintu`/`Kloset`/dst).
    const pintu = titikDinding(letak("pintu"));
    const pintuBadge = dorongKeDalam(pintu.x, pintu.y, pintu.dinding, 34);
    const kloset = titikDinding(letak("kloset"));
    const peganganBadge = dorongKeDalam(kloset.x, kloset.y, kloset.dinding, 43);
    const wastafel = titikDinding(letak("wastafel"));
    const wastafelBadge = dorongKeDalam(wastafel.x, wastafel.y, wastafel.dinding, 24);
    const areaMandi = titikDinding(letak("area_mandi"));
    const areaMandiBadge = dorongKeDalam(areaMandi.x, areaMandi.y, areaMandi.dinding, 45);
    const jangkauanBadge = dorongKeDalam(areaMandi.x, areaMandi.y, areaMandi.dinding, 20);
    // Jejak area mandi memanjang sepanjang dindingnya (bukan kotak persegi), sama seperti zona di tampak atas.
    const sepanjangDinding = areaMandi.dinding === "kiri" || areaMandi.dinding === "kanan";
    // Dipakai untuk menentukan orientasi balok 3D tiap benda (lebih panjang sepanjang dinding atau menjorok ke
    // ruangan) — dicek per benda sendiri-sendiri karena bisa saja berbeda dinding satu sama lain.
    const sejajar = (d: DindingDenah) => d === "kiri" || d === "kanan";
    // Daun pintu digambar rata dinding (bukan menjorok seperti jejak benda lain) — `keDinding` memaksa koordinat
    // tegak lurusnya persis di garis dinding, lalu didorong sedikit ke ruangan supaya tidak menyatu dengan gambar
    // dindingnya sendiri.
    const pintuDiDinding = keDinding(pintu.x, pintu.y, pintu.dinding);
    const pintuPanel = dorongKeDalam(pintuDiDinding.x, pintuDiDinding.y, pintu.dinding, 3);

    const badgeIso = (titik: { x: number; y: number }, id: string, nomorId: number | undefined, warnaId: string, latarId: string) =>
      nomorId !== undefined && (
        <NomorBadge
          {...iso(titik.x, titik.y, 2)}
          nomor={nomorId}
          warna={warnaId}
          latar={latarId}
          id={id}
          terbuka={terbukaId === id}
          onToggle={() => onToggleId(id)}
          batas={batasIso}
        />
      );

    return (
      <svg viewBox={`0 0 ${ISO_VW} ${ISO_VH}`} className={`mx-auto text-garisKontrol ${ukuran}`} aria-hidden="true" focusable="false">
        <polygon points={dindingBelakang} className="fill-white" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
        <polygon points={dindingKanan} className="fill-permukaan" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
        <polygon points={lantai} fill="white" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
        {Array.from({ length: 10 }, (_, baris) =>
          Array.from({ length: 7 }, (_, kolom) => {
            const p = iso(PAD + 14 + kolom * 26, PAD + 14 + baris * 28);
            return (
              <circle key={`${baris}-${kolom}`} cx={p.x} cy={p.y} r={1.3} className={warna("lantai")} fill="currentColor" opacity={0.45} />
            );
          }),
        )}
        {nomorRuang !== undefined && (
          <polygon
            points={isoLingkaran(W / 2, H / 2, 68)}
            fill="none"
            className={warna("ruang")}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            opacity={0.6}
          />
        )}
        {nomor("area_mandi") !== undefined && (
          <polygon
            points={sepanjangDinding ? isoPersegi(areaMandi.x, areaMandi.y, 24, 55, 1) : isoPersegi(areaMandi.x, areaMandi.y, 55, 24, 1)}
            className={warna("area_mandi")}
            fill="currentColor"
            fillOpacity={0.12}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )}
        {/* Tiga benda fisik (pintu, kloset, wastafel) digambar sebagai balok 3D sungguhan (lihat `ObjekIso`) —
            beda dari area mandi/ruang gerak di atas, yang jejaknya datar karena memang bukan benda fisik yang
            kelihatan wujudnya di foto (sama seperti perlakuannya di tampak atas). */}
        <ObjekIso
          x={pintuPanel.x}
          y={pintuPanel.y}
          rx={sejajar(pintu.dinding) ? 2.5 : 15}
          ry={sejajar(pintu.dinding) ? 15 : 2.5}
          tinggi={70}
          kelas={warna("pintu")}
        />
        {/* Kloset digambar dua balok (bukan satu kotak polos) supaya kelihatan seperti kloset sungguhan, bukan
            kotak abstrak: mangkuk (rendah, menjorok ke ruangan) + tangki (lebih sempit tapi lebih tinggi, menempel
            ke arah dinding) — sama seperti tampak atas yang juga membedakan `tangki` dari `mangkuk`. */}
        <ObjekIso
          x={kloset.x}
          y={kloset.y}
          rx={sejajar(kloset.dinding) ? 17 : 13}
          ry={sejajar(kloset.dinding) ? 13 : 17}
          tinggi={24}
          kelas="text-garisKontrol"
        />
        <ObjekIso
          {...dorongKeDalam(kloset.x, kloset.y, kloset.dinding, -8)}
          rx={sejajar(kloset.dinding) ? 11 : 6}
          ry={sejajar(kloset.dinding) ? 6 : 11}
          tinggi={44}
          kelas="text-garisKontrol"
        />
        {/* Wastafel: konter (lebar, rendah) + keran kecil menonjol di atasnya dekat dinding — satu kotak polos
            sendirian terlihat terlalu pipih untuk terbaca sebagai benda 3D, keran ini memberi aksen tinggi. */}
        <ObjekIso
          x={wastafel.x}
          y={wastafel.y}
          rx={sejajar(wastafel.dinding) ? 8 : 16}
          ry={sejajar(wastafel.dinding) ? 16 : 8}
          tinggi={26}
          kelas={warna("wastafel")}
        />
        <ObjekIso
          {...dorongKeDalam(wastafel.x, wastafel.y, wastafel.dinding, -4)}
          rx={3}
          ry={3}
          tinggi={12}
          z={26}
          kelas={warna("wastafel")}
        />
        {badgeIso({ x: W / 2, y: H / 2 }, "ruang", nomorRuang, warna("ruang"), latar("ruang"))}
        {badgeIso({ x: W / 2, y: H / 2 - 45 }, "lantai", nomorLantai, warna("lantai"), latar("lantai"))}
        {badgeIso(pintuBadge, "pintu", nomor("pintu"), warna("pintu"), latar("pintu"))}
        {badgeIso(peganganBadge, "pegangan", nomor("pegangan"), warna("pegangan"), latar("pegangan"))}
        {badgeIso(wastafelBadge, "wastafel", nomor("wastafel"), warna("wastafel"), latar("wastafel"))}
        {badgeIso(areaMandiBadge, "area_mandi", nomor("area_mandi"), warna("area_mandi"), latar("area_mandi"))}
        {badgeIso(jangkauanBadge, "jangkauan", nomor("jangkauan"), warna("jangkauan"), latar("jangkauan"))}
      </svg>
    );
  };

  // Popup "perbesar denah": gambar yang sama persis ditampilkan lebih besar, untuk yang kesulitan melihat denah
  // kecil di dalam kartu (mis. layar sempit atau kebutuhan aksesibilitas visual) — bukan gambar lain, cuma skala.
  const [perbesar, setPerbesar] = useState(false);
  useEffect(() => {
    if (!perbesar) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPerbesar(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [perbesar]);

  return (
    // Tanpa kontainer kartu (border/bg/shadow) atau margin luar: dipakai satu-satunya di layar hasil Pindai, yang
    // mengatur jarak antar-bagian lewat `gap-bagian` pada kontainer pemanggil (lihat PindaiFoto.tsx).
    <figure>
      <h2 className="mb-3 text-judulKartu">{t.denahJudul}</h2>

      <div role="radiogroup" aria-label={t.denahFilterLabel} className="mb-3 flex gap-1 rounded-kartu bg-permukaan p-1">
        {STATUS_ITEM.map((s) => (
          <PilihanPil
            key={s}
            nama="denah-filter"
            aktif={filter === s}
            onUbah={() => onUbahFilter(s)}
            gaya="tab"
            label={
              <span className="flex items-center gap-1.5">
                <span className={`h-3 w-3 shrink-0 rounded-full border-2 ${GAYA_BADGE[s]}`} />
                {t.status[s]}
              </span>
            }
          />
        ))}
      </div>

      {/* Gaya tampilan (atas/isometrik): pil terpisah dari tab status di atas — keduanya sama-sama mengatur denah
          tapi tidak saling terkait (status menentukan APA yang disorot, gaya menentukan cara gambarnya). */}
      <div role="radiogroup" aria-label={t.denahTampilLabel} className="mb-3 flex gap-1 rounded-kartu bg-permukaan p-1">
        <PilihanPil
          nama="denah-tampilan"
          aktif={tampilan === "atas"}
          onUbah={() => setTampilan("atas")}
          gaya="tab"
          label={t.denahTampilAtas}
        />
        <PilihanPil
          nama="denah-tampilan"
          aktif={tampilan === "isometrik"}
          onUbah={() => setTampilan("isometrik")}
          gaya="tab"
          label={t.denahTampilIsometrik}
        />
      </div>

      {/* Gambar denah dan segmen di bawahnya disimpan dalam satu kontainer kartu (judul dan tab filter di atas
          tetap di luar, langsung di latar halaman), dengan pembatas selebar kartu di antara keduanya. */}
      <div className="relative rounded-kartu border border-garis/70 bg-white p-4 shadow-kartu">
        {/* Tombol perbesar: pojok kanan atas kartu, di luar area svg (yang `aria-hidden`) supaya tetap bisa dicapai
            pembaca layar dan tidak pernah tertimpa badge nomor di dalam denah. */}
        <button
          type="button"
          onClick={() => setPerbesar(true)}
          aria-label={t.denahPerbesar}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-garis/70 bg-white text-redup shadow-kartu"
        >
          <ZoomIn className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
        </button>

        {tampilan === "atas" ? denahSvg("w-full max-w-[220px]") : denahSvgIso("w-full max-w-[280px]")}

        {/* Catatan posisi/skala dan petunjuk ketuk nomor digabung satu badge info (bukan teks polos terpisah) —
            keduanya sama-sama konteks tambahan tentang cara membaca denah, bukan bagian dari kontennya sendiri.
            Warna "info" (biru) dipakai, bukan "permukaan" (abu-teal) yang warnanya terlalu mirip latar lantai di
            denah tepat di atasnya — biru membuat badge ini jelas beda, bukan seperti sambungan dari gambar denah. */}
        <div role="note" className="mt-3 flex items-start gap-2 rounded-tombol bg-info-muda p-3 text-kecil text-info">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
          <div className="flex flex-col gap-1">
            <p>{t.denahCatatan}</p>
            <p>{t.denahPetunjukNomor}</p>
          </div>
        </div>

        {children && (
          <>
            {/* Pembatas selebar kartu yang sama seperti di atas, memisahkan denah dari "Rincian per indikator" di
                bawahnya — keduanya tetap satu kartu yang sama, mengikuti tab status yang aktif. */}
            <div className="-mx-4 my-3 border-t border-garis" />
            {children}
          </>
        )}
      </div>

      {perbesar && (
        // Popup sederhana: backdrop gelap + kartu putih berisi svg yang sama, cuma lebih besar. Menutup lewat
        // tombol X, tombol Escape (lihat useEffect di atas), atau ketuk area backdrop di luar kartu.
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.denahJudul}
          className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/70 p-4"
          onClick={() => setPerbesar(false)}
        >
          <div
            className="relative max-h-full w-full max-w-sm overflow-auto rounded-kartu bg-white p-4 shadow-angkat"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPerbesar(false)}
              aria-label={t.denahTutupPerbesar}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-garis/70 bg-white text-redup"
            >
              <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
            </button>
            {tampilan === "atas" ? denahSvg("w-full max-w-none") : denahSvgIso("w-full max-w-none")}
          </div>
        </div>
      )}
    </figure>
  );
}
