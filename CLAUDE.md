# Transisi

Platform web mobile-first untuk caregiver dan penyandang disabilitas yang baru mengalami amputasi kaki. Tujuannya mengubah panduan menjadi rencana yang bisa dikerjakan: menilai kebutuhan di rumah, lalu membeli alat, memanggil tukang, atau bertanya ke ahli, dalam satu alur.

MVP hanya mencakup: kamar mandi, pengguna kursi roda (kruk dan walker bila ada waktu), tanpa login, tanpa server.

## Pengguna
- **Penyandang disabilitas**: pemegang keputusan. Memilih aktivitas yang paling penting dan solusi yang diinginkan.
- **Caregiver**: pelaksana. Belanja, pasang, koordinasi, dan membantu tanpa mengambil alih. Sering lelah dan kewalahan; sering memakai ponsel dengan satu tangan dan kuota terbatas.

## Prinsip produk (jangan dilanggar)
1. Berdaya, bukan mengasihani. Tidak ada visual atau kata "korban".
2. Mulai dari yang paling ringan: tanpa biaya, lalu alat tanpa bongkar, lalu renovasi/jasa.
3. Tidak merepotkan. Pertanyaan ya/tidak, tanpa pengukuran, foto opsional. Beranda Rencana menampilkan "satu hal untuk hari ini".
4. Rekomendasi dulu, penjualan belakangan. Urutan rekomendasi tidak boleh dipengaruhi pembayaran. Link afiliasi selalu diberi label.
5. Utamakan yang bisa dibatalkan. Kebutuhan pasca-amputasi sering berubah (kursi roda ke protesis). Solusi sementara tampil lebih dulu; solusi permanen ditandai.
6. Caregiver juga didampingi: ada satu kartu pendamping dan satu pertanyaan check-in.

## Bahasa dan nada
- Bahasa Indonesia, sapaan "Anda", kalimat pendek, tanpa jargon. Istilah teknis (grab bar, raised toilet seat, roll-in shower) selalu dijelaskan dengan satu kalimat.
- Pakai: "penyandang disabilitas", "orang tanpa disabilitas", "pengguna kursi roda", "caregiver".
- Hindari: "orang normal", "cacat", "disable", "korban", "penderita", "kasihan".
- Semua teks antarmuka disimpan di `content/ui.json` (bukan di komponen) supaya tim non-teknis bisa mengedit.

## Aturan konten (keras)
- **Jangan mengarang** ukuran, harga, spesifikasi, angka, tautan produk, atau klaim medis. Bila tidak diberikan di prompt atau file konten, isi `null` atau "menyusul" dan laporkan.
- Semua kartu punya `status_validasi`: `draf`, `ditinjau_ahli`, `disetujui`. Angka teknis (field `ukuran`) hanya tampil bila status bukan `draf`, kecuali flag dev `TAMPILKAN_ANGKA_DRAF=true`.
- Kartu `draf` menampilkan lencana "Draf, belum ditinjau ahli".
- Nyeri, luka, dan protesis tidak dijawab oleh platform. Arahkan ke dokter rehabilitasi medik atau prostetis-ortotis.
- Konten dipisah dari kode: kartu ada di `content/kartu/*.json`, divalidasi dengan zod.

## Aturan teknis
- Vite + React 18 + TypeScript (strict) + Tailwind + React Router (HashRouter agar bisa dihosting statis) + Zod + Vitest.
- Tanpa backend, **kecuali** fitur Pindai (`api/pindai.ts`, fungsi Vercel yang meneruskan foto ke Gemini; lihat DECISIONS.md). State disimpan di localStorage dengan kunci berversi (`transisi:v1`). Tombol "Hapus data saya" wajib ada.
- Tidak ada data yang dikirim keluar perangkat. Jangan menaruh data pribadi di URL atau query string.
- Mobile-first (lebar 360px), area sentuh minimal 44x44px, aman dipakai satu tangan.
- Aksesibilitas WCAG 2.2 AA: kontras, fokus terlihat, label formulir, tidak mengandalkan warna saja, bisa dipakai dengan screen reader.
- Ringan untuk kuota rendah: tanpa gambar besar, tanpa pustaka berat, satu font atau font sistem. **Pengecualian disetujui**: `three` (Three.js) untuk rendering 3D denah isometrik Pindai (gambar oleh kode SVG tangan terbukti gagal untuk benda kompleks seperti kloset setelah 3+ percobaan — lihat DECISIONS.md). Pengecualian ini TIDAK berlaku untuk bagian lain aplikasi; aturan "tanpa pustaka berat" tetap berlaku di luar rendering isometrik 3D ini.
- Design token (warna, font, radius, spasi) dipusatkan di `tailwind.config` agar desainer bisa menggantinya. Nada visual: tenang, klinis tapi hangat, kontras tinggi.
- Logika rekomendasi adalah fungsi murni di `src/domain/engine.ts` dengan tes unit.

## Struktur folder
```
content/        kartu/*.json, asesmen.json, onboarding.json, config.json, ui.json
src/domain/     tipe, skema zod, engine
src/state/      store dan penyimpanan lokal
src/screens/    layar
src/components/ komponen bersama
src/lib/        brief WhatsApp, cetak, events
tests/
```

## Cara bekerja
- Rencanakan dulu, lalu kerjakan per milestone. Setelah tiap milestone: jalankan tes, lint, dan typecheck; commit dengan pesan jelas; berhenti dan ringkas untuk saya.
- Jelaskan dalam bahasa Indonesia sederhana. Saya desainer, bukan engineer.
- Bila ada keputusan yang tidak ada di dokumen ini, pilih opsi paling sederhana dan catat di `DECISIONS.md`.
- Di akhir tiap milestone, daftarkan hal yang Anda asumsikan atau tidak bisa diverifikasi.

## Perintah (perbarui setelah scaffold)
- `npm run dev`, `npm run build` (validasi konten + typecheck + build), `npm test`, `npm run lint`, `npm run typecheck`, `npm run validasi` (hanya periksa `content/`), `npm run format` (rapikan kode dengan Prettier), `npm run format:cek`
- Mode dev: `VITE_TAMPILKAN_ANGKA_DRAF=true npm run dev` menampilkan angka teknis kartu draf
- Mode dev: `VITE_PINDAI_MOCK=true npm run dev` membuat fitur Pindai memakai hasil tiruan, tanpa memanggil `api/pindai.ts`/Gemini (tidak perlu kunci API, tidak kena kuota)
