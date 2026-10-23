import { Eye, EyeOff, Info, RotateCw, X, ZoomIn } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { PilihanPil } from "./Pilihan";
import { konten } from "../domain/content";
import {
  nomorItemHasil,
  OBJEK_DENAH,
  POSISI_BAWAAN,
  STATUS_ITEM,
  type JenisKloset,
  type LetakDenah,
  type ObjekDenah,
  type PosisiObjek,
  type StatusItem,
  type VarianPintu,
  type VarianShower,
} from "../domain/pindai";
import { dorongKeDalam, H, PAD, titikDinding, W } from "../domain/denahGeometri";
import { UKURAN_AREA_MANDI, UKURAN_KLOSET, UKURAN_PINTU, UKURAN_WASTAFEL } from "../domain/objekUkuran";
import { PratinjauIsoTiga } from "./PratinjauIsoTiga";
import { bendaTersembunyi, PratinjauRuangIso3D } from "./PratinjauRuangIso3D";

// Prototipe Milestone 3 (lihat DECISIONS.md): kalau aktif, tab Isometrik menampilkan model 3D (Three.js) alih-alih
// SVG tangan, KHUSUS untuk dibandingkan visual — bukan jalur produksi, belum ada posisi/rotasi/status sungguhan.

// Galeri 4 benda berdampingan (bukan satu per satu) supaya keselarasan gaya antar sumber (Quaternius untuk
// kloset/wastafel/pintu, Kenney untuk shower — Quaternius tidak punya model shower, lihat DECISIONS.md) bisa
// dinilai langsung, bukan ditebak dari pratinjau terpisah di poly.pizza.
// Diekspor (bukan dipakai di file ini lagi sejak Milestone 4) supaya tetap bisa dipakai untuk cek kualitas
// bentuk satu-satu per benda di masa depan — lihat PratinjauRuangIso3D untuk tampilan utama tab Isometrik 3D.
export function GaleriIso3D({ kelas = "" }: { kelas?: string }) {
  const benda = [
    { nama: "Pintu", src: "/model/pintu/quaternius-pintu.glb" },
    { nama: "Kloset", src: "/model/toilet-quaternius/quaternius-toilet.glb" },
    { nama: "Wastafel", src: "/model/wastafel/quaternius-wastafel.glb" },
    { nama: "Shower", src: "/model/shower/poly-google-shower-head.glb" },
  ];
  return (
    <div className={`grid grid-cols-2 gap-2 ${kelas}`}>
      {benda.map((b) => (
        <div key={b.nama} className="flex flex-col items-center rounded-kartu border border-garis/70 bg-white p-1">
          <PratinjauIsoTiga src={b.src} kelas="h-32 w-full" />
          <span className="pb-1 text-kecil text-redup">{b.nama}</span>
        </div>
      ))}
    </div>
  );
}

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

// Tampilan isometrik cuma pernah bisa menggambar DUA dinding solid sekaligus (supaya isi ruangan tetap kelihatan
// — dinding lain akan menghalangi kamera). Hanya DUA sudut pandang yang dipakai (bukan empat/tiga seperti
// percobaan sebelumnya), meniru persis dua foto acuan yang diberikan pemilik produk: dinding "belakang" SELALU
// solid (itu dinding yang menghadap pengguna saat masuk — pintu ada di dinding "depan", yang karena itu selalu
// jadi sisi terbuka tempat kamera berada), dan dinding "kiri" ATAU "kanan" (tidak pernah keduanya) jadi dinding
// kedua yang solid, tergantung pengguna "berdiri" di sisi mana: pengguna di kiri menghadap kanan -> dinding kanan
// yang solid (benda di dinding kanan, mis. shower, tergambar menempel); pengguna di kanan menghadap kiri ->
// dinding kiri yang solid. Posisi benda (dari `letak`) TIDAK PERNAH berubah oleh sudut pandang ini — satu-satunya
// yang berubah adalah dinding mana yang digambar solid (lihat `PratinjauRuangIso3D`); tidak
// ada koordinat apa pun yang dibalik/direfleksikan.
type SudutPandang = { x: "kiri" | "kanan" };
const SUDUT_URUTAN: SudutPandang[] = [{ x: "kanan" }, { x: "kiri" }];
/** Fungsi murni: berapa banyak benda (pintu/kloset/wastafel/area_mandi) yang akan menempel dinding SOLID kalau
 *  sudut pandang ini dipakai (dinding "belakang" selalu dihitung solid, lihat komentar di atas) — dipakai untuk
 *  memilih sudut bawaan yang paling banyak "benar" tanpa perlu pengguna memutar manual dulu. */
function skorSudut(sudut: SudutPandang, letak: (id: ObjekDenah) => LetakDenah): number {
  return OBJEK_DENAH.reduce((skor, id) => {
    const dinding = letak(id).dinding;
    return skor + (dinding === "belakang" || dinding === sudut.x ? 1 : 0);
  }, 0);
}
/** Fungsi murni: sudut dengan skor tertinggi (dasi dipecahkan dengan urutan di SUDUT_URUTAN, supaya bawaan tetap
 *  stabil/dapat diprediksi, bukan berubah-ubah kalau skornya seri). */
function pilihSudutTerbaik(letak: (id: ObjekDenah) => LetakDenah): SudutPandang {
  let terbaik = SUDUT_URUTAN[0];
  let skorTerbaik = -1;
  for (const sudut of SUDUT_URUTAN) {
    const skor = skorSudut(sudut, letak);
    if (skor > skorTerbaik) {
      terbaik = sudut;
      skorTerbaik = skor;
    }
  }
  return terbaik;
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
   *  sendiri yang jauh lebih lebar, jadi mengirim batasnya sendiri di sini (lihat `PratinjauRuangIso3D`). */
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
  const { panjang } = UKURAN_PINTU;
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
  const { w: tangkiW, h: tangkiH } = UKURAN_KLOSET.tangki;
  const { rx: mangkukRx, ry: mangkukRy } = UKURAN_KLOSET.mangkuk;
  const tangki =
    dinding === "kiri"
      ? { x: x - 32, y: y - tangkiH / 2, w: tangkiW, h: tangkiH }
      : dinding === "kanan"
        ? { x: x + 12, y: y - tangkiH / 2, w: tangkiW, h: tangkiH }
        : dinding === "depan"
          ? { x: x - tangkiH / 2, y: y + 12, w: tangkiH, h: tangkiW }
          : { x: x - tangkiH / 2, y: y - 32, w: tangkiH, h: tangkiW };
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
        <ellipse cx={x} cy={y} rx={mangkukRx} ry={mangkukRy} />
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
  const { w: kotakW, h: kotakH } = UKURAN_WASTAFEL.kotak;
  const kotak =
    dinding === "kiri"
      ? { x: x - 33, y: y - kotakH / 2, w: kotakW, h: kotakH }
      : dinding === "kanan"
        ? { x: x - 3, y: y - kotakH / 2, w: kotakW, h: kotakH }
        : dinding === "depan"
          ? { x: x - kotakH / 2, y: y - 3, w: kotakH, h: kotakW }
          : { x: x - kotakH / 2, y: y - 33, w: kotakH, h: kotakW };
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
  const { panjangZona, tebalZona, jarakPojokBelakang: JARAK_POJOK_BELAKANG, jarakPojokDepan: JARAK_POJOK_DEPAN } = UKURAN_AREA_MANDI;
  // Jarak aman dari dua ujung dinding: benda lain (kloset/wastafel di dinding belakang, pintu di dinding depan) bisa
  // ada di pojok seberang dinding ini, jadi zona tidak boleh digambar sampai mepet pojok — nanti malah menabraknya.
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
  const { jariShower: JARI_SHOWER, panjangPipa: PANJANG_PIPA } = UKURAN_AREA_MANDI;
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
  varianShower = "tidak_jelas",
  jenisKloset = "tidak_jelas",
  varianPintu = "tidak_jelas",
  filter,
  onUbahFilter,
  children,
}: {
  temuan: Record<string, StatusItem>;
  objek: Record<ObjekDenah, PosisiObjek>;
  /** Jenis shower yang digambar di tampilan isometrik 3D (dari hasil pindai atau pilihan pengguna). */
  varianShower?: VarianShower;
  /** Jenis kloset dan cara pintu membuka yang digambar di tampilan isometrik (hasil pindai). */
  jenisKloset?: JenisKloset;
  varianPintu?: VarianPintu;
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
  // (lihat `PratinjauRuangIso3D`, yang memakai `letak`/`titikDinding` yang sama), cuma bentuk gambarnya
  // yang beda. Dipilih sekali per sesi (bukan disimpan), konsisten dengan fitur Pindai lain yang tidak menyimpan state.
  const [tampilan, setTampilan] = useState<"atas" | "isometrik">("atas");

  // Sudut pandang isometrik (dinding mana yang digambar solid, lihat `SudutPandang` di atas): bawaan dipilih
  // otomatis dari data (`pilihSudutTerbaik`), supaya langsung benar untuk foto manapun tanpa pengguna harus
  // memutar dulu. `sudutManual` null berarti "masih ikut pilihan otomatis"; begitu pengguna menekan tombol putar,
  // pilihannya sendiri menang sampai direset (foto baru = `objek` berganti referensi). Direset LEWAT RENDER
  // (pola "adjusting state when a prop changes" React), bukan useEffect — supaya resetnya langsung kepakai di
  // render yang sama, tidak nunggu satu putaran render ekstra yang bisa kelihatan "kedap-kedip" sesaat.
  const [objekSebelumnya, setObjekSebelumnya] = useState(objek);
  const [sudutManual, setSudutManual] = useState<SudutPandang | null>(null);
  if (objek !== objekSebelumnya) {
    setObjekSebelumnya(objek);
    setSudutManual(null);
  }
  const sudutOtomatis = pilihSudutTerbaik(letak);
  const sudutAktif = sudutManual ?? sudutOtomatis;
  // Tampilan 3D menyembunyikan benda di dinding yang tidak digambar; tombol ini menampilkannya kembali.
  const [tampilkanTersembunyi, setTampilkanTersembunyi] = useState(false);
  const adaTersembunyi = bendaTersembunyi(letak, sudutAktif.x).length > 0;
  const putarSudut = (arah: 1 | -1) => {
    const sekarang = sudutManual ?? sudutOtomatis;
    const i = SUDUT_URUTAN.findIndex((s) => s.x === sekarang.x);
    const berikutnya = SUDUT_URUTAN[(i + arah + SUDUT_URUTAN.length) % SUDUT_URUTAN.length];
    setSudutManual(berikutnya);
  };

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
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-garis/70 bg-white text-redup shadow-kartu"
        >
          <ZoomIn className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
        </button>

        {/* Tombol putar: pojok KIRI atas kartu (bukan kanan, supaya tidak berdesakan dengan tombol perbesar) —
            cuma ada di tampilan isometrik, karena tampak-atas tidak punya "sisi dinding mana yang solid" untuk
            diputar. Hanya satu tombol: sudut pandang cuma
            ada dua (dinding samping kiri atau kanan), jadi tombol ini menggilir keduanya. */}
        {tampilan === "isometrik" && (
          <button
            type="button"
            onClick={() => putarSudut(1)}
            aria-label={t.denahPutar}
            className="absolute left-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-garis/70 bg-white text-redup shadow-kartu"
          >
            <RotateCw className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
          </button>
        )}
        {tampilan === "isometrik" && adaTersembunyi && (
          <button
            type="button"
            onClick={() => setTampilkanTersembunyi((v) => !v)}
            aria-pressed={tampilkanTersembunyi}
            aria-label={tampilkanTersembunyi ? t.denahSembunyikanLagi : t.denahTampilkanTersembunyi}
            className="absolute left-[3.75rem] top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-garis/70 bg-white text-redup shadow-kartu"
          >
            {tampilkanTersembunyi ? (
              <EyeOff className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
            )}
          </button>
        )}

        {tampilan === "atas" ? (
          denahSvg("w-full max-w-[220px]")
        ) : (
          <PratinjauRuangIso3D
            letak={letak}
            sudutAktif={sudutAktif}
            varianShower={varianShower}
            jenisKloset={jenisKloset}
            varianPintu={varianPintu}
            tampilkanSemua={tampilkanTersembunyi}
            kelas="aspect-[7/9] w-full max-w-[360px]"
          />
        )}

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
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-garis/70 bg-white text-redup"
            >
              <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
            </button>
            {/* Tombol putar juga ada di popup (bukan cuma kartu kecil) — sama persis, cuma di sini perlu
                pointerEvents eksplisit karena berada di dalam kartu yang menghentikan klik menembus ke backdrop. */}
            {tampilan === "isometrik" && (
              <button
                type="button"
                onClick={() => putarSudut(1)}
                aria-label={t.denahPutar}
                className="absolute left-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-garis/70 bg-white text-redup"
              >
                <RotateCw className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
              </button>
            )}
            {tampilan === "isometrik" && adaTersembunyi && (
              <button
                type="button"
                onClick={() => setTampilkanTersembunyi((v) => !v)}
                aria-pressed={tampilkanTersembunyi}
                aria-label={tampilkanTersembunyi ? t.denahSembunyikanLagi : t.denahTampilkanTersembunyi}
                className="absolute left-[3.75rem] top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-garis/70 bg-white text-redup"
              >
                {tampilkanTersembunyi ? (
                  <EyeOff className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
                ) : (
                  <Eye className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
                )}
              </button>
            )}
            {tampilan === "atas" ? (
              denahSvg("w-full max-w-none")
            ) : (
              <PratinjauRuangIso3D
                letak={letak}
                sudutAktif={sudutAktif}
                varianShower={varianShower}
                jenisKloset={jenisKloset}
                varianPintu={varianPintu}
                tampilkanSemua={tampilkanTersembunyi}
                kelas="aspect-[7/9] w-full max-h-[78vh] max-w-[480px]"
              />
            )}
          </div>
        </div>
      )}
    </figure>
  );
}
