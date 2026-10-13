# Transisi

Platform web mobile-first untuk caregiver dan penyandang disabilitas yang baru mengalami amputasi kaki. Aturan produk ada di `CLAUDE.md`; keputusan teknis dan hal yang menunggu ahli ada di `DECISIONS.md`.

## Perintah
- `npm run dev`: jalankan lokal. `VITE_TAMPILKAN_ANGKA_DRAF=true npm run dev` menampilkan angka teknis kartu draf (hanya mode dev).
- `npm run build`: periksa konten, typecheck, lalu build ke `dist/` (bisa dihosting statis).
- `npm test`, `npm run lint`, `npm run typecheck`.
- `npm run validasi`: hanya memeriksa semua file di `content/`. Jalankan setiap selesai mengedit konten.

## Panduan untuk tim konten

Semua isi ada di `content/`. Tidak perlu membuka kode. Setelah mengedit, jalankan `npm run validasi`. Bila ada kesalahan, pesannya menyebut file dan bagian yang salah.

### Aturan keras
- **Jangan mengarang** ukuran, harga, tautan produk, atau klaim medis. Belum tahu? Isi `null` atau tulis "menyusul".
- Nyeri, luka, dan protesis tidak dijawab platform. Arahkan ke dokter rehabilitasi medik atau prostetis-ortotis.
- Pakai: "penyandang disabilitas", "orang tanpa disabilitas", "pengguna kursi roda", "caregiver". Hindari kata yang dilarang di `CLAUDE.md`; tes akan gagal bila kata itu muncul di `content/`.
- Kalimat pendek, sapaan "Anda". Istilah teknis dijelaskan satu kalimat (lihat "Istilah" di bawah).
- Teks `judul`, `situasi`, `ringkasan`, dan `langkah` bisa ikut masuk ke brief untuk tukang. Jangan menulis data medis atau tanggal kejadian di sana.

### Menambah kartu baru
1. Salin kartu yang mirip di `content/kartu/`, misalnya `bath-transfer-toilet.json` (kartu lengkap) atau `bath-door.json` (kerangka).
2. Nama file harus sama dengan `id` (huruf kecil, angka, tanda hubung): `bath-contoh.json` berisi `"id": "bath-contoh"`.
3. Isi bagian kartu:

| Bagian | Keterangan |
| --- | --- |
| `judul`, `situasi` | Wajib. `situasi` satu atau dua kalimat. |
| `kenapa_penting` | Wajib untuk kartu lengkap. |
| `solusi` | Salah satu atau lebih dari `tanpa_biaya`, `alat_tanpa_bongkar`, `renovasi`. Tiap tingkat: `ringkasan`, `langkah[]`, `sifat` (`sementara` atau `permanen`), `biaya.kisaran_rp` (teks atau `null`), `usaha.waktu` dan `usaha.kesulitan` (teks atau `null`), `ukuran[]` (opsional), `barang[]`. |
| `barang[]` | `nama`, `spesifikasi`, `cek_kecocokan`, `link` (alamat `http(s)` atau `null`), `kisaran_harga` (teks atau `null`), `afiliasi` (`true` bila tautan berkomisi; label akan tampil otomatis). |
| `bantuan[]` | `jenis`: `tukang`, `okupasi_terapis`, `fisioterapis`, `arsitek`, `komunitas`; dan `keterangan`. |
| `peran` | Teks untuk `penyandang_disabilitas` dan `caregiver`. |
| `peringatan`, `sumber[]` | `sumber` boleh kosong; tiap sumber punya `judul` dan `url` (opsional). |
| `tag` | Lihat di bawah. |
| `status_validasi` | `draf`, `ditinjau_ahli`, atau `disetujui`. Kartu baru selalu mulai dari `draf`. |
| `isi_menyusul` | `true` untuk kartu kerangka. Kartu kerangka hanya perlu `id`, `judul`, `situasi`, `tag`, `status_validasi`. |

4. Hubungkan ke asesmen: di `content/asesmen.json`, tambahkan id kartu ke `memicu_kartu` pertanyaan yang relevan (atau tambah pertanyaan baru dengan `id`, `aktivitas`, `pertanyaan`, `penjelasan` satu kalimat awam, dan `memicu_kartu`). Id yang tidak ada akan membuat validasi gagal.
5. Jalankan `npm run validasi`, lalu `npm test`.

### Tag
`aktivitas` (`mandi`, `toilet`, `wudhu`, `grooming`, `umum`), `alat_bantu` (`kursi_roda`, `kruk`, `walker`), `hunian` (`milik_sendiri`, `kontrakan`, `kos`, `apartemen`), `tingkat_biaya` (`nol`, `rendah`, `tinggi`), serta `fase`, `ruangan`, `kondisi` (teks bebas). Kartu pendamping caregiver memakai `"peran": ["caregiver"]` di dalam `tag`; kartu itu tampil di bagian bawah Rencana dan tidak masuk daftar rekomendasi.

### Status validasi dan angka teknis
- `draf`: lencana "Draf, belum ditinjau ahli" tampil, dan isi `ukuran` **tidak** ditampilkan (diganti catatan "akan tampil setelah ditinjau ahli").
- `ditinjau_ahli` atau `disetujui`: `ukuran` tampil. Ubah status hanya setelah ahli benar-benar meninjau kartu.

### Istilah teknis
Bila teks kartu memuat istilah teknis (misalnya "grab bar"), tambahkan penjelasan satu kalimat di `content/ui.json` bagian `istilah` (`kata` dan `arti`). Penjelasan tampil otomatis di Detail kartu bila `kata` muncul di teks kartu.

### Teks antarmuka
Semua teks yang dilihat pengguna ada di `content/ui.json`; pertanyaan awal ada di `content/onboarding.json`; angka seperti `faseAwalBulan`, jumlah "mulai dari sini", dan rentang budget ada di `content/config.json`. Pilihan budget di onboarding dibaca dari `config.json` (`budget`); ubah rentang di sana saja, onboarding dan brief ikut berubah. Menambah pilihan budget baru juga hanya di `config.json` (beri `id` unik). Jangan mengubah nama kunci (bagian kiri); ubah hanya isinya. Jika kunci hilang, validasi akan gagal.

### Halaman "Kapan harus ke dokter atau IGD"
Teks di `content/ui.json` bagian `igd` masih placeholder. Daftar tanda bahaya wajib diisi tim medis; jangan ditulis oleh tim non-medis.

## Analitik (opsional, ramah privasi)
Bawaannya **tidak ada yang dikirim keluar perangkat**. `src/lib/events.ts` menyediakan `track(nama, props)`; di mode dev hanya mencetak ke `console.debug`.

Kejadian yang dicatat: `rencana_dibuat` (jumlah kartu), `kartu_dibuka` (id kartu), `aksi_klik` (jenis aksi dan id kartu), `brief_dibuat` (id kartu). Tidak ada jawaban, hunian, budget, foto, atau isi brief di dalamnya. Props dibersihkan: hanya teks pendek (maks 64 huruf), angka, dan boolean.

Untuk memasang analitik nanti, pilih layanan tanpa cookie dan tanpa profil pengguna (misalnya Plausible atau Umami milik sendiri), lalu daftarkan pengirimnya sekali di `src/main.tsx`:

```ts
import { setPengirim } from "./lib/events";
setPengirim((nama, props) => {
  window.plausible?.(nama, { props }); // contoh; sesuaikan dengan layanan yang dipilih
});
```
Sebelum memasang: perbarui catatan privasi di Beranda (`umum.privasi` di `ui.json`), karena kalimat "tidak dikirim ke mana pun" tidak lagi benar bila ada pengirim.

## Catatan teknis
- Data pengguna hanya di `localStorage` (`transisi:v1`, foto di `transisi:v1:foto`) dan terhapus lewat "Hapus data saya".
- Konten divalidasi dengan zod saat build dan tes. Di peramban produksi zod tidak dimuat (bundel lebih kecil); di mode dev validasi tetap jalan dan galat muncul di konsol.
