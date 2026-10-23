# Audit dimensi gambar (Pindai)

Semua gambar (panel Claude Design, panel di hasil Pindai, dan tampilan ruangan) memakai satu skala: **1 satuan gambar = 1 cm**.
Sumber tunggal angkanya adalah `src/domain/dimensiGambar.ts`. Angka dari tabel (`content/ukuran-aksesibel.json`) diambil lewat
`nilaiAcuan` (PerMen PUPR 14/2017 diutamakan, lalu ADA 2010); angka lain tercatat sebagai perkiraan dan perlu ditinjau tim riset.
Panel tampil lebih besar lewat pembesaran seragam (`ZOOM_PANEL`), bukan dengan mengubah ukuran benda. Dinding diberi garis
keramik 30 × 30 cm sebagai penggaris.

## Dari tabel (bersumber)

| Dimensi | Nilai | Entri tabel | Catatan |
| --- | --- | --- | --- |
| Ruang dalam (lebar × panjang) | 152,5 × 227,5 cm | `toilet-disabilitas-ruang-dalam` | PerMen, toilet umum; rumah bisa lebih kecil |
| Bukaan bersih pintu | 90 cm | `pintu-toilet-lebar-bersih` | PerMen (ADA 81,5 cm sebagai pembanding) |
| Tinggi dudukan kloset | 45 cm | `kloset-tinggi-dudukan` | PerMen, dibaca dari label gambar; titik ukur belum dikonfirmasi |
| Bak wastafel | 60 × 45 cm | `wastafel-ukuran-bak` | PerMen; arah lebar dan panjang tidak dijelaskan |
| Tinggi pasang wastafel (kursi roda) | 75 cm | `wastafel-tinggi-pengguna-kursi-roda` | PerMen |
| Zona jangkauan perlengkapan | 38 sampai 120 cm | `jangkauan-zona-perlengkapan`, `pancuran-tinggi-kran` | Batas atas PerMen 120 cm; batas bawah dari checklist tim riset |
| Panjang selang minimum | 150 cm | `pancuran-selang-hand-shower` | ADA 608.6 (checklist riset menulis 1525 mm) |

## Perkiraan (belum bersumber, mohon ditinjau tim riset)

| Dimensi | Nilai | Dipakai untuk |
| --- | --- | --- |
| Tinggi plafon | 260 cm | tinggi dinding di ruangan dan panel |
| Tinggi pintu | 210 cm | kusen dan daun pintu |
| Tebal dinding digambar | 10 cm | hanya penampakan |
| Ukuran keramik | 30 × 30 cm | garis penggaris di dinding; konvensi gambar |
| Lebar kloset duduk | 36 cm | tangki dan badan; kedalaman, tinggi tangki (sekitar 85 cm), dan bentuk mangkuk juga perkiraan |
| Kloset jongkok | pelat 36 × 58 cm | bentuk ilustratif |
| Tinggi kait hand shower di luar zona | 180 cm | gambar kondisi dari foto |
| Tinggi kepala shower tetap | 200 cm | gambar kondisi dari foto |
| Bagian kecil shower | pengali 0,45 dari ilustrasi awal | kepala hand shower sekitar 13 cm, ember sekitar 25 cm, keran sekitar 7 × 3 cm |
| Tinggi pasang keran dinding | sekitar 100 cm | di bawah batas atas PerMen 120 cm |
| Bagian keran wastafel, siku penopang, pipa | ukuran ilustratif | tidak dikaitkan ke tabel |

## Yang belum seragam

- Papan **M-08** (bak mandi tembok, area shower tanpa undakan) masih digambar manual, belum berasal dari kode, jadi belum memakai skala ini.
- Papan eksplorasi **KlosetVarian** dan **WastafelOval** adalah riwayat rancangan pada skala lama; angkanya berbeda dari papan acuan.
- Tata letak benda di ruangan berasal dari posisi kasar hasil pindai (persen sepanjang dinding), bukan ukuran.

## Cara menjaga konsistensi

- `tests/dimensiGambar.test.ts` memastikan angka dari tabel sama dengan yang dipakai gambar, dan tinggi dudukan kloset, tinggi
  wastafel, serta bukaan pintu pada gambar sama dengan tabel.
- `scripts/ekspor-papan.ts` membuat ulang gambar di papan Main, M07, dan Benda dari kode yang sama:
  `npx tsx scripts/ekspor-papan.ts <folder papan>`, lalu terbitkan papannya.
