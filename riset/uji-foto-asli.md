# Uji Pindai dengan foto asli

Tujuan: membandingkan hasil gambar aplikasi (denah isometrik, jenis shower, kloset, dan pintu) dengan foto kamar mandi sungguhan,
dan menilai apakah kualitasnya sama dengan gambar yang dirancang di Claude Design.

## Cara menjalankan

1. Pastikan variabel `GEMINI_API_KEY` terpasang di Vercel (Project Settings, Environment Variables), lalu deploy (push ke cabang untuk preview,
   atau deploy produksi). Tidak ada flag lain yang perlu dipasang: tab Isometrik baru sudah menjadi bawaan.
2. Atau jalankan lokal dengan fungsi server: `npx vercel dev` (butuh `GEMINI_API_KEY` di `.env.local`). `npm run dev` biasa tidak melayani
   `/api/pindai`; untuk mencoba alur tanpa Gemini pakai `VITE_PINDAI_MOCK=true npm run dev`.
3. Buka `/#/pindai`, pilih foto (JPEG), tekan **Pindai foto ini**. Foto dikirim sekali ke Gemini dan tidak disimpan.
4. Di hasil, buka tab **Isometrik**: putar sudut pandang (satu tombol), tampilkan benda tersembunyi (tombol mata), dan perbesar.

## Yang dibaca dari foto

| Hal | Nilai | Digambar sebagai |
| --- | --- | --- |
| Posisi pintu, kloset, wastafel, area mandi | dinding (depan, belakang, kiri, kanan) dan zona | letak benda di ruangan |
| Jenis shower | hand shower digantung, shower tetap, ember dan gayung, tidak jelas | gambar shower dan keran |
| Jenis kloset | duduk, jongkok, tidak jelas | kloset duduk, kloset jongkok, atau kotak putus-putus bertanda tanya |
| Cara pintu membuka | ayun ke dalam, ayun ke luar, geser, tidak jelas | pintu berengsel, pintu geser, atau hanya kusen |
| Status tiap hal (ramah, perhatian, tidak jelas) | 7 hal | denah tampak atas dan rincian |

Bila foto tidak memperlihatkan sesuatu, model diminta memilih "tidak jelas", dan aplikasi menggambar penanda netral, bukan menebak.

## Lembar penilaian per foto

Isi satu baris per foto:

| Foto | Benar posisi benda? | Benar jenis shower? | Benar jenis kloset? | Benar cara pintu? | Gambar ruangan terasa mirip? | Catatan |
| --- | --- | --- | --- | --- | --- | --- |
| (nama foto) | ya, sebagian, tidak | ya, tidak, tidak jelas | ya, tidak, tidak jelas | ya, tidak, tidak jelas | 1 sampai 5 | |

Yang perlu dicatat bila salah:
- Posisi: benda di dinding yang salah, atau urutan kiri-kanan terbalik (foto diambil dari arah mana).
- Jenis: nilai yang terbaca dan nilai yang seharusnya.
- Gambar: bagian yang terasa janggal (ukuran, jarak antar benda, pintu, selang).

## Batasan yang sudah diketahui

- Ruangan selalu digambar seluas ruang dalam toilet PerMen (152,5 × 227,5 cm); ukuran asli kamar mandi tidak dibaca dari foto.
- Posisi benda hanya perkiraan dinding dan zona, bukan jarak; benda di satu dinding diberi jarak minimum 25 cm.
- Cara pintu membuka sering tidak terlihat dari dalam; hasilnya bisa "tidak jelas" dan hanya kusen yang digambar.
- Jenis shower, kloset, dan pintu belum bisa dikoreksi manual di hasil (hanya jenis shower yang punya pilihan koreksi).
- Foto dengan beberapa kamar mandi atau sudut yang sangat sempit bisa menghasilkan posisi yang keliru.
