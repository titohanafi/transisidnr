# Keputusan

## Milestone 1
- **Tailwind v3** dipilih (bukan v4) karena token desain tetap ada di `tailwind.config.ts`, mudah diganti desainer.
- **Penanda kartu pendamping:** tag `peran: ["caregiver"]` (opsional) ditambahkan ke skema. Engine mengenali pendamping dari tag ini, bukan dari id.
- **Kartu kerangka** (`isi_menyusul: true`) boleh tanpa `kenapa_penting`, `solusi`, `bantuan`, `peran`, `sumber`. Kartu lain wajib punya semuanya. Tag `tingkat_biaya` kartu kerangka dikosongkan karena belum diketahui.
- **Field tambahan** di `asesmen.json`: `penjelasan` (kalimat awam untuk jawaban "ya") dan daftar `aktivitas` dengan `bisaDipilihPrioritas` (umum = false).
- **`onboarding.json`** menyimpan `bulanMaks` per pilihan kejadian (1, 3, 6, tanpa batas) untuk aturan fase awal.
- `ukuran`, `barang` di tingkat solusi opsional. `usaha.waktu` dan `usaha.kesulitan` boleh `null`.
- Kartu `care-assist-transfer`: `kisaran_rp` "Rp 0" (langkahnya tidak memerlukan pembelian), `waktu` null, `sumber` kosong.

## Konten yang wajib diisi ahli
- Halaman "Kapan harus ke dokter atau IGD": daftar tanda bahaya (sementara placeholder).
- Semua kartu masih `draf`; sembilan kartu hanya kerangka.
- Spesifikasi, harga, dan tautan barang di `bath-transfer-toilet`.
- Sumber untuk `care-assist-transfer`.
- Kalimat `penjelasan` di `asesmen.json` dan balasan check-in di `ui.json` ditulis oleh saya sebagai usulan; mohon ditinjau.

## Milestone 2 (mesin)
- **Tanda tangan:** `buatRencana(masukan, kartu, asesmen, config)`. Parameter keempat (`config.json`) ditambahkan karena `faseAwalBulan`, `maksMulaiDariSini`, dan rentang budget dibaca dari sana. Batas bulan kejadian (`kejadianBulanMaks`) diberikan pemanggil, diambil dari `onboarding.json`.
- **Protesis belum dijawab** dihitung sama seperti "belum tahu" (kebutuhan jangka panjang belum jelas), supaya aman.
- **Prioritas** dihitung dari aktivitas pertanyaan yang dijawab ya (bukan dari tag kartu). Kartu dengan prioritas pertama diurutkan lebih dulu; sisanya mengikuti urutan asesmen.
- **Kartu masuk `mulaiDariSini`** bila bukan kerangka dan tingkat pertama yang tampil tidak bertanda "tunggu dulu". Jadi kartu yang hanya punya renovasi tidak masuk di kontrakan/kos atau saat fase awal.
- **Kontrakan/kos:** tingkat permanen disembunyikan (`tampil: false`), bukan sekadar ditandai. Tingkat `alat_tanpa_bongkar` ditonjolkan; urutan tidak berubah.
- **Kartu kerangka** tampil di `daftar` (sebagai "isi menyusul") tetapi tidak di `mulaiDariSini`.
- **Catatan di atas budget:** hanya bila batas bawah kisaran lebih besar dari batas atas budget. Teks kisaran yang tidak terbaca dianggap tidak diketahui (tanpa catatan).
- **Total biaya:** menjumlah kisaran tingkat awal tiap kartu di `daftar` (tanpa kartu pendamping). Bila ada satu yang `null`, kerangka, atau tidak terbaca, hasilnya "tidak diketahui" (UI: "Biaya menyusul"). Dengan konten sekarang total hampir selalu "menyusul" karena kartu kerangka dan kisaran `null`.
- `statusAktivitas` diterima sebagai masukan tetapi belum memengaruhi urutan (tidak ada aturan untuk itu).

## Milestone 3 (beranda dan onboarding)
- **State** disimpan generik: `onboarding` = id pertanyaan -> daftar id pilihan, di kunci `transisi:v1`. Bagian baru (asesmen, checklist, check-in) akan ditambah dengan nilai bawaan, sehingga data lama tetap terbaca. Data rusak atau berbentuk lain diabaikan (kembali kosong), tidak membuat aplikasi error.
- **Langkah onboarding di URL** hanya nomor (`#/mulai/3`); jawaban tidak pernah masuk URL.
- Semua pertanyaan wajib dijawab sebelum "Lanjut" (tombol nonaktif). "Belum ada / belum tahu" untuk alat bantu tidak bisa digabung dengan alat lain.
- Setelah pertanyaan terakhir, pengguna dibawa ke penampung `/asesmen` (dibangun di milestone 4). Mulai ulang dari Beranda menampilkan jawaban sebelumnya.
- "Hapus data saya" memakai konfirmasi dua langkah di dalam halaman (bukan dialog browser).
- Halaman `/igd` sudah ada sebagai placeholder (konten tetap wajib diisi tim medis).
- Tailwind: area sentuh minimum dipasang lewat token `min-h-sentuh` (44px).

## Milestone 4 (asesmen)
- **Rute:** `/asesmen/aktivitas` → `/asesmen/prioritas` → `/asesmen/pertanyaan/N` → `/asesmen/foto` → `/rencana` (penampung sampai milestone 5). Pertanyaan ditampilkan satu per layar, seperti onboarding.
- **Tahap a:** tiap aktivitas (kecuali "umum") punya empat pilihan: "Tidak relevan", "Bisa sendiri", "Bisa, tapi sulit", "Ingin, tapi belum bisa". Minimal satu aktivitas harus dipilih.
- **Tahap b dilewati otomatis** bila kurang dari dua aktivitas yang sulit/ingin. Bila hanya satu, aktivitas itu otomatis menjadi prioritas. Bila tidak ada, hanya pertanyaan umum yang ditanyakan.
- **Konsistensi data:** bila status atau prioritas berubah, jawaban untuk pertanyaan yang tidak lagi ditanyakan dibuang, supaya jawaban "ya" lama tidak memengaruhi rencana.
- **Urutan pertanyaan:** aktivitas prioritas (sesuai urutan prioritas), lalu "umum" di akhir.
- **Foto:** dikecilkan di perangkat (sisi terpanjang 1024 px, JPEG kualitas 0,7; sekitar puluhan KB) dan disimpan di kunci terpisah `transisi:v1:foto`, supaya foto yang besar tidak menggagalkan penyimpanan jawaban. Ikut terhapus oleh "Hapus data saya". Tidak ada yang diunggah.
- Foto tidak ada di skema state; hanya `muatFoto`/`simpanFoto` di `storage.ts`.

## Milestone 5 (Rencana dan Detail kartu)
- **Rute:** `/rencana` dan `/kartu/:id/:tingkat?`. Bila belum ada jawaban asesmen, Rencana mengarahkan ke tahap a.
- **Tombol utama tiap kartu:** satu tombol sesuai tingkat: "Lakukan sendiri" (tanpa biaya), "Lihat alat" (alat tanpa bongkar), "Cari tukang" (renovasi). Tingkat yang dipakai: yang ditonjolkan (kontrakan/kos) bila ada, kalau tidak tingkat pertama yang tampil. **Sementara tombol ini membuka Detail kartu** pada tingkat itu; di milestone 6 diarahkan ke aksi sebenarnya.
- **Rencana** menampilkan: satu hal hari ini, "Mulai dari sini" (maks 3), "Rekomendasi lainnya" (sisa daftar, tanpa duplikat), kartu pendamping, lalu check-in. Total biaya: "Biaya menyusul" bila tidak lengkap.
- **Detail kartu:** akordeon per tingkat (tingkat yang dibuka awal = tombol utama atau tingkat dari URL). Tingkat yang disembunyikan karena hunian tidak ditampilkan; diganti satu catatan "perlu izin pemilik".
- **Angka teknis (`ukuran`)** pada kartu draf diganti catatan "Angka teknis akan tampil setelah ditinjau ahli"; tampil bila flag dev `VITE_TAMPILKAN_ANGKA_DRAF=true` (hanya di mode dev).
- **Barang** di Detail hanya menampilkan nama, cek kecocokan (di atas), spesifikasi, harga/"menyusul", dan label afiliasi. Tombol "Lihat produk" dibuat di milestone 6.
- **Istilah teknis:** `ui.json` punya daftar `istilah` (grab bar, raised toilet seat, anti-slip). Bila teks kartu memuatnya, penjelasan satu kalimat tampil di bagian "Istilah". Kalimat penjelasan ditulis oleh saya dan perlu ditinjau. Daftar ini perlu dilengkapi bila kartu baru memakai istilah lain.
- **Penjelasan jenis bantuan** (tukang, okupasi terapis, dll.) satu kalimat per jenis di `ui.json`, juga usulan saya. "Direktori menyusul" ditampilkan.
- **Check-in** disimpan di state (`checkin` = id pilihan), bisa diganti. Balasan hangat + kalimat penutup dari `ui.json`.
- Data state lama tanpa `checkin` tetap terbaca (nilai bawaan `null`).

## Milestone 6 (aksi)
- **Rute aksi:** `/aksi/sendiri|beli|tukang/:id/:tingkat` dan `/aksi/ahli/:id`; cetak di `/cetak`. Id atau tingkat yang tidak valid mengarah ke Rencana.
- **Tombol utama di Rencana:** tanpa biaya → "Lakukan sendiri"; alat tanpa bongkar → "Lihat alat" (bila tingkat itu tidak punya barang, jatuh ke "Lakukan sendiri"); renovasi → "Cari tukang". Di Detail kartu, tiap tingkat menampilkan semua aksi yang masuk akal (sendiri, beli bila ada barang, tukang bila bukan tingkat tanpa biaya dan kartu menyebut tukang), plus "Tanya ahli" di bagian bantuan.
- **Checklist** disimpan di state (`checklist`, kunci `"<id kartu>:<tingkat>"` → nomor langkah). Nomor langkah dipakai (bukan teks), jadi bila isi langkah diubah tim konten, centang lama bisa bergeser; sengaja dipilih yang paling sederhana.
- **Beli:** cek kecocokan tampil di atas tombol; tombol "Lihat produk" nonaktif bila `link` null (diganti teks "Tautan produk menyusul"). Barang `afiliasi: true` diberi label dan penjelasan. Tautan produk dibuka di tab baru dengan `rel="noopener noreferrer"` (plus `sponsored` untuk afiliasi). **Skema sekarang hanya menerima tautan `http(s)`** (untuk `link` dan `sumber.url`), supaya tautan seperti `javascript:` tidak bisa masuk lewat file konten.
- **Brief tukang:** tersusun dari butir yang bisa dicentang dan disunting (sapaan, ruangan, masalah, yang diinginkan, hunian, budget, foto). Fungsi penyusunnya tidak menerima data medis atau tanggal kejadian, jadi tidak mungkin ikut. Isi "masalah" memakai judul kartu; isi "yang diinginkan" memakai ringkasan dan langkah tingkat terpilih. Catatan "Foto akan dikirim terpisah" hanya muncul bila foto ada. Budget kosong atau "belum tahu" ditulis "belum tahu". Suntingan tidak disimpan (hilang saat halaman ditutup).
- **WhatsApp:** `https://wa.me/?text=<teks ter-encode>` tanpa nomor. Teks di URL itu adalah isi brief yang Anda lihat dan sunting sendiri, bukan data pribadi dari state.
- **Tanya ahli:** menjelaskan jenis ahli dari `bantuan` kartu, "Direktori menyusul", dan pengingat bahwa nyeri, luka, dan protesis tidak dijawab platform.
- **Cetak:** halaman `/cetak` memuat seluruh kartu di rencana (termasuk pendamping), tingkat yang tampil dengan langkahnya (☑/☐ sesuai checklist), peringatan, dan foto. Aturan angka draf tetap berlaku. Tombol dan header disembunyikan lewat `print:hidden`; judul layar sekaligus judul kertas.
- **`track`:** `src/lib/events.ts`, tidak mengirim apa pun bawaannya; props dibersihkan (teks maks 64 huruf, angka, boolean). Dicatat: `rencana_dibuat`, `kartu_dibuka`, `aksi_klik`, `brief_dibuat`. Cara memasang analitik ada di README.

## Milestone 7 (pemolesan)
- **Bundel dikecilkan dari 99,6 KB menjadi 76,4 KB gzip** (JS 72,9 KB + CSS 3,2 KB + HTML 0,3 KB). Zod tidak lagi dimuat di peramban produksi: konten divalidasi saat build (`npm run validasi`) dan di tes; state dari localStorage diperiksa dengan validator tulisan tangan (`parseState`) yang diuji. Di mode dev validasi konten tetap jalan dan galatnya muncul di konsol. Nilai tetap (`TINGKAT`, `AKTIVITAS`, dll.) dipindah ke `src/domain/konstanta.ts` supaya tidak menarik zod. Bundel dipecah menjadi potongan react, router, dan aplikasi untuk cache.
- **Tes kontras** (`tests/kontras.test.ts`) memeriksa pasangan warna di `tailwind.config.ts` terhadap WCAG AA (teks 4,5:1; batas kontrol 3:1; cincin fokus 3:1). Token baru `garisKontrol` untuk batas kolom isian.
- **Tes bahasa** (`tests/bahasa.test.ts`): kata terlarang di `content/` dan larangan teks tertulis di komponen (`.tsx`).
- **Audit aksesibilitas** dijalankan otomatis di 20 rute pada lebar 360 px (tanpa gulir horizontal, area sentuh ≥ 44 px, nama tombol/tautan, label isian, alt gambar, urutan heading, id ganda, ukuran teks, atribut `lang`): semua lolos. Fokus keyboard terlihat (garis 3 px).
- Peringatan non-medis kini memuat tautan ke halaman "Kapan harus ke dokter atau IGD".
- `CLAUDE.md` bagian perintah diperbarui.
- **Tidak diverifikasi:** pembacaan dengan screen reader sungguhan (VoiceOver/TalkBack), perangkat ponsel nyata, cetak ke PDF, dan mode kontras tinggi/zoom 200% milik sistem.

## Perbaikan setelah milestone 7
- **Arah pertanyaan panggil bantuan:** spesifikasi awal menulis "Apakah ada tombol atau cara memanggil bantuan dari kamar mandi?", padahal jawaban "ya" memicu kartu `bath-emergency-call`. Artinya terbalik: orang yang tidak punya tombol menjawab "tidak" dan tidak mendapat kartu. Diubah menjadi "Apakah **tidak ada** tombol atau cara memanggil bantuan dari kamar mandi?" (sejalan dengan pertanyaan pegangan). Ada tes yang menolak pertanyaan berawalan "Apakah ada ..." supaya kesalahan ini tidak terulang.
- Jawaban yang sudah tersimpan untuk `q-umum-panggil` di perangkat pengguna lama punya arti terbalik. Karena belum ada pengguna sungguhan, tidak ada migrasi; bila nanti sudah ada, versi kunci penyimpanan perlu dinaikkan.

## Perbaikan: budget satu sumber
- Sesuai PRD, pilihan budget di onboarding kini dibaca dari `content/config.json`. Sebelumnya label ditulis dua kali (di `onboarding.json` dan `config.json`) sehingga bisa tidak sinkron. Pertanyaan budget di `onboarding.json` memakai `"pilihanDari": "budget"` menggantikan daftar `pilihan`; skema mewajibkan tepat satu dari keduanya. Id pilihan tidak berubah, jadi jawaban yang sudah tersimpan tetap terbaca. Brief tukang juga mengambil label budget dari `config.json`.

## Jalur pintas "Sudah tahu apa yang dicari?" (di luar PRD awal)
- **Alasan:** pengguna yang sudah tahu maunya (cari tukang atau alat) tidak seharusnya dipaksa menjawab semua pertanyaan (prinsip 3, "tidak merepotkan"). PRD menyebut alur satu arah; jalur kedua ini ditambahkan tanpa mengubah alur utama.
- **Layar `/jelajah`** ("Semua kartu"): tautan dari Beranda, di bawah tombol "Mulai". Kartu dikelompokkan per aktivitas (urutan dari asesmen), kartu pendamping di akhir. Filter lewat kolom pilihan: Semua, Cari alat, Cari tukang, Tanya ahli. Filter selain "Semua" hanya menampilkan kartu yang benar-benar punya aksi itu.
- **Tombol aksi langsung** di tiap kartu (Lakukan sendiri, Lihat alat, Cari tukang, Tanya ahli), memakai tingkat paling ringan yang mendukungnya. Tingkat yang tersembunyi karena hunian (kontrakan/kos, bila pengguna sempat menjawab) tidak dipakai. Aksi tukang atau beli yang bertumpu pada tingkat permanen yang ditandai tetap diberi penanda "tunggu dulu".
- **Urutan kartu** dalam kelompok: kartu berisi dulu, baru kerangka, lalu urut id. Tidak bergantung pada tautan atau afiliasi (ada tesnya).
- **Tanpa jawaban onboarding:** brief tukang menghilangkan butir hunian dan menulis "Budget kasar: belum tahu"; kebutuhan jangka panjang dianggap belum jelas, sehingga solusi permanen bertanda "tunggu dulu" (default aman). Jawaban yang sudah ada tetap dihormati.
- **Ajakan** di atas daftar: bila belum ada jawaban asesmen, mengajak mengisi pertanyaan; bila sudah, mengarah ke Rencana. Tombol kembali di Detail kartu menuju Rencana (bila sudah ada jawaban) atau ke semua kartu.
- **Keterbatasan saat ini:** hanya `bath-transfer-toilet` dan kartu pendamping yang punya aksi; sembilan kartu lain tampil sebagai "Isi kartu ini sedang disusun".

## Ilustrasi
- **Bentuk:** SVG sebaris buatan sendiri (`src/components/Ikon.tsx`), bukan berkas gambar atau foto stok. Alasan: ringan untuk kuota rendah (nol permintaan jaringan tambahan, sekitar 4 KB sebelum gzip untuk semuanya), tidak ada isu hak cipta atau lisensi, dan warna mengikuti token di `tailwind.config`.
- **Isi:** hanya benda dan ruang (pancuran, kloset, keran, cermin di atas wastafel, pintu, hati untuk caregiver) plus satu ilustrasi kamar mandi di Beranda (ubin, batang pegangan, bangku mandi, pancuran). **Tanpa gambar orang** (prinsip 1: berdaya, bukan mengasihani; menghindari stereotip) dan **tanpa angka atau ukuran** (aturan: jangan mengarang ukuran).
- **Aksesibilitas:** semua dekoratif (`aria-hidden`), karena artinya sudah ada di teks di sebelahnya. Tes memastikan tidak ada teks, gambar eksternal, atau tautan di dalam SVG, dan ukurannya kecil.
- **Dipakai di:** Beranda (ilustrasi), layar aktivitas asesmen, judul kelompok di "Semua kartu", kartu di Rencana, kartu pendamping, dan Detail kartu. Ikon kartu mengikuti aktivitas pertama di `tag.aktivitas` (kartu pendamping memakai hati), jadi kartu baru otomatis dapat ikon tanpa langkah tambahan.
- **Belum ada:** ilustrasi per kartu (mis. gambar grab bar yang dipasang) dan foto produk. Itu butuh gambar asli yang diizinkan dan ditinjau ahli agar tidak menyesatkan; dibahas di bawah "Yang belum".

- **Revisi ikon:** setelah masukan, ikon kloset tidak lagi memakai batang pegangan, ikon grooming diganti cermin persegi di atas wastafel berkeran (versi awal terbaca seperti perahu), dan ikon umum diganti pintu polos dengan gagang (versi awal dengan tanda panggilan tidak terbaca). Ikon dinilai lewat tampilan diperbesar di browser.

- **Revisi ilustrasi Beranda:** ilustrasi kamar mandi diganti ilustrasi umum disabilitas kaki: kursi roda, sepasang kruk, dan walker (sama dengan pilihan alat bantu di onboarding). Tetap hanya benda, tanpa gambar orang dan tanpa protesis (platform tidak menjawab soal protesis).

## Perbaikan UX Beranda dan istilah "kartu"
- **Beranda:** dua jalur kini setara dan sama-sama terlihat di layar ponsel tanpa menggulir: "Susun rencana untuk saya" (tombol Mulai) dan "Saya sudah tahu yang dicari" (tombol Cari alat, Cari tukang, Tanya ahli, plus "Lihat semua panduan"). Tiga langkah "cara kerja" dipindah ke bagian lipat "Cara kerja Transisi", dan ilustrasi dipindah ke bawah supaya kedua jalur tidak terdorong keluar layar.
- **Jalur langsung berfilter:** `/jelajah/alat`, `/jelajah/tukang`, `/jelajah/ahli` membuka daftar yang sudah disaring; `/jelajah` menampilkan semua. Alamat dengan filter yang tidak dikenal jatuh ke "semua".
- **Istilah:** di antarmuka, "kartu" diganti **"panduan"** (mis. "Semua panduan", "Buka panduan", "Isi panduan ini sedang disusun"). "Kartu" tetap dipakai secara internal (nama folder `content/kartu/`, kunci JSON, README untuk tim konten). Ada tes yang menolak kata "kartu" di teks `ui.json`.
- **Belum diuji dengan pengguna nyata:** apakah "panduan" paling mudah dipahami dan apakah dua jalur setara membingungkan pengguna baru. Perlu dicoba ke beberapa caregiver.

## Halaman IGD (setelah council)
- Halaman `/igd` sekarang digerakkan oleh konten: `igd.tandaBahaya` di `content/ui.json` (daftar teks). Selama daftar kosong, halaman menampilkan `igd.menyusul` (arahan umum: hubungi dokter atau IGD terdekat bila ragu). Begitu daftar diisi, halaman menampilkan daftar dengan lencana "Draf, belum ditinjau ahli".
- **Tidak ada tanda bahaya, nomor darurat, atau klaim medis yang saya tulis.** Semua wajib diisi dan ditinjau tenaga medis (dokter rehabilitasi medik / prostetis-ortotis).
- Belum dikerjakan: menampilkan peringatan darurat di semua layar (perlu keputusan desain dan isi dari tim medis).

## Jelajah: tombol aksi tidak lagi berulang (setelah council)
- Daftar `/jelajah` dengan saringan "Semua": kartu hanya punya "Buka panduan". Langkah, alat, tukang, dan bantuan sudah ada di panduan.
- Dengan saringan Cari alat / Cari tukang / Tanya ahli: kartu menampilkan satu tombol aksi sesuai saringan (jalur pintas) dan "Buka panduan" menjadi tombol kedua.
- "Lakukan sendiri" tidak ditampilkan di daftar karena itu isi panduan. Tombol "Tanya ahli" di panduan tetap satu kali, di bagian "Siapa yang bisa membantu".
