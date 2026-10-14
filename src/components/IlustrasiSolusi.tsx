import type { ReactNode } from "react";
import { konten } from "../domain/content";
import type { Tingkat } from "../domain/konstanta";
import {
  Dinding,
  KlosetDepan,
  KursiRodaAtas,
  Kanvas,
  Larang,
  Panah,
  Pengguna,
  UkurMendatar,
  UkurTegak,
  angka,
  garisTinta,
} from "./GambarTeknis";

// Ilustrasi selebar panel untuk pilihan solusi. Dibuat bertahap, satu panduan demi satu panduan: panduan yang belum ada di
// daftar ini tidak menampilkan apa pun (kunci "idKartu:tingkat"). Gaya: petunjuk perabot hitam-putih (garis tinta tegas,
// isian putih, panah dan garis ukur), bahan gambarnya di GambarTeknis.tsx. Dekoratif; pengguna kursi roda digambar aktif.
// Angka hanya dari content/ui.json. Gambar berangka masuk daftar BERANGKA: "ada" = acuan umum ADA 2010, "kartu" = angka dari isi kartu.

const Bintik = ({ x, y, kolom, baris, jarak = 10 }: { x: number; y: number; kolom: number; baris: number; jarak?: number }) => (
  <g className="fill-tinta">
    {Array.from({ length: kolom * baris }, (_, i) => (
      <circle key={i} cx={x + (i % kolom) * jarak} cy={y + Math.floor(i / kolom) * jarak} r="1.800" />
    ))}
  </g>
);

const GAMBAR: Record<string, () => ReactNode> = {
  // Jaga lantai tetap kering dan bebas benda: ember dan botol dipindah ke rak, jalur kursi roda lapang.
  "bath-floor-slip:tanpa_biaya": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="330" y="0" width="12" height="138" className="fill-tinta" />
      <path d="M258 62H330M330 96L300 62" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <path d="M268 36h26l-4 26h-18z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <path d="M271 36q10-14 20 0" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <rect x="304" y="44" width="14" height="18" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="308" y="36" width="6" height="8" className="fill-white stroke-tinta" strokeWidth="3" />
      <Pengguna x={96} y={138} tangan={[16, -56]} />
      <path d="M166 112H224" {...garisTinta} strokeWidth="3" strokeDasharray="3 7" className="stroke-tinta" />
      <Panah x={236} y={112} arah={0} />
      <path
        d="M178 120l2.500 6 6 2.500-6 2.500-2.500 6-2.500-6-6-2.500 6-2.500zM216 124l2 4.500 4.500 2-4.500 2-2 4.500-2-4.500-4.500-2 4.500-2z"
        className="fill-tinta"
      />
    </Kanvas>
  ),
  // Pasang keset atau stiker anti-slip di area berpindah (samping kloset) dan area mandi, tampak dari atas.
  "bath-floor-slip:alat_tanpa_bongkar": () => (
    <Kanvas>
      <rect x="24" y="8" width="312" height="134" fill="none" strokeWidth="6" className="stroke-tinta" />
      <rect x="44" y="16" width="34" height="12" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="61" cy="46" rx="15" ry="18" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="61" cy="48" rx="8" ry="10" fill="none" strokeWidth="2" className="stroke-tinta" />
      <rect x="94" y="20" width="64" height="50" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <Bintik x={106} y={32} kolom={6} baris={4} jarak={9} />
      <rect
        x="226"
        y="18"
        width="100"
        height="116"
        rx="4"
        fill="none"
        strokeWidth="2"
        strokeDasharray="5 5"
        className="stroke-tinta"
        opacity="0.6"
      />
      <circle cx="276" cy="28" r="5" className="fill-tinta" />
      <path d="M268 36l-3 7M276 36v8M284 36l3 7" {...garisTinta} strokeWidth="2" className="stroke-tinta" />
      <rect x="240" y="54" width="72" height="70" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <Bintik x={252} y={66} kolom={6} baris={6} jarak={10} />
      <KursiRodaAtas x={126} y={108} />
      <path d="M126 90V80" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <Panah x={126} y={78} arah={-90} />
    </Kanvas>
  ),
  // Ganti lantai dengan permukaan anti-slip, kemiringan ke saluran, tanpa beda tinggi: potongan lantai dari samping.
  "bath-floor-slip:renovasi": () => (
    <Kanvas>
      <path d="M0 146V108L172 116H188L360 108V146Z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <g className="fill-tinta">
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={`k${i}`} cx={10 + i * 14} cy={116 + (10 + i * 14) * 0.046} r="1.500" />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={`r${i}`} cx={350 - i * 14} cy={116 + (10 + i * 14) * 0.046} r="1.500" />
        ))}
      </g>
      <rect x="170" y="114" width="20" height="9" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M176 114v9M180 114v9M184 114v9" {...garisTinta} strokeWidth="1.500" className="stroke-tinta" />
      <path d="M124 104L160 109M236 104L200 109" {...garisTinta} strokeWidth="2.500" strokeDasharray="3 6" className="stroke-tinta" />
      <Panah x={168} y={110} arah={8} />
      <Panah x={192} y={110} arah={172} />
      <Pengguna x={64} y={111} skala={0.62} tangan={[16, -56]} />
    </Kanvas>
  ),
  // Atur kebiasaan berpindah, tampak dari atas: kursi roda sejajar kloset dengan rem terkunci; wastafel dan gantungan handuk
  // bukan tumpuan.
  "bath-grab-bar:tanpa_biaya": () => (
    <Kanvas>
      <Dinding x1={0} x2={360} y={6} />
      <g transform="translate(0 34)">
        <rect x="30" y="14" width="56" height="26" rx="6" className="fill-white stroke-tinta" strokeWidth="3" />
        <ellipse cx="58" cy="29" rx="16" ry="8" fill="none" strokeWidth="2" className="stroke-tinta" />
        <Larang x={58} y={60} />
        <path d="M112 16V32M134 16V32" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
        <path d="M108 32H138" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
        <Larang x={123} y={60} />
        <rect x="196" y="14" width="40" height="14" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
        <ellipse cx="216" cy="52" rx="17" ry="20" className="fill-white stroke-tinta" strokeWidth="3" />
        <ellipse cx="216" cy="54" rx="9" ry="11" fill="none" strokeWidth="2" className="stroke-tinta" />
        <KursiRodaAtas x={274} y={62} />
        <path d="M268 40Q250 22 236 40" {...garisTinta} strokeWidth="2.500" strokeDasharray="3 6" className="stroke-tinta" />
        <Panah x={234} y={44} arah={140} />
        <g className="stroke-tinta" strokeWidth="3" {...garisTinta}>
          <rect x="304" y="62" width="22" height="18" rx="3" className="fill-white" />
          <path d="M309 62V56a6 6 0 0 1 12 0v6" />
          <circle cx="315" cy="71" r="1.500" className="fill-tinta" />
        </g>
      </g>
    </Kanvas>
  ),
  // Pasang pegangan yang bisa dilepas: rangka berdiri di lantai yang mengapit kloset, dan pegangan klem atau tempel di dinding.
  "bath-grab-bar:alat_tanpa_bongkar": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <KlosetDepan x={110} />
      <path d="M44 138V74H72V138M148 74H176V138" className="stroke-tinta" {...garisTinta} strokeWidth="5" />
      <path d="M38 138h12M168 138h12" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <rect x="236" y="20" width="104" height="118" fill="none" strokeWidth="3" className="stroke-tinta" />
      <path d="M236 54H340M236 88H340M268 20V138M304 20V138" {...garisTinta} strokeWidth="1.500" className="stroke-tinta" opacity="0.35" />
      <path d="M258 72H318" {...garisTinta} strokeWidth="10" className="stroke-tinta" />
      <path d="M258 72H318" {...garisTinta} strokeWidth="4" className="stroke-white" />
      <circle cx="258" cy="72" r="8" className="fill-white stroke-tinta" strokeWidth="3" />
      <circle cx="318" cy="72" r="8" className="fill-white stroke-tinta" strokeWidth="3" />
      <circle cx="258" cy="72" r="2.500" className="fill-tinta" />
      <circle cx="318" cy="72" r="2.500" className="fill-tinta" />
    </Kanvas>
  ),
  // Pasang pegangan permanen yang tertanam kuat: dua pegangan di dinding samping kloset, dengan sorotan pengikat ke dinding.
  "bath-grab-bar:renovasi": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path
        d="M30 20H230M30 54H230M30 88H230M30 20V138M97 20V138M164 20V138M230 20V138"
        {...garisTinta}
        strokeWidth="1.500"
        className="stroke-tinta"
        opacity="0.3"
      />
      <KlosetDepan x={130} />
      <g {...garisTinta} className="stroke-tinta" strokeWidth="5">
        <path d="M54 72H100M160 72H206" />
      </g>
      <g className="stroke-tinta" strokeWidth="3">
        <rect x="46" y="64" width="8" height="16" rx="2" className="fill-white" />
        <rect x="206" y="64" width="8" height="16" rx="2" className="fill-white" />
      </g>
      <path
        d="M214 68L252 54M214 76L252 100"
        {...garisTinta}
        strokeWidth="1.500"
        strokeDasharray="3 4"
        className="stroke-tinta"
        opacity="0.6"
      />
      <circle cx="298" cy="76" r="48" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="256" y="50" width="22" height="52" className="fill-tinta" />
      <rect x="278" y="62" width="8" height="28" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M286 76H336" {...garisTinta} strokeWidth="10" className="stroke-tinta" />
      <path d="M286 76H336" {...garisTinta} strokeWidth="4" className="stroke-white" />
      <path d="M284 70H266M284 82H266" {...garisTinta} strokeWidth="3" className="stroke-white" />
    </Kanvas>
  ),
  // Atur ulang letak barang: sabun, sampo, dan handuk dikumpulkan di satu meja kecil yang terjangkau dari posisi duduk;
  // barang dari rak tinggi diturunkan.
  "bath-reach-controls:tanpa_biaya": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="300" y="0" width="12" height="138" className="fill-tinta" />
      <path d="M252 34H300" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <rect
        x="262"
        y="12"
        width="12"
        height="22"
        rx="3"
        fill="none"
        strokeWidth="3"
        strokeDasharray="3 3"
        className="stroke-tinta"
        opacity="0.7"
      />
      <path d="M262 44Q246 62 226 62" {...garisTinta} strokeWidth="2.500" strokeDasharray="3 6" className="stroke-tinta" />
      <Panah x={222} y={62} arah={-170} />
      <Pengguna x={90} y={138} tangan={[146, 66]} />
      <rect x="138" y="74" width="78" height="6" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M158 80V138M206 80V138" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="148" y="52" width="12" height="22" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M152 52v-6h4" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="164" y="48" width="14" height="26" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="184" y="62" width="28" height="12" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M184 68H212" {...garisTinta} strokeWidth="1.500" className="stroke-tinta" />
    </Kanvas>
  ),
  // Alat tanpa bongkar: keranjang gantung dengan sabun pompa dan shower tangan berselang yang bisa diarahkan dari posisi duduk.
  "bath-reach-controls:alat_tanpa_bongkar": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="296" y="0" width="12" height="138" className="fill-tinta" />
      <path d="M296 24H282" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <path d="M284 24C262 24 262 94 226 94C204 94 196 74 186 62" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <Pengguna x={120} y={138} tangan={[182, 58]} />
      <rect
        x="190"
        y="38"
        width="12"
        height="24"
        rx="4"
        transform="rotate(35 196 50)"
        className="fill-white stroke-tinta"
        strokeWidth="3"
      />
      <path d="M212 66l6 13M222 58l8 14M204 72l3 14" {...garisTinta} strokeWidth="2.500" strokeDasharray="2 5" className="stroke-tinta" />
      <path d="M262 92V88M290 92V88" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="252" y="92" width="44" height="22" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path
        d="M252 100H296M252 107H296M262 92V114M274 92V114M286 92V114"
        {...garisTinta}
        strokeWidth="1.500"
        className="stroke-tinta"
        opacity="0.5"
      />
      <rect x="264" y="66" width="14" height="26" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M268 66v-6h8" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
    </Kanvas>
  ),
  // Renovasi: shower dan tuas keran diturunkan permanen (posisi lama putus-putus), plus ceruk dinding untuk sabun.
  "bath-reach-controls:renovasi": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="290" y="0" width="50" height="138" className="fill-tinta" />
      <path d="M290 10H274" {...garisTinta} strokeWidth="4" strokeDasharray="3 4" className="stroke-tinta" opacity="0.6" />
      <ellipse cx="268" cy="14" rx="7" ry="10" fill="none" strokeWidth="3" strokeDasharray="3 4" className="stroke-tinta" opacity="0.6" />
      <path d="M268 28V31" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <Panah x={268} y={40} arah={90} />
      <path d="M290 46H274" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <ellipse cx="268" cy="54" rx="7" ry="10" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M290 78H281" {...garisTinta} strokeWidth="6" className="stroke-tinta" />
      <circle cx="278" cy="78" r="5" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="290" y="104" width="30" height="22" className="fill-white" />
      <rect x="298" y="108" width="9" height="18" rx="2.500" fill="none" strokeWidth="3" className="stroke-tinta" />
      <Pengguna x={228} y={138} tangan={[277, 78]} />
    </Kanvas>
  ),
  // Cara aman sementara: belum masuk ke area mandi yang berbibir (tanda "jangan"), mandi lap sambil duduk di area datar.
  "bath-shower-entry:tanpa_biaya": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="272" y="116" width="88" height="22" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M272 116V10" {...garisTinta} strokeWidth="1.500" strokeDasharray="4 5" className="stroke-tinta" opacity="0.5" />
      <Larang x={314} y={90} />
      <Pengguna x={100} y={138} tangan={[152, 58]} />
      <rect x="148" y="74" width="68" height="6" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M170 80V138M204 80V138" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M164 62H200Q198 74 182 74Q166 74 164 62Z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="176" cy="54" r="3" fill="none" strokeWidth="2" className="stroke-tinta" />
      <circle cx="187" cy="48" r="4" fill="none" strokeWidth="2" className="stroke-tinta" />
      <circle cx="196" cy="55" r="2.500" fill="none" strokeWidth="2" className="stroke-tinta" />
    </Kanvas>
  ),
  // Alat tanpa bongkar: ramp kecil yang bisa dilepas di atas bibir, bangku mandi di dalam area mandi, titik anti-slip di lantainya.
  "bath-shower-entry:alat_tanpa_bongkar": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <Pengguna x={96} y={138} tangan={[16, -56]} />
      <path d="M156 138L232 118V138Z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <path
        d="M176 132L180 138M194 127L198 138M212 122L216 138"
        {...garisTinta}
        strokeWidth="1.500"
        className="stroke-tinta"
        opacity="0.5"
      />
      <rect x="232" y="118" width="128" height="20" className="fill-white stroke-tinta" strokeWidth="3" />
      <Bintik x={246} y={126} kolom={10} baris={1} jarak={11} />
      <rect x="262" y="84" width="52" height="7" rx="3.500" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M268 91V118M308 91V118M316 84V44" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <path d="M306 44H326" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
    </Kanvas>
  ),
  // Renovasi: area mandi tanpa bibir (roll-in), lantai miring ke saluran, tempat duduk lipat dan pegangan di dinding.
  "bath-shower-entry:renovasi": () => (
    <Kanvas>
      <path d="M0 146V118L254 123H276H360V146Z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <rect x="254" y="121" width="22" height="7" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="290" y="0" width="50" height="146" className="fill-tinta" />
      <path d="M290 10H266" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <ellipse cx="260" cy="16" rx="6" ry="9" transform="rotate(-20 260 16)" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M246 34V70M254 36V72M262 34V70" {...garisTinta} strokeWidth="2" strokeDasharray="3 5" className="stroke-tinta" />
      <path d="M290 24H280V66H290" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <rect x="252" y="82" width="38" height="6" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M290 114L262 88" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <Pengguna x={116} y={119} skala={0.8} />
      <path d="M176 110H226" {...garisTinta} strokeWidth="3" strokeDasharray="3 7" className="stroke-tinta" />
      <Panah x={234} y={110} arah={0} />
    </Kanvas>
  ),
  // Pindahkan perlengkapan ke permukaan yang terjangkau dan pakai cermin kecil yang dipegang; lutut masuk di bawah wastafel.
  "bath-sink-mirror:tanpa_biaya": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="300" y="0" width="12" height="138" className="fill-tinta" />
      <rect x="196" y="60" width="104" height="6" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M300 92L276 66" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M262 66Q262 84 278 84Q294 84 294 66" fill="none" strokeWidth="3" className="stroke-tinta" />
      <path d="M298 60V40Q298 34 290 34H282V40" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <Pengguna x={190} y={138} tangan={[230, 50]} />
      <circle cx="238" cy="40" r="9" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="250" y="44" width="11" height="16" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M254 44l3-10" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <rect x="266" y="42" width="10" height="18" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
    </Kanvas>
  ),
  // Alat tanpa bongkar: cermin miring yang lebih rendah di dinding dan troli kecil untuk perlengkapan; ada ruang kosong di bawah wastafel.
  "bath-sink-mirror:alat_tanpa_bongkar": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="300" y="0" width="12" height="138" className="fill-tinta" />
      <rect x="222" y="60" width="78" height="6" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M300 92L276 66" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M262 66Q262 84 278 84Q294 84 294 66" fill="none" strokeWidth="3" className="stroke-tinta" />
      <path d="M298 60V42Q298 36 290 36H282V42" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M300 14H294" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <rect x="291" y="14" width="6" height="38" rx="2" transform="rotate(25 294 14)" className="fill-white stroke-tinta" strokeWidth="3" />
      <Pengguna x={200} y={138} tangan={[256, 58]} />
      <rect x="96" y="78" width="60" height="5" rx="2.500" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="96" y="108" width="60" height="5" rx="2.500" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M102 83V132M150 83V132" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <circle cx="102" cy="134" r="4" className="fill-white stroke-tinta" strokeWidth="2.500" />
      <circle cx="150" cy="134" r="4" className="fill-white stroke-tinta" strokeWidth="2.500" />
      <rect x="108" y="60" width="11" height="18" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="126" y="66" width="20" height="12" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
    </Kanvas>
  ),
  // Renovasi: wastafel gantung dengan ruang kosong di bawah, pipa dibungkus penutup, dan cermin diturunkan.
  "bath-sink-mirror:renovasi": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="300" y="0" width="12" height="138" className="fill-tinta" />
      <rect x="196" y="60" width="104" height="6" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M250 66Q250 84 266 84Q282 84 282 66" fill="none" strokeWidth="3" className="stroke-tinta" />
      <path d="M298 60V40Q298 34 290 34H270V40" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="284" y="66" width="14" height="34" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M291 72V94" {...garisTinta} strokeWidth="1.500" strokeDasharray="3 3" className="stroke-tinta" opacity="0.6" />
      <rect x="288" y="18" width="12" height="38" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M291 50L297 28M291 36L295 26" {...garisTinta} strokeWidth="1.500" className="stroke-tinta" opacity="0.7" />
      <Pengguna x={190} y={138} tangan={[232, 58]} />
    </Kanvas>
  ),
  // Bebaskan ruang yang sudah ada, tampak dari atas: ember dan keranjang (bayangan putus-putus) dipindah ke sudut, sisi kloset lapang.
  "bath-space-turning:tanpa_biaya": () => (
    <Kanvas>
      <rect x="24" y="8" width="312" height="134" fill="none" strokeWidth="6" className="stroke-tinta" />
      <rect x="154" y="14" width="36" height="12" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="172" cy="50" rx="15" ry="18" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="172" cy="52" rx="8" ry="10" fill="none" strokeWidth="2" className="stroke-tinta" />
      <circle cx="130" cy="50" r="9" fill="none" strokeWidth="2.500" strokeDasharray="3 3" className="stroke-tinta" opacity="0.7" />
      <rect
        x="112"
        y="72"
        width="22"
        height="16"
        rx="3"
        fill="none"
        strokeWidth="2.500"
        strokeDasharray="3 3"
        className="stroke-tinta"
        opacity="0.7"
      />
      <path d="M118 62Q96 80 76 104" {...garisTinta} strokeWidth="2.500" strokeDasharray="3 6" className="stroke-tinta" />
      <Panah x={72} y={108} arah={125} />
      <circle cx="56" cy="118" r="9" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M49 114q7-9 14 0" {...garisTinta} strokeWidth="2" className="stroke-tinta" />
      <rect x="76" y="114" width="22" height="16" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M76 120H98M76 125H98" {...garisTinta} strokeWidth="1.500" className="stroke-tinta" opacity="0.5" />
      <rect
        x="206"
        y="22"
        width="76"
        height="92"
        rx="4"
        fill="none"
        strokeWidth="2"
        strokeDasharray="5 5"
        className="stroke-tinta"
        opacity="0.5"
      />
      <KursiRodaAtas x={244} y={76} />
      <path d="M232 52Q214 32 192 44" {...garisTinta} strokeWidth="2.500" strokeDasharray="3 6" className="stroke-tinta" />
      <Panah x={190} y={46} arah={150} />
    </Kanvas>
  ),
  // Alat tanpa bongkar: rak dinding dan keranjang gantung mengosongkan lantai; papan pindah menjembatani kursi roda dan kloset.
  "bath-space-turning:alat_tanpa_bongkar": () => (
    <Kanvas>
      <rect x="24" y="8" width="312" height="134" fill="none" strokeWidth="6" className="stroke-tinta" />
      <rect x="154" y="14" width="36" height="12" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="172" cy="50" rx="15" ry="18" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="172" cy="52" rx="8" ry="10" fill="none" strokeWidth="2" className="stroke-tinta" />
      <rect x="52" y="14" width="68" height="12" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="60" y="17" width="10" height="6" rx="1.500" className="fill-tinta" />
      <circle cx="88" cy="20" r="3.500" className="fill-tinta" />
      <rect x="100" y="17" width="12" height="6" rx="1.500" className="fill-tinta" />
      <rect x="310" y="34" width="20" height="48" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M310 46H330M310 58H330M310 70H330" {...garisTinta} strokeWidth="1.500" className="stroke-tinta" opacity="0.5" />
      <rect x="188" y="42" width="46" height="12" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M224 48H206" {...garisTinta} strokeWidth="2" className="stroke-tinta" />
      <Panah x={202} y={48} arah={180} />
      <KursiRodaAtas x={254} y={50} />
      <path
        d="M96 100l2.500 6 6 2.500-6 2.500-2.500 6-2.500-6-6-2.500 6-2.500zM280 104l2 4.500 4.500 2-4.500 2-2 4.500-2-4.500-4.500-2 4.500-2z"
        className="fill-tinta"
      />
    </Kanvas>
  ),
  // Renovasi: tata ruang diubah (kloset digeser, pintu geser) hingga ada ruang putar dan ruang di samping kloset.
  "bath-space-turning:renovasi": () => (
    <Kanvas>
      <path d="M24 8V142H336V8M24 8H268M312 8H336" fill="none" strokeWidth="6" strokeLinecap="square" className="stroke-tinta" />
      <path d="M200 17H268" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <path d="M268 17H312" {...garisTinta} strokeWidth="2" strokeDasharray="4 4" className="stroke-tinta" opacity="0.6" />
      <rect x="102" y="14" width="36" height="12" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="120" cy="50" rx="15" ry="18" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="120" cy="52" rx="8" ry="10" fill="none" strokeWidth="2" className="stroke-tinta" />
      <rect
        x="146"
        y="28"
        width="30"
        height="72"
        rx="4"
        fill="none"
        strokeWidth="2"
        strokeDasharray="5 5"
        className="stroke-tinta"
        opacity="0.5"
      />
      <circle cx="244" cy="70" r="40" fill="none" strokeWidth="2" strokeDasharray="5 5" className="stroke-tinta" />
      <Panah x={266} y={36} arah={30} />
      <Panah x={222} y={104} arah={210} />
      <KursiRodaAtas x={244} y={70} />
      <UkurMendatar x1={204} x2={284} y={134} angka={angka("ruangPutar")} />
    </Kanvas>
  ),
  // Atur ruang dan kebiasaan, tampak dari atas: ruang kosong di samping kloset (ukuran dari kartu), ember dipindah, keset anti-slip.
  "bath-transfer-toilet:tanpa_biaya": () => (
    <Kanvas>
      <rect x="24" y="8" width="312" height="134" fill="none" strokeWidth="6" className="stroke-tinta" />
      <rect x="132" y="14" width="36" height="12" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="150" cy="50" rx="15" ry="18" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="150" cy="52" rx="8" ry="10" fill="none" strokeWidth="2" className="stroke-tinta" />
      <circle cx="108" cy="44" r="9" fill="none" strokeWidth="2.500" strokeDasharray="3 3" className="stroke-tinta" opacity="0.7" />
      <path d="M100 52Q84 70 70 96" {...garisTinta} strokeWidth="2.500" strokeDasharray="3 6" className="stroke-tinta" />
      <Panah x={66} y={100} arah={120} />
      <circle cx="56" cy="116" r="9" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M49 112q7-9 14 0" {...garisTinta} strokeWidth="2" className="stroke-tinta" />
      <rect
        x="172"
        y="22"
        width="86"
        height="84"
        rx="4"
        fill="none"
        strokeWidth="2"
        strokeDasharray="5 5"
        className="stroke-tinta"
        opacity="0.5"
      />
      <rect x="190" y="36" width="52" height="58" rx="3" className="fill-white stroke-tinta" strokeWidth="2.500" />
      <path
        d="M190 46H242M190 56H242M190 66H242M190 76H242M190 86H242"
        {...garisTinta}
        strokeWidth="1.500"
        className="stroke-tinta"
        opacity="0.35"
      />
      <KursiRodaAtas x={216} y={72} />
      <UkurMendatar x1={165} x2={255} y={126} angka={angka("ruangSamping")} />
    </Kanvas>
  ),
  // Alat tanpa bongkar: pegangan klem di sisi kloset, dudukan kloset tambahan (lebih tinggi), bangku mandi lipat, keset anti-slip.
  "bath-transfer-toilet:alat_tanpa_bongkar": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <KlosetDepan x={100} />
      <rect x="72" y="76" width="56" height="9" rx="4.500" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="138" y="94" width="8" height="14" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M146 100H158V58H178" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <rect x="214" y="92" width="66" height="7" rx="3.500" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M224 99L262 138M270 99L232 138" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <rect x="296" y="130" width="52" height="8" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <Bintik x={304} y={134} kolom={5} baris={1} jarak={9} />
    </Kanvas>
  ),
  // Renovasi: kloset dinaikkan setinggi dudukan kursi roda (ukuran dari kartu), pegangan permanen di dinding, lantai anti-slip.
  "bath-transfer-toilet:renovasi": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <Bintik x={14} y={145} kolom={26} baris={1} jarak={13} />
      <Pengguna x={96} y={138} />
      <path d="M126 88H250" {...garisTinta} strokeWidth="2" strokeDasharray="3 5" className="stroke-tinta" opacity="0.6" />
      <UkurTegak x={182} y1={88} y2={138} angka={angka("tinggiKloset")} />
      <g transform="translate(36 0)">
        <rect x="300" y="0" width="12" height="138" className="fill-tinta" />
        <path d="M300 28H290V68H300" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
        <rect x="260" y="52" width="32" height="38" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
        <rect x="214" y="88" width="76" height="7" rx="3.500" className="fill-white stroke-tinta" strokeWidth="3" />
        <path
          d="M224 95H286Q286 118 272 124V138H238V124Q224 118 224 95Z"
          className="fill-white stroke-tinta"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>
    </Kanvas>
  ),
  // Bawa air ke posisi duduk: gayung dan ember kecil di meja rendah, handuk di rak bawahnya, rem kursi roda terkunci.
  "bath-wudhu-seated:tanpa_biaya": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <Pengguna x={96} y={138} tangan={[150, 56]} />
      <rect x="160" y="82" width="52" height="6" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M168 88V138M204 88V138" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M166 62H196L192 82H170Z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <path d="M168 62Q181 50 194 62" {...garisTinta} strokeWidth="2" className="stroke-tinta" />
      <path d="M150 56L160 46" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <path d="M158 42H176Q176 52 167 52Q158 52 158 42Z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <path d="M180 56V60M185 54V59" {...garisTinta} strokeWidth="2" strokeDasharray="2 3" className="stroke-tinta" />
      <rect x="170" y="104" width="30" height="8" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M170 108H200" {...garisTinta} strokeWidth="1.500" className="stroke-tinta" opacity="0.5" />
      <rect x="166" y="112" width="38" height="4" rx="2" className="fill-white stroke-tinta" strokeWidth="2.500" />
      <g className="stroke-tinta" strokeWidth="3" {...garisTinta}>
        <rect x="26" y="96" width="22" height="18" rx="3" className="fill-white" />
        <path d="M31 96V90a6 6 0 0 1 12 0v6" />
        <circle cx="37" cy="105" r="1.500" className="fill-tinta" />
      </g>
    </Kanvas>
  ),
  // Alat tanpa bongkar: bangku wudhu yang stabil dengan kaki karet, meja kecil untuk wadah air, selang berkeran, keset anti-slip.
  "bath-wudhu-seated:alat_tanpa_bongkar": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="296" y="0" width="12" height="138" className="fill-tinta" />
      <rect x="34" y="128" width="116" height="10" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <Bintik x={44} y={133} kolom={9} baris={1} jarak={12} />
      <rect x="56" y="88" width="72" height="8" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M62 96V126M122 96V126M60 88V54" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <rect x="58" y="126" width="8" height="4" rx="1.500" className="fill-tinta" />
      <rect x="118" y="126" width="8" height="4" rx="1.500" className="fill-tinta" />
      <rect x="168" y="82" width="52" height="6" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M176 88V138M212 88V138" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M178 58H206V82H178Z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <path d="M206 64H214L216 56" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M178 66Q164 66 164 76" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M296 62H280V72" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <path d="M280 72C268 100 246 92 248 112" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <path d="M244 110l8 0l-2 10h-4z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
    </Kanvas>
  ),
  // Renovasi: keran wudhu rendah yang terjangkau dari kursi roda, lantai miring ke saluran dan anti-slip, ruang mendekat lapang.
  "bath-wudhu-seated:renovasi": () => (
    <Kanvas>
      <path d="M0 146V128L252 134H266H360V146Z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <g className="fill-tinta">
        {Array.from({ length: 17 }, (_, i) => (
          <circle key={i} cx={12 + i * 14} cy={137 + (12 + i * 14) * 0.024} r="1.500" />
        ))}
      </g>
      <rect x="252" y="132" width="14" height="7" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="290" y="0" width="50" height="146" className="fill-tinta" />
      <path d="M290 54H254V64" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <path
        d="M264 80H290V94H264Q260 94 260 90V84Q260 80 264 80Z"
        className="fill-white stroke-tinta"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M252 70V74M256 70V74" {...garisTinta} strokeWidth="2" strokeDasharray="2 3" className="stroke-tinta" />
      <Pengguna x={198} y={131} tangan={[252, 74]} />
    </Kanvas>
  ),
  // Pastikan pintu bisa dibuka leluasa: pintu terbuka penuh dan diganjal, jalur di depan pintu kosong.
  "bath-door:tanpa_biaya": () => (
    <Kanvas>
      <Dinding x1={0} x2={160} y={56} />
      <Dinding x1={220} x2={360} y={56} />
      <path d="M160 64A60 60 0 0 1 220 4" {...garisTinta} strokeWidth="1.500" strokeDasharray="4 5" className="stroke-tinta" />
      <path d="M220 64V4" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <path d="M160 94V146M220 94V146" {...garisTinta} strokeWidth="1.500" strokeDasharray="4 5" className="stroke-tinta" opacity="0.5" />
      <UkurMendatar x1={160} x2={220} y={86} angka={angka("bukaanPintu")} />
      <KursiRodaAtas x={190} y={126} />
      <path d="M190 106V96" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <Panah x={190} y={94} arah={-90} />
    </Kanvas>
  ),
  // Tambahkan alat yang bisa dilepas: tali di gagang supaya pintu bisa ditarik dari posisi duduk, ganjal di lantai.
  "bath-door:alat_tanpa_bongkar": () => (
    <Kanvas>
      <g transform="translate(-30 0)">
        <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
        <rect x="244" y="6" width="8" height="132" className="fill-white stroke-tinta" strokeWidth="3" />
        <path d="M244 38h-12" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
        <path d="M229 38V64q0 10-7 10t-7-10V44" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
        <path d="M232 138h12v-9z" className="fill-tinta" />
        <Pengguna x={170} y={138} tangan={[222, 58]} />
        <path d="M252 16H282M252 52H282" {...garisTinta} strokeWidth="1.500" strokeDasharray="4 4" className="stroke-tinta" opacity="0.5" />
        <UkurTegak x={286} y1={16} y2={52} angka={angka("tinggiGagang")} />
      </g>
    </Kanvas>
  ),
  // Ubah pintu secara permanen: pintu geser, bukaan lega tanpa ruang putar daun pintu.
  "bath-door:renovasi": () => (
    <Kanvas>
      <Dinding x1={0} x2={120} y={56} />
      <Dinding x1={200} x2={360} y={56} />
      <path d="M200 68H300" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <path d="M120 68H200" {...garisTinta} strokeWidth="2" strokeDasharray="4 4" className="stroke-tinta" opacity="0.6" />
      <path d="M226 68h14" {...garisTinta} strokeWidth="2" className="stroke-white" />
      <path d="M134 80H178" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <Panah x={190} y={80} arah={0} />
      <UkurMendatar x1={120} x2={200} y={100} angka={angka("bukaanPintu")} />
      <path d="M160 116V108" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <Panah x={160} y={106} arah={-90} />
      <KursiRodaAtas x={160} y={132} />
    </Kanvas>
  ),
  // Sepakati cara memanggil: pengguna memanggil dari kamar mandi, ponsel di tempat yang terjangkau, pintu tidak dikunci.
  "bath-emergency-call:tanpa_biaya": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <Pengguna x={90} y={138} tangan={[18, -134]} />
      <path
        d="M128 22A14 14 0 0 1 128 40M138 14A26 26 0 0 1 138 48M148 6A38 38 0 0 1 148 56"
        {...garisTinta}
        strokeWidth="2.500"
        className="stroke-tinta"
      />
      <rect x="250" y="22" width="76" height="116" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M250 22L226 12V134L250 138z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="234" cy="76" r="3.500" className="fill-tinta" />
    </Kanvas>
  ),
  // Tambahkan alat panggil yang bisa dilepas: tombol panggil nirkabel di satu ruangan, penerima di ruangan lain.
  "bath-emergency-call:alat_tanpa_bongkar": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="176" y="0" width="8" height="138" className="fill-tinta" />
      <rect x="60" y="44" width="52" height="52" rx="12" className="fill-white stroke-tinta" strokeWidth="3" />
      <circle cx="86" cy="36" r="6" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M86 42V44" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <circle cx="86" cy="70" r="16" className="fill-white stroke-tinta" strokeWidth="3" />
      <circle cx="86" cy="70" r="6" className="fill-tinta" />
      <path
        d="M122.700 61A14 14 0 0 1 122.700 79M132 53.300A26 26 0 0 1 132 86.700M141.100 45.600A38 38 0 0 1 141.100 94.400M150.300 37.900A50 50 0 0 1 150.300 102.100M159.500 30.200A62 62 0 0 1 159.500 109.800"
        {...garisTinta}
        strokeWidth="2.500"
        className="stroke-tinta"
      />
      <rect x="232" y="50" width="60" height="40" rx="8" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M246 62H278M246 70H278M246 78H278" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M300 62A12 12 0 0 1 300 78M308 56A22 22 0 0 1 308 84" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
    </Kanvas>
  ),
  // Pasang sistem panggil permanen: tombol dan tali panggil di dinding dekat kloset, terhubung ke bel di ruangan lain.
  "bath-emergency-call:renovasi": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="250" y="0" width="12" height="138" className="fill-tinta" />
      <rect x="212" y="64" width="28" height="40" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <circle cx="226" cy="64" r="3" className="fill-tinta" />
      <rect x="160" y="100" width="76" height="8" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <path
        d="M170 108H232Q232 124 218 128V138H190V128Q170 124 170 108Z"
        className="fill-white stroke-tinta"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="246" cy="44" r="6" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M246 50V100" {...garisTinta} strokeWidth="2" className="stroke-tinta" />
      <circle cx="246" cy="106" r="4" className="fill-tinta" />
      <circle cx="246" cy="126" r="6" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M252 44H298" {...garisTinta} strokeWidth="2.500" strokeDasharray="3 5" className="stroke-tinta" />
      <path d="M300 58h20q-2-4-2-12a8 8 0 0 0-16 0q0 8-2 12z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="310" cy="63" r="3" className="fill-tinta" />
      <path d="M328 36A8 8 0 0 1 328 52M334 30A16 16 0 0 1 334 58" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
    </Kanvas>
  ),
};

const BERANGKA: Record<string, "ada" | "kartu"> = {
  "bath-door:tanpa_biaya": "ada",
  "bath-door:alat_tanpa_bongkar": "ada",
  "bath-door:renovasi": "ada",
  "bath-space-turning:renovasi": "ada",
  "bath-transfer-toilet:tanpa_biaya": "kartu",
  "bath-transfer-toilet:renovasi": "kartu",
};

/** Ilustrasi selebar panel untuk satu pilihan solusi; null bila panduan itu belum punya ilustrasi. */
export function IlustrasiSolusi({ kartuId, tingkat }: { kartuId: string; tingkat: Tingkat }) {
  const kunci = `${kartuId}:${tingkat}`;
  const Gambar = GAMBAR[kunci];
  if (!Gambar) return null;
  return (
    <>
      <svg viewBox="0 0 360 150" className="block h-auto w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
        <Gambar />
      </svg>
      {BERANGKA[kunci] && (
        <p className="px-4 pt-2 text-mikro text-redup">
          {BERANGKA[kunci] === "ada" ? konten.ui.ilustrasi.catatanAngka : konten.ui.ilustrasi.catatanAngkaKartu}
        </p>
      )}
    </>
  );
}
