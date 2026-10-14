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

## Poles tampilan (setelah council)
- **Panduan "isi menyusul"** tampil sebagai baris ringkas bergaris putus (`KartuKerangka`) di Rencana dan Jelajah, tanpa lencana draf berulang dan tanpa tombol besar. Seluruh baris adalah tautan ke panduan. Tujuannya: panduan yang sudah berisi tidak tenggelam oleh kerangka.
- **Bilah kemajuan** onboarding dan asesmen diganti segmen (`BilahKemajuan`) dengan token warna, bukan elemen `<progress>` bawaan peramban. Teks "Pertanyaan n dari N" tetap ada, jadi informasi tidak hanya lewat warna.
- **Catatan non-medis** diberi garis kiri dan latar teal muda supaya terbaca sebagai catatan, bukan kartu konten.
- Belum disentuh: Beranda, halaman Detail panduan, Rencana bagian atas. Perlu keputusan Anda (lihat ringkasan).

## Halaman panduan lebih ringan dibaca (setelah council)
- Komponen `Lipat` (details/summary asli): "Kenapa penting", "Istilah", dan "Sumber" tertutup secara bawaan. Isi tidak diubah.
- "Situasi" jadi kotak teal muda di atas. Catatan non-medis dipindah ke bawah halaman panduan (tetap ada, tetap menaut ke halaman IGD); di Rencana tetap di atas.
- Tiap tingkat solusi menampilkan ringkasan, biaya, dan waktu di kepala akordeon (terlihat tanpa dibuka). Langkah bernomor lingkaran. Baris "Usaha" menggantikan tabel biaya/waktu/kesulitan di dalam panel.

## Beranda visual-dulu (setelah council)
- Beranda dirombak agar muat satu layar ponsel dengan sedikit teks: kalimat pembuka dipersingkat, ilustrasi dipindah ke atas, jalur dipandu jadi kartu teal dengan satu tombol, jalur langsung jadi tiga ubin berikon (alat, tukang, ahli), cara kerja jadi tiga langkah satu baris (judul saja).
- Ikon `alat`, `tukang`, `ahli` ditambahkan ke `Ikon.tsx` (SVG sebaris, dekoratif, tanpa gambar orang). Ikon ini sketsa awal; desainer sebaiknya menggantinya.
- Kalimat deskripsi langkah "cara kerja" dan "Langsung ke yang Anda butuhkan" tidak lagi ditampilkan (tetap ada di `ui.json` karena skema masih mewajibkan).

## "Siapa yang bisa membantu" pindah ke halaman Tanya ahli
- Di panduan, bagian "Siapa yang bisa membantu" dihapus; diganti satu tombol "Tanya ahli" (hanya bila panduan punya saran bantuan). Daftar jenis ahli, artinya, dan "Direktori menyusul" hanya ada di halaman `/aksi/ahli/:id`, jadi tidak ada duplikasi dan panduan lebih pendek.
- Saringan "Tanya ahli" di Jelajah kembali menampilkan tombol "Tanya ahli" (kembali ke perilaku sebelumnya).

## Rencana lebih ringkas (setelah council)
- Prioritas tampil sebagai lencana (Wudhu, Grooming) sejajar dengan "Ubah jawaban", bukan kalimat.
- Catatan non-medis dipindah ke bawah halaman (konsisten dengan halaman panduan).
- "Biaya menyusul" tidak lagi ditampilkan sebagai baris sendiri; total biaya hanya tampil bila diketahui. Biaya per panduan tetap tampil di halaman panduan.
- Panduan kerangka dipisah ke lipatan "Sedang disusun (n)" supaya tidak menenggelamkan panduan berisi. Bila belum ada panduan berisi untuk prioritas Anda, ada catatan "Panduan untuk prioritas Anda belum siap" dan lipatan itu terbuka.
- Teks baru (`rencana.sedangDisusun`, `rencana.belumAdaSiap`) ditulis oleh saya sebagai usulan; mohon ditinjau.

## Isi konten PoC (atas permintaan pemilik, belum ditinjau ahli)
- Pemilik meminta semua konten diisi untuk PoC walau bukan ahli yang menulis. Sembilan kartu kerangka sekarang berisi: kenapa penting, tiga tingkat solusi (tanpa biaya, alat tanpa bongkar, renovasi) dengan langkah, bantuan, peran, dan peringatan. **Semua tetap `draf`** dan tampil dengan lencana "Draf, belum ditinjau ahli".
- **Tetap `null` / menyusul (tidak dikarang):** ukuran dan angka teknis, harga, waktu pengerjaan, spesifikasi barang ("Menyusul setelah survei."), tautan produk, dan sumber (daftar kosong). `biaya` hanya "Rp 0" untuk tingkat tanpa biaya.
- **Halaman IGD** berisi delapan tanda bahaya umum yang saya tulis sebagai draf. Tidak ada nomor telepon darurat. Wajib ditinjau dokter rehabilitasi medik atau prostetis-ortotis sebelum dirilis ke pengguna sungguhan.
- **Istilah** ditambah: papan pindah, roll-in shower, ramp (penjelasan ditulis saya, perlu ditinjau).
- Tes disesuaikan: tidak lagi bergantung pada kartu mana yang masih kerangka; memakai kartu kerangka sintetis. Total biaya langkah pertama kini "Rp 0" karena semua tingkat awal tanpa biaya.
- Karena tidak ada lagi kartu kerangka, lipatan "Sedang disusun" di Rencana tidak akan muncul untuk konten sekarang.

## Lencana "Draf, belum ditinjau ahli" disembunyikan (keputusan pemilik, PoC)
- `LencanaStatus` tidak menampilkan apa pun untuk status `draf` di semua layar (Rencana, Jelajah, Panduan, Cetak, IGD). Lencana "Ditinjau ahli" dan "Disetujui" tetap tampil bila statusnya berubah.
- Status `draf` tetap tersimpan di setiap kartu dan aturan angka teknis (`ukuran` hidden untuk draf) tetap berlaku.
- Ini menyimpang dari aturan di `CLAUDE.md` ("Kartu `draf` menampilkan lencana"). Sebelum dirilis ke pengguna sungguhan, kembalikan lencana ini atau tambahkan penanda draf yang lain.

## Nada lebih hangat (setelah umpan balik "kaku")
- Teks ditulis ulang agar terasa seperti didampingi, tanpa mengasihani dan tanpa mengambil keputusan dari pengguna: sapaan di Beranda ("Halo. Perubahan besar butuh waktu..."), "Mari susun rencananya" / "Mari mulai", kalimat pendek penenang di tiap pertanyaan onboarding, ucapan terima kasih di Rencana, catatan "Cukup ini dulu. Sisanya bisa menunggu." di bawah satu hal hari ini, dan judul caregiver "Untuk Anda yang mendampingi".
- Sudut kartu dan tombol dibulatkan sedikit (token `borderRadius` di `tailwind.config.ts`: kartu 16px, tombol 12px).
- Semua kalimat baru ditulis oleh saya sebagai usulan; mohon ditinjau, terutama oleh caregiver atau penyandang disabilitas sungguhan.

## Aplikasi yang menanggapi pengguna (bukan teks statis)
- **Salam dinamis di Beranda:** "Selamat pagi/siang/sore/malam" menurut jam di perangkat (`src/lib/waktu.ts`, diuji), diikuti kalimat yang menyesuaikan jawaban "Siapa yang mengisi?" (penyandang, caregiver, berdua, atau belum mengisi).
- **Balasan atas tiap jawaban onboarding:** opsi di `content/onboarding.json` boleh punya `respons`; muncul sebagai gelembung hangat dengan animasi halus saat dipilih (hanya bila perangkat tidak meminta gerakan dikurangi).
- **Checklist "Lakukan sendiri":** dorongan berubah menurut kemajuan (satu langkah, separuh jalan, selesai).
- **Rencana menanggapi check-in:** bila caregiver memilih capek fisik, capek emosi, atau butuh istirahat, Rencana menampilkan catatan dan hanya satu hal untuk hari ini; sisa rekomendasi masuk lipatan "Lihat yang lain nanti". Rencana juga menampilkan jumlah langkah yang sudah diselesaikan.
- Belum dikerjakan: nama panggilan opsional (perlu menambah kolom di state), dan ilustrasi yang berubah mengikuti jawaban.
- Semua kalimat baru adalah usulan saya dan perlu ditinjau.

## Hasil per panduan: rencana yang berubah menurut apa yang benar-benar terjadi
- Menggantikan teks sapaan statis. Setelah semua langkah "Lakukan sendiri" dicentang, pengguna memilih "Sudah cukup" atau "Masih sulit".
  - **Sudah cukup:** panduan masuk lipatan "Sudah beres" di Rencana dan hilang dari "Mulai dari sini".
  - **Masih sulit:** "Satu hal untuk hari ini" dan tombol utama kartu pindah ke tingkat berikutnya (tanpa biaya, lalu alat, lalu renovasi; tingkat tersembunyi dilewati). Bila sudah tingkat terakhir, pengguna diarahkan ke Tanya ahli.
- Rencana menampilkan "n dari N panduan beres" dengan bilah kemajuan.
- Disimpan di state: `hasil[idPanduan] = { status, tingkat }`; `parseState` memvalidasi dan menolak bentuk yang salah. Logika ada di `src/domain/hasil.ts` (fungsi murni, ada tes). Mesin rekomendasi (`engine.ts`) tidak diubah.
- Sapaan statis dihapus (`rencana.sapaan`, `rencana.satuHalCatatan`, `beranda.sapaan`) beserta kalimat penenang tambahan di onboarding; yang dipertahankan hanya yang berubah menurut jawaban atau keadaan (salam menurut jam dan peran, balasan tiap jawaban, dorongan checklist, mode ringan saat lelah).
- Belum ada: hasil untuk aksi "beli" dan "tukang" (hanya "Lakukan sendiri" yang mencatat hasil).

## Beranda tanpa teks pembuka
- Salam dan kalimat pembuka di Beranda dihapus; layar langsung dimulai dari ilustrasi dan dua jalur. Fungsi `bagianHari` dan teks `salam`, `salamPeran`, `manfaat` ikut dihapus karena tidak dipakai lagi.

## Beranda: konteks singkat dan janji data
- Karena aplikasi tanpa login, Beranda kembali menjelaskan konteks dengan satu kalimat (untuk siapa dan untuk apa) dan tiga lencana janji: "Tanpa login", "Tersimpan di perangkat Anda", "Tidak dikirim ke mana pun". Menggantikan sapaan dan kalimat privasi yang sebelumnya di bagian bawah.
- Kalimat konteks adalah usulan saya; mohon ditinjau.

## Asesmen lebih ringkas dan jelas (setelah umpan balik)
- **Aktivitas:** tiap aktivitas jadi satu kartu dengan pil pilihan yang membungkus (bukan empat baris besar), sehingga layar jauh lebih pendek. "Tidak relevan" tetap ada sebagai pil terakhir. Memakai `role="radiogroup"` dan radio asli yang tersembunyi secara visual, jadi tetap bisa dipakai dengan keyboard dan pembaca layar.
- **Prioritas:** ada ikon aktivitas dan nomor urutan (1, 2) pada pilihan yang dipilih.
- **Pertanyaan:** penjelasan "Artinya" tampil sejak awal (bukan hanya setelah menjawab "Ya") supaya pengguna paham sebelum menjawab; Ya/Tidak berdampingan; ikon aktivitas di atas.
- **Foto:** keadaan kosong berupa kotak bergaris putus dengan ikon kamera sebagai tombol utama. Belum diperiksa secara visual saat belum ada foto.

## Lencana janji data dihapus dari Beranda
- Tiga lencana ("Tanpa login", "Tersimpan di perangkat Anda", "Tidak dikirim ke mana pun") dihapus atas permintaan pemilik. Kalimat konteks satu baris tetap ada. Janji data tetap tertulis di halaman "Hapus data saya".

## Teks tidak lagi terikat ke kamar mandi (arah: lebih dari satu ruangan)
- Teks antarmuka yang bersifat umum dibuat netral: konteks Beranda ("menyesuaikan rumah"), judul asesmen, foto ("Foto ruangan"), judul kertas cetak ("Rencana adaptasi rumah"), judul keadaan kosong Rencana.
- Nama ruangan di brief tukang kini dibaca dari tag `ruangan` tiap panduan lewat peta `ruangan` di `content/ui.json` (`kamar_mandi` → "Kamar mandi"); ruangan baru cukup menambah satu baris di peta itu.
- **Yang masih terikat ke kamar mandi (butuh keputusan sebelum menambah ruangan):** daftar aktivitas di asesmen (`AKTIVITAS` di `src/domain/konstanta.ts`: mandi, toilet, wudhu, grooming, umum), `content/asesmen.json` yang berupa satu asesmen, pengelompokan Jelajah per aktivitas, dan ikon aktivitas. Rancangan yang disarankan: langkah "pilih ruangan" sebelum asesmen, satu berkas asesmen per ruangan, dan aktivitas yang dimiliki tiap ruangan. Aturan di `CLAUDE.md` ("MVP hanya kamar mandi") belum diubah.

## Langkah memilih ruangan (selaras dengan arah "adaptasi rumah")
- Alur baru: Beranda → onboarding → **Pilih ruangan** (`/ruangan`) → asesmen → Rencana. Daftar ruangan ada di `content/config.json` (`ruangan: [{ id, nama, tersedia }]`); ruangan dengan `tersedia: false` tampil redup dengan tanda "Segera" dan tidak bisa dipilih.
- Ruangan terpilih disimpan di state (`ruangan`). Bila hanya satu ruangan yang tersedia, dipakai otomatis (`useRuangan`), jadi pengguna tetap mendapat satu layar pilihan tetapi tidak terjebak bila belum memilih.
- Asesmen dan Rencana menampilkan "Ruangan: Kamar mandi" dengan tautan "Ganti". Nama ruangan di brief tukang dibaca dari `config.json` (peta nama di `ui.json` dihapus).
- **Nama ruangan lain (Kamar tidur, Dapur, Akses masuk rumah) adalah usulan saya**; ganti sesuai rencana Anda di `config.json`.
- Belum dikerjakan: asesmen per ruangan (aktivitas masih tertanam untuk kamar mandi), Jelajah yang dikelompokkan per ruangan, ikon ruangan. `CLAUDE.md` ("MVP hanya kamar mandi") belum diubah.

## "Cari alat" dan "Tanya ahli" menampilkan daftarnya langsung
- `/jelajah/alat` menampilkan **daftar alat** dari semua panduan (digabung menurut nama; tiap alat memuat cara cek kecocokan, spesifikasi, harga, tombol produk, tanda afiliasi, dan tautan ke panduan tempat alat itu dipakai). Hanya tingkat yang tampil yang dipakai, dan urutan tidak dipengaruhi tautan atau afiliasi (diuji).
- `/jelajah/ahli` menampilkan **jenis ahli** (okupasi terapis, fisioterapis, arsitek, komunitas) dengan penjelasan satu kalimat dan daftar panduan yang mereka bantu. Tukang tidak dihitung di sini (jalurnya sendiri). "Direktori menyusul" dan catatan nyeri/luka/protesis tampil di bawah.
- `/jelajah/tukang` tetap berupa daftar panduan yang melibatkan tukang.
- Fungsi murni `kumpulkanAlat` dan `kumpulkanAhli` di `src/domain/jelajah.ts`, diuji.
- Hero Beranda dipendekkan: "Panduan dan rencana menyesuaikan rumah untuk pengguna kursi roda."

## Ilustrasi Beranda dihapus
- Ilustrasi kursi roda, kruk, dan walker di hero dihapus atas permintaan pemilik (komponen `IlustrasiBeranda` dan tesnya ikut dibuang). Ikon aktivitas dan ikon aksi tetap dipakai di layar lain.

## Jelajah lebih ringkas
- Dropdown "Tampilkan" diganti pil pilihan (Semua, Cari alat, Cari tukang, Tanya ahli) yang langsung terlihat.
- Di "Semua" dan "Tanya ahli", panduan tampil sebagai baris ringkas yang seluruhnya bisa disentuh (`KartuBaris`), bukan kartu dengan tombol besar. Di "Cari tukang" kartu tetap membawa tombol "Cari tukang".
- Ajakan "Lihat Rencana Saya / Mulai pertanyaan" dipindah ke bawah daftar supaya daftar muncul lebih dulu.
- Daftar alat: bila spesifikasi dan harga sama-sama belum ada, cukup satu baris "Spesifikasi dan harga menyusul."; tombol "Lihat produk" yang nonaktif tidak ditampilkan, hanya catatan "Tautan produk menyusul."
- Beranda: teks "Atau lewati pertanyaan, langsung cari:" tidak lagi tampil (tetap ada untuk pembaca layar sebagai judul tersembunyi).

## Ajakan survei dan seminar pilot di Beranda
- Di bawah judul "Buat rencana untuk rumah Anda" kini ada kalimat: "Isi beberapa pertanyaan survei ini dan dapatkan kesempatan mengikuti seminar pilot kami." Nama dan tanggal acara tidak disebut karena belum diberikan.
- **Belum ada mekanisme untuk menepati janji itu.** Aplikasi tidak mengirim apa pun keluar perangkat, jadi tidak ada cara mendaftarkan atau mengenali orang yang sudah mengisi. Perlu diputuskan: tautan formulir pendaftaran terpisah (dibuka di tab baru, tidak membawa data aplikasi), kode atau layar penutup yang bisa ditunjukkan, atau hal lain. Sampai itu ada, kalimat ini menjanjikan sesuatu yang tidak bisa diverifikasi.

## Tampilan seperti aplikasi ponsel
- Header menempel di atas. Di layar dalam (kartu, aksi, dan sebagainya) ada tombol panah kembali ke halaman sebelumnya.
- Bilah tab menempel di bawah dengan empat menu: Beranda, Panduan (`/jelajah`), Rencana, Darurat (`/igd`). Teksnya ada di `content/ui.json` (`umum.tab*`). "Hapus data saya" tetap di Beranda.
- Bilah tab disembunyikan di alur pertanyaan (`/mulai`, `/ruangan`, `/asesmen`) dan cetak, karena alur itu punya tombol Kembali/Lanjut sendiri di bawah.
- Komponen `BilahTab` (menu utama) berbeda dari `NavBawah` (tombol Kembali/Lanjut alur pertanyaan).

## Latar di luar area aplikasi
- Di layar lebar, area aplikasi (lebar maksimal 28rem) memakai warna `kertas`, sedangkan latar di sekelilingnya memakai token baru `luar` (#DCE3E5, abu kebiruan lembut) dengan garis tepi dan bayangan tipis. Warna bisa diganti di `tailwind.config.ts`.

- Warna latar area aplikasi (`kertas`) diubah dari krem #FAF8F5 menjadi putih #FFFFFF atas permintaan pemilik.

## Check-in caregiver pindah ke Beranda
- Pertanyaan "Apa yang paling berat minggu ini?" kini ada di Beranda (di bawah dua jalur, di atas tautan kecil), bukan di Rencana, karena caregiver adalah tujuan utama. Jawabannya tetap tersimpan di state yang sama, jadi Rencana tetap menyesuaikan diri (misalnya menampilkan satu hal saja bila caregiver lelah). Kartu pendamping tetap di Rencana.

## Check-in di paling atas Beranda, bahasa lebih hangat
- Check-in kini di paling atas Beranda, dalam kartu hangat (latar `aksen-muda`). Pertanyaan: "Bagaimana perasaan Anda hari ini?", dengan sapaan singkat di bawahnya ("Merawat itu pekerjaan yang besar. Anda juga penting.").
- Pilihan ditulis sebagai perasaan: Tubuh terasa lelah, Hati terasa penuh, Bingung harus mulai dari mana, Khawatir soal biaya, Ingin istirahat sebentar. Kunci (`id`) tidak berubah, jadi jawaban lama dan logika Rencana tetap jalan.
- Tetap memakai sapaan "Anda" (bukan "kamu") sesuai pedoman bahasa proyek.

## Check-in harian lebih ringan, dengan riwayat
- Tampilan check-in dikecilkan: kartu putih bergaris tipis, label kecil, satu pertanyaan, pilihan berbentuk pil. Balasan tampil sebagai teks kecil. Sapaan tambahan dihapus.
- Jawaban kini dicatat per hari (tanggal lokal perangkat) di `riwayatCheckin` (`YYYY-MM-DD` -> id). Bagian "Riwayat 7 hari terakhir" dilipat dan baru muncul setelah ada satu jawaban; hari tanpa jawaban tertulis "Belum diisi". Disimpan paling banyak 90 hari. Data lama tetap sah (bidang baru opsional, tetap `transisi:v1`).
- Rencana kini hanya melihat jawaban **hari ini** untuk mode "satu hal saja". Sebelumnya jawaban terakhir berlaku selamanya. Bidang `checkin` (jawaban terakhir) masih disimpan tetapi tidak dipakai layar.
- Riwayat berupa daftar teks, belum grafik: sederhana, ringan, dan bisa dibaca pembaca layar. Tidak ada skor atau tren, sesuai aturan platform.

## Riwayat check-in berbentuk ikon per hari
- Riwayat 7 hari kini berupa deretan tujuh lingkaran (lama ke baru, kiri ke kanan) dengan nama hari di atas dan tanggal di bawah. Hari ini diberi cincin dan nama tebal. Hari tanpa jawaban berupa lingkaran putus-putus.
- Satu ikon garis per jawaban, bentuknya berbeda (bukan hanya warna): baterai (tubuh lelah), hati (hati penuh), tanda tanya (bingung), koin (biaya), bulan (istirahat). Sengaja bukan wajah dan bukan skor. Di bawah deretan ada legenda "Arti ikon".
- Pembaca layar membaca teks per hari (mis. "Hari ini: Hati terasa penuh"); ikon disembunyikan dari pembaca layar.
- Ikon dibuat sendiri sebagai SVG sederhana; desainer bisa menggantinya di `src/components/IkonCheckin.tsx`.

## Riwayat check-in memakai emoji
- Ikon gambar sendiri diganti emoji (tanpa berkas gambar, nol beban kuota). Emoji ada di `content/ui.json` (`checkin.pilihan[].emoji`) sehingga tim non-teknis bisa menggantinya: 🥱 tubuh lelah, 😔 hati penuh, 😕 bingung, 😟 khawatir biaya, 😴 istirahat. Komponen `IkonCheckin` dihapus.
- Emoji juga tampil di pil pilihan. Di riwayat, emoji disembunyikan dari pembaca layar dan diganti teks per hari.
- Catatan: tampilan emoji berbeda antar perangkat dan versi Android. Emoji dipilih yang lama dan luas didukung. Wajah tetap dipakai atas permintaan pemilik, tanpa skor atau tren.

## Check-in dua keadaan
- **Belum diisi hari ini:** kartu hijau muda dengan pertanyaan dan lima ubin emoji (emoji besar + satu kata: Lelah, Penuh, Bingung, Biaya, Istirahat). Label panjang tetap dibaca pembaca layar. Ubin berupa tombol dengan `aria-pressed`.
- **Sudah diisi hari ini:** mengecil jadi satu baris putih: emoji, "Hari ini: <jawaban>", satu kalimat balasan, dan tombol "Ubah". Riwayat 7 hari dilipat di bawahnya. Kalimat penutup ("Bila terasa berat terus...") ikut dilipat di dalam riwayat, tidak lagi tampil langsung.
- Kata singkat ada di `content/ui.json` (`checkin.pilihan[].singkat`).

## Check-in: kartu lebih lega, setiap perasaan punya bantuan
- Setelah diisi, kartu dirapikan: tombol "Ubah" jadi tautan teks, dan ada satu tombol bantuan lebar sesuai perasaan. Garis pemisah riwayat dihapus supaya tidak terasa penuh.
- Bantuan per perasaan (semua ke halaman yang sudah ada, tidak ada konten baru): Tubuh lelah -> Rencana ("satu hal untuk hari ini"); Hati penuh -> panduan pendamping `care-assist-transfer`; Bingung -> `/mulai/1`; Biaya -> `/jelajah` (tanpa biaya didahulukan di tiap panduan); Istirahat -> `/jelajah/ahli`.
- **Perlu ditinjau:** panduan pendamping membahas mendampingi saat pindah, bukan dukungan emosi. Untuk "Hati terasa penuh" belum ada panduan yang pas; ganti `bantuan` di `content/ui.json` bila tim konten menambah satu.

- Check-in dipindah lagi ke bawah tombol "Lihat semua panduan" (di atas tautan kecil) atas permintaan pemilik; menggantikan keputusan "paling atas" sebelumnya.

- Kartu "Buat rencana untuk rumah Anda" di Beranda kini punya ikon papan catatan (dalam lingkaran putih) dan deskripsi singkat: "Jawab ya atau tidak, tanpa mengukur. Anda akan mendapat langkah yang sesuai dengan rumah Anda." Isinya mengikuti prinsip produk (ya/tidak, tanpa pengukuran), tanpa klaim baru. Sebelumnya deskripsi sempat dihapus atas permintaan pemilik; ini menggantikannya.

## Ikon Beranda dari pustaka Lucide
- Atas permintaan pemilik, ikon di Beranda tidak lagi digambar sendiri: Papan catatan (Buat rencana), Kunci pas (Cari alat), Palu (Cari tukang), Gelembung percakapan (Tanya ahli), semuanya dari `lucide-react` (lisensi ISC), diimpor satu per satu. Pembungkusnya `src/components/IkonBeranda.tsx`.
- Dampak ukuran: JS naik sekitar 3,5 kB gzip (30,5 -> 33,9 kB). Ini menambah satu dependensi di luar daftar teknis awal; bila dianggap berat, ikon bisa diganti emoji atau disalin sebagai SVG sebaris.
- Ikon di layar lain (aktivitas, foto) masih buatan sendiri; belum diganti karena yang diminta hanya Beranda.
- Ikon di kartu Buat rencana dipindah ke atas judul.

## "Cari tukang" diganti "Pesan ke tukang"
- Fitur ini hanya membuat draf pesan WhatsApp, bukan daftar tukang, jadi namanya diganti agar tidak menjanjikan daftar. Berlaku di Beranda, saringan Panduan, tombol aksi, dan judul layar ("Pesan untuk tukang"). Bila nanti ada direktori tukang, nama lama bisa dipakai lagi untuk itu.

## Ikon aktivitas dari Lucide
- Ikon aktivitas (Mandi: kepala pancuran, Toilet: kloset, Wudhu: tetesan air, Merapikan diri: kilau, Umum: pintu terbuka) dan ikon pendamping (dua tangan berjabat dengan hati) kini dari `lucide-react`. Komponen `Ikon` tetap sama, sehingga semua layar ikut berganti.
- Pilihan "Merapikan diri" dan "Umum" adalah tafsiran saya karena Lucide tak punya ikon cermin-wastafel; bisa diganti di `src/components/Ikon.tsx`.
- Ikon buatan sendiri yang tersisa hanya kamera di layar foto. Ikon alat/tukang/ahli lama yang tak terpakai dibuang.
- JS gzip kini 34,4 kB (naik 0,5 kB dari penambahan ikon).

## Pesan ke tukang bukan menu utama Beranda
- Tombol cepat "Pesan ke tukang" dihapus dari Beranda karena tukang ada di ujung urutan (tanpa biaya -> alat -> renovasi/jasa) dan draf pesannya butuh konteks panduan. Beranda kini punya dua tombol cepat yang lebih besar: Cari alat dan Tanya ahli.
- Tetap ada: tombol aksi di panduan/Rencana (tingkat renovasi atau alat yang perlu dipasang) dan pilihan "Pesan ke tukang" di halaman Panduan (`/jelajah/tukang`).

- Ikon kamera di layar foto kini Lucide `Camera`. Tidak ada lagi ikon buatan sendiri di aplikasi; `IkonAksi` dihapus.

- Ikon bilah menu bawah kini Lucide: Beranda (rumah), Panduan (buku terbuka), Rencana (daftar centang), Darurat (perisai peringatan). Panah kembali di header juga Lucide (`ChevronLeft`).

## "Tanya ahli" diganti "Kenali peran ahli"
- Halaman ini hanya menjelaskan peran tiap jenis ahli, bukan daftar ahli yang tersedia (direktori menyusul), jadi "Tanya ahli" menjanjikan terlalu banyak. Nama baru berlaku di Beranda, saringan Panduan, tombol aksi di panduan, dan judul layar aksi.
- Tombolnya saya biarkan di Beranda karena sifatnya informasi ringan, bukan langkah yang mahal. Bila ingin disamakan dengan tukang (dihapus dari Beranda), Beranda hanya tersisa satu tombol cepat.

- "Kenali peran ahli" dihapus dari Beranda (halamannya tetap ada lewat Panduan). Beranda kini menonjolkan "Lihat semua panduan" sebagai baris besar berlatar hijau muda dengan ikon buku, diikuti baris "Cari alat". Keduanya baris lebar dengan panah, bukan ubin kecil.

## Tukang digabung ke "Kenali peran ahli"
- Di halaman `/aksi/ahli/<panduan>`, baris Tukang (yang memang sudah tercantum di bantuan panduan) kini punya tombol "Pesan ke tukang" ke draf WhatsApp, memakai tingkat paling ringan yang mendukungnya.
- Tombol "Pesan ke tukang" di tiap tingkat pada halaman detail panduan dihapus supaya tidak ada dua pintu ke hal yang sama. Yang tetap ada: tombol utama di kartu Rencana untuk tingkat renovasi (agar tidak menambah satu langkah), dan saringan `/jelajah/tukang`.
- Fungsi `aksiTersedia` tidak diubah; penyaringan hanya di tampilan detail panduan.

## Filter tukang digabung ke ahli di halaman Panduan
- Pil "Pesan ke tukang" di `/jelajah` dihapus. Tukang kini satu jenis di daftar "Kenali peran ahli" (tampil pertama), lengkap dengan arti dan panduan yang melibatkannya. Pesan WhatsApp-nya diakses dari halaman peran ahli tiap panduan.
- Alamat lama `/jelajah/tukang` diarahkan ke daftar ahli supaya tautan lama tidak patah.

- Tautan "Kapan harus ke dokter atau IGD" dihapus dari Beranda atas permintaan pemilik. Halamannya tetap bisa dibuka lewat tab Darurat dan lewat peringatan non-medis di panduan.

## "Hapus data saya" pindah ke ikon Data dan privasi di header
- Tautan teks di dasar Beranda diganti ikon perisai (Lucide `ShieldCheck`) di kanan header, tersedia di semua layar. Alasannya: tindakan yang jarang dipakai dan berisiko tidak perlu memakai ruang Beranda atau satu slot tab, tetapi tetap mudah ditemukan dan konsisten dengan pola aplikasi ponsel.
- Layar tujuannya (`/hapus`) diberi judul "Data dan privasi", menampilkan kalimat privasi (data hanya di perangkat) sebelum tombol hapus. Tombol dan konfirmasi hapus tidak berubah.
- Alternatif yang tidak dipilih: tab kelima "Pengaturan" (terlalu berat untuk satu fungsi).

## Tab "Saya"
- Tab kelima di navbar (ikon Lucide `UserRound`): "Saya", bukan "Profil", agar tidak terkesan akun. Tanpa nama atau data identitas; semuanya di perangkat.
- Isi: (1) Jawaban Anda: ruangan, status tiap aktivitas, prioritas, dan tombol "Ubah jawaban" (atau ajakan mulai bila belum ada jawaban); (2) Check-in 7 hari terakhir (deretan emoji, dipindah dari Beranda); (3) tautan Data dan privasi (halaman hapus data), menggantikan ikon perisai di header yang dihapus.
- Check-in di Beranda tetap, tetapi saat sudah diisi menjadi satu baris: emoji, "Hari ini: <perasaan>", tautan bantuan kecil, dan "Ubah". Kalimat balasan dan riwayat tidak lagi tampil di Beranda.
- Belum dibuat: checklist perkembangan pasien/caregiver. Butuh isi yang ditinjau ahli (aturan konten) dan sebaiknya tanpa skor. Layar `src/screens/Saya.tsx` disiapkan sebagai tempatnya.

- Navbar bawah: hanya menu yang sedang aktif yang menampilkan nama (pil hijau berisi ikon dan nama); menu lain hanya ikon. Nama menu lain tetap dibaca pembaca layar (teks tersembunyi). Area sentuh tiap menu minimal 48px.

- Koreksi: yang dimaksud pemilik adalah judul di header, bukan navbar. Navbar kembali menampilkan nama di semua menu (catatan "hanya menu aktif" di atas dibatalkan). Judul header kini mengikuti menu yang aktif: Panduan, Rencana, Darurat, Saya. Di Beranda header tetap "Transisi" (merek); layar dalam (detail panduan, aksi, dan sebagainya) juga tetap "Transisi" dengan tombol kembali.

## Penggabungan Rencana dan Panduan (hasil council UX)
- Dasar: council lima penasihat menilai struktur lama sulit dipahami pengguna baru karena Rencana dan Panduan adalah daftar yang sama dengan urutan berbeda. Yang dinilai adalah deskripsi struktur, bukan uji dengan pengguna; uji dengan 3 orang tetap disarankan.
- Navbar kini empat menu: Beranda, Rencana, Darurat, Saya. Tab Panduan dihapus.
- Tab Rencana: bila belum menjawab, menampilkan semua panduan (halaman yang sama dengan `/jelajah`) dengan kartu ajakan "Susun rencana saya" di atas, tanpa langsung melempar ke pertanyaan. Bila sudah menjawab, menampilkan rencana pribadi seperti biasa, dengan tombol "Lihat semua panduan" di bawah.
- `/jelajah` tetap ada (tautan lama tidak patah) dan juga menyorot tab Rencana. Judul header di sana "Rencana".
- Pil Semua / Cari alat / Kenali peran ahli dihapus karena mencampur jenis berbeda (topik, produk, orang). Diganti bagian "Lainnya" di dasar daftar dengan dua tombol: "Daftar alat" dan "Peran ahli dan tukang" (`/jelajah/alat`, `/jelajah/ahli`).
- Beranda: satu tindakan utama yang mengikuti keadaan: belum menjawab "Buat rencana untuk rumah Anda"; sudah menjawab "Lanjutkan rencana Anda" (ke Rencana). Satu tautan kecil "Lihat semua panduan" untuk yang ingin melihat-lihat dulu. Baris "Cari alat" dan "Lihat semua panduan" yang besar dihapus. Check-in tetap di bawahnya.
- Belum dikerjakan (usul council): ganti kata "panduan" dengan "topik"/"langkah" (perlu diuji kata mana yang dipahami), layar sambutan singkat untuk kunjungan pertama, mengurangi 6+4 pertanyaan awal, pengukuran drop-off tanpa server (acara lokal), dan titik masuk terpisah untuk penyandang disabilitas vs caregiver.

## Sapaan "Anda" dan siapa yang mengisi
- Aturan: "Anda" berarti orang yang sedang memegang ponsel. Hal tentang kemampuan fisik menyebut "pengguna kursi roda", dan hal tentang rumah memakai "rumah ini".
- Pertanyaan onboarding "Siapa yang mengisi?" dihapus karena jawabannya tidak dipakai di mana pun; onboarding kini lima pertanyaan. Data lama yang masih menyimpan jawabannya tetap terbaca dan diabaikan.
- Teks yang disesuaikan: penjelas pertanyaan menjangkau dan memanggil bantuan, bantuan pilihan aktivitas ("keseharian di rumah"), bantuan prioritas ("caregiver membantu"), dan catatan renovasi di kontrakan atau kos ("karena rumah ini kontrakan atau kos").
- Ide bila uji pengguna menunjukkan caregiver merasa tidak disapa: pilihan "mengisi untuk siapa" di tab Saya, bukan gerbang di Beranda.

## Orientasi kunjungan pertama di Beranda
- Tanpa layar sambutan terpisah (menambah satu langkah sebelum manfaat). Sebelum pengguna menjawab pertanyaan awal, Beranda menampilkan paragraf pengantar (apa ini, untuk siapa) menggantikan kalimat konteks lama, dan kalimat privasi kecil di bawah kartu utama. Setelah menjawab keduanya hilang otomatis dari keadaan data; tidak ada tombol tutup atau penanda baru di penyimpanan.
- Frasa yang dipilih pemilik: "setelah perubahan kondisi gerak" (lebih lembut daripada "setelah amputasi kaki").
- Lama pengisian sengaja tidak disebut karena belum pernah diukur.

- Pengantar kunjungan pertama diperpendek menjadi dua kalimat ("Menyiapkan rumah agar lebih mudah dipakai, mulai dari kamar mandi. Untuk penyandang disabilitas pengguna kursi roda dan caregiver.") karena versi empat baris terasa panjang. Frasa "perubahan kondisi gerak" ikut dibuang.

- Kalimat privasi dihapus dari Beranda atas permintaan pemilik. Kalimat itu tetap ada di tab Saya dan halaman Data dan privasi.

## Kolom cari panduan di Beranda
- Di bawah kartu utama (bukan di atas, agar aksi utama tetap "Buat rencana"): kolom cari tipis berlabel "Sudah tahu masalahnya?" dengan tombol kaca pembesar, dan tautan "Lihat semua panduan" di bawahnya. Menekan Enter atau tombol membuka daftar panduan dengan kata kunci sudah terisi; bila kosong, kolom cari di daftar langsung aktif.
- Kata kunci dikirim lewat state riwayat peramban, bukan alamat, supaya tidak ada teks pengguna di URL.
- Pencarian berjalan di perangkat (fungsi murni `cocokCari`, diuji): semua kata harus ada di judul atau situasi panduan, tanpa membedakan huruf besar/kecil. Belum mencari di isi langkah, alat, atau sinonim (mis. "grab bar" untuk pegangan); tambahkan bila uji pengguna menunjukkan orang memakai istilah lain.
- Hasil kosong menampilkan pesan yang mengarahkan ke "Susun rencana saya".

- Kolom cari dipindah ke atas kartu "Buat rencana" atas permintaan pemilik (menggantikan keputusan "di bawah kartu"). Tautan "Lihat semua panduan" tetap di bawah kartu. Catatan: dua pintu masuk kini bersaing di bagian atas Beranda; pantau pada uji pengguna apakah pengguna baru tetap menemukan "Buat rencana".

- Teks kartu "Buat rencana" kini: "Menyiapkan rumah agar lebih mudah dipakai, mulai dari kamar mandi. Untuk penyandang disabilitas pengguna kursi roda dan caregiver." (usul pemilik). Paragraf pengantar terpisah di atas dihapus karena duplikat. Kalimat "Jawab ya atau tidak, tanpa mengukur" tidak lagi tampil di Beranda; pertanyaannya sendiri sudah berbentuk ya/tidak.

- Tulisan kecil "Jawab ya atau tidak, tanpa mengukur." ditambahkan di bawah tombol Mulai (hanya sebelum menjawab).

- Catatan kecil di bawah Mulai dihapus (dianggap tidak penting). Label kolom cari di Beranda diganti "Cari masalah di rumah Anda" dengan contoh "Mis. lantai licin atau pintu sempit" supaya jelas apa yang bisa dicari tanpa istilah "panduan".

- Label kolom cari di Beranda diganti usul pemilik: "Temukan panduan agar tempat tinggal lebih ramah disabilitas" (menggantikan "Cari masalah di rumah Anda").

- Label kolom cari di Beranda dinaikkan menjadi teks 18px tebal berwarna tinta (gelap) agar menjadi kalimat pertama yang terbaca.

- Kolom cari di Beranda dinaikkan (jarak atas dikurangi) dan diberi jarak lebih longgar: label ke kolom 12px, kolom ke tombol cari 12px.

- Jarak kolom cari ke kartu hijau ditambah (16px menjadi 24px).

## "Rumah" atau "tempat tinggal"
- Hasil telusur: "rumah" dipakai di sekitar 12 tempat (judul kartu, asesmen, kartu panduan, kertas cetak); "tempat tinggal" hanya di pertanyaan jenis hunian (onboarding) dan label kolom cari yang baru. Opsi hunian: milik sendiri, kontrakan, kos, apartemen.
- Keputusan: "rumah" dipakai sebagai kata umum di seluruh antarmuka (pendek, hangat, dan lazim dipakai untuk kos/apartemen: "di rumah"). "Tempat tinggal" hanya dipertahankan pada pertanyaan jenis hunian karena di situ perbedaan kos/kontrakan/apartemen memang ditanyakan. Label kolom cari diubah ke "Temukan panduan agar rumah lebih ramah disabilitas".
- Risiko: penghuni kos mungkin terasa kurang disapa oleh kata "rumah". Periksa pada uji pengguna; alternatif yang lebih inklusif adalah "tempat tinggal" di semua tempat, dengan harga kata yang lebih formal.
- Teks kartu "Buat rencana" disesuaikan dengan perannya (panduan yang dipersonalisasi sesuai kondisi), sedangkan kolom cari untuk semua orang: "Dapatkan langkah yang sesuai dengan kondisi dan rumah Anda, mulai dari kamar mandi. Untuk penyandang disabilitas pengguna kursi roda dan caregiver."

## Cakupan layanan sebagai label kecil
- Layanan saat ini hanya kamar mandi dan pengguna kursi roda, dan nanti akan bertambah. Informasi ini dipisah dari narasi umum: kartu "Buat rencana" kini berisi narasi umum ("Dapatkan langkah yang sesuai dengan kondisi dan rumah Anda.") dan satu label kecil berbingkai di pojok kanan atas, "Tersedia untuk kamar mandi dan kursi roda". Tampil hanya sebelum pengguna menjawab.
- Teks label ada di `content/ui.json` (`beranda.pilih.susun.cakupan`) dan cukup diubah saat layanan bertambah. Pertimbangan lanjutan: menurunkan label dari `config.json` (ruangan dengan `tersedia: true`) supaya otomatis, tetapi alat bantu belum ada di config.

- Label cakupan dipindah ke baris tersendiri di bawah ikon (di atas judul kartu), memakai teks lengkap "Tersedia untuk kamar mandi dan kursi roda".

- Label cakupan dipindah dari dalam kartu hijau ke bawah kolom cari, karena cakupan (kamar mandi dan kursi roda) berlaku untuk seluruh layanan termasuk pencarian. Tampil selalu (sebelum dan sesudah menjawab). Kuncinya kini `beranda.pilih.cakupan` di `content/ui.json`.

- Label cakupan di bawah kolom cari kini dua pil: "Ruang: Kamar mandi" dan "Disabilitas: Pengguna kursi roda". Disimpan sebagai daftar `beranda.pilih.cakupan` ({label, nilai}) di `content/ui.json`, jadi menambah ruang atau jenis disabilitas cukup menambah satu butir atau mengubah nilainya. Pembaca layar mendengar daftar berjudul "Tersedia untuk".

- Di atas dua pil cakupan ada judul kecil "Ruang lingkup pengembangan saat ini" (`beranda.pilih.cakupanJudul`).

- Info cakupan di bawah kolom cari diganti dari dua pil menjadi satu baris teks polos berikon info (Lucide `Info`): "Ruang lingkup pengembangan saat ini: kamar mandi, pengguna kursi roda." Pil dihindari karena terbaca sebagai riwayat pencarian atau filter yang bisa diketuk. Nilai diambil dari daftar `beranda.pilih.cakupan` (label tidak ditampilkan).

- Info cakupan dipindah ke atas judul kolom cari dan diringkas jadi satu baris: "Saat ini: kamar mandi, pengguna kursi roda." (judul `beranda.pilih.cakupanJudul` = "Saat ini").

- Info cakupan dipindah ke bawah judul kolom cari dan ditulis ulang: "Saat ini tersedia panduan untuk aktivitas di kamar mandi bagi pengguna kursi roda." Disimpan sebagai satu kalimat di `beranda.pilih.cakupan` (menggantikan daftar label/nilai), karena kalimat utuh lebih mudah dibaca dan diubah saat layanan bertambah.

- Judul kolom cari di Beranda dinaikkan dari 18px ke 24px (text-2xl), setara judul layar lain.

- Tautan "Lihat panduan yang tersedia" dipindah tepat setelah teks info cakupan (di atas kolom cari), menggantikan "Lihat semua panduan" di bawah kartu hijau. Jarak judul ke teks info dilonggarkan (12px).

- Info cakupan dan tautan "Lihat panduan yang tersedia" dijadikan banner informasi (latar hijau muda, ikon info) di paling atas Beranda, di atas judul kolom cari. Catatan: warnanya sama dengan kartu check-in; bila terasa mirip, ganti salah satunya.

- Banner informasi di Beranda diberi latar krem (token `aksen-muda`) dengan garis tepi tipis berwarna aksen, ikon info dalam lingkaran putih, teks tinta, dan tautan "Lihat panduan yang tersedia" berpanah berwarna aksen. Kombinasi warnanya sudah ada di tes kontras. Judul kolom cari dan teks lain tidak berubah.

- Banner: kalimat menjadi "Saat ini baru tersedia panduan untuk aktivitas di kamar mandi bagi pengguna kursi roda." dan tautannya diperpendek menjadi "Lihat panduan", disatukan dalam paragraf yang sama dengan kalimat (tautan sebaris, berwarna aksen dan bergaris bawah; ikon panah dihapus).

- Banner informasi kini selebar layar: menempel ke header di atas dan ke tepi kiri-kanan (tanpa sudut membulat, hanya garis bawah tipis). Letaknya di luar formulir cari.

## Banner biru
- Banner informasi di Beranda diganti biru dengan token baru `info` (#1D4E89) dan `info-muda` (#E6F0FA) di `tailwind.config.ts`, khusus untuk informasi netral. Kontrasnya diuji (info di info-muda, tinta di info-muda, info di putih). Perubahan token Tailwind memerlukan server dev dimulai ulang.

- Ikon info di banner tidak lagi berada di lingkaran putih; berdiri sendiri berwarna biru, sejajar baris pertama teks.

- Judul kartu utama diganti "Buat rencana pribadi" (sebelumnya "Buat rencana untuk rumah Anda") agar langsung ke inti dan tidak mengulang "rumah Anda" yang ada di deskripsinya ("Dapatkan langkah yang sesuai dengan kondisi dan rumah Anda.").

- Kartu utama: judul "Cek kebutuhan di rumah" dan deskripsi "Jawab beberapa pertanyaan, lalu dapatkan langkah yang sesuai dengan kondisi Anda." Kata "rencana" dihindari di judul kartu karena terdengar seperti rencana bepergian. Kata "rencana" masih dipakai di tab Rencana dan layar "Rencana Saya"; bila tidak pas juga, pertimbangkan "Langkah Saya".

## Tab Rencana menjadi Panduan
- Alasan: "rencana" terdengar seperti rencana bepergian, dan "langkah" sudah dipakai untuk isi di dalam panduan (bagian Langkah, "3 dari 5 langkah selesai"). Setelah Rencana dan Panduan digabung, tab itu berisi satu hal: panduan.
- Tab navbar: "Panduan" (ikon buku terbuka). Judul layar: "Semua panduan" sebelum menjawab dan "Panduan Saya" sesudahnya. Tombol di Beranda: "Cek kebutuhan di rumah", lalu "Lanjutkan panduan Anda" / "Buka Panduan Saya".
- Teks ikut diselaraskan: cetak ("Cetak panduan saya", kertas "Panduan adaptasi rumah"), kembali ("Kembali ke panduan saya"), ajakan di daftar, dan Saya. Nama internal (rute `/rencana`, fungsi `buatRencana`, kejadian `rencana_dibuat`) tidak diubah agar tautan lama tetap berlaku.
- Telusur halaman: tidak ada sisa kata "rencana" yang terlihat pengguna di Beranda, Panduan, Saya, Cetak, detail panduan, dan peran ahli. Label "Untuk Anda yang merawat" di check-in tidak lagi terbaca dua kali oleh pembaca layar.

## Check-in terisi dirancang ulang
- Kartu setelah memilih emoji kini memakai latar hijau muda yang sama dengan kartu pertanyaan (satu keluarga). Isi: emoji besar dalam lingkaran putih, keterangan kecil "Hari ini · Untuk Anda yang merawat", jawaban tebal besar, tombol "Ubah" berikon pensil di pojok kanan atas, dan satu tombol bantuan lebar berpanah (putih, tepi tipis) di bawahnya. Sebelumnya berupa baris putih datar dengan tautan yang terlihat menggantung.

- Placeholder kolom cari di Beranda: "Cari panduan, mis. lantai licin" (menyebut apa yang dicari, selaras dengan judul "Temukan panduan…", disusul satu contoh).

- Placeholder kolom cari diganti "Mis. cara mengatasi lantai licin" (kata "cara" selaras dengan judul "Temukan panduan…", karena panduan adalah cara menangani suatu masalah). Agar contoh itu benar-benar menemukan hasil, pencarian kini mengabaikan kata penghubung dan kata tanya umum (cara, mengatasi, bagaimana, untuk, agar, dan sebagainya; daftar `KATA_ABAI` di `src/domain/jelajah.ts`, diuji). Daftar ini perlu dilengkapi bila uji pengguna menunjukkan kata lain yang sering diketik.

## Saran pencarian di Beranda
- Di bawah kolom cari ada baris "Coba cari" berisi tiga saran yang bisa diketuk (Lantai licin, Pintu sempit, Pegangan kloset). Mengetuknya membuka daftar panduan yang sudah tersaring (sama seperti mengetik lalu Enter). Daftar saran ada di `content/ui.json` (`beranda.pilih.cari.saran`) dan diuji agar tiap saran selalu menemukan minimal satu panduan.
- Saran ini bukan riwayat pencarian pengguna: tidak ada riwayat yang disimpan. Tiga saja agar muat satu baris dan Beranda tidak makin padat.

- Judul kolom cari menjadi "Temukan panduan dan solusi agar rumah lebih ramah disabilitas": kata "solusi" memberi tahu bahwa mengetik masalah (mis. "lantai licin") juga tepat, dan sudah dikenal di aplikasi ("Pilihan solusi"). Kata "solusi" ikut diabaikan oleh pencarian ("solusi lantai licin" tetap menemukan panduan).

- Deskripsi kartu utama: "Jawab beberapa pertanyaan, lalu dapatkan solusi yang sesuai dengan kondisi Anda." (bukan "langkah", agar selaras dengan judul pencarian dan tidak bentrok dengan "langkah" di dalam panduan). Ajakan di halaman daftar ikut disamakan.

## Putaran penyempurnaan Beranda
- **Urutan mengikuti keadaan:** pengunjung baru melihat banner cakupan, sapaan, pencarian, kartu "Cek kebutuhan", lalu check-in. Setelah menjawab: sapaan, kartu "Lanjutkan panduan Anda", pencarian, check-in, lalu info cakupan sebagai catatan kecil di dasar (banner di atas hanya untuk kunjungan awal).
- **Sapaan** sesuai jam perangkat (pagi 04-10, siang 11-14, sore 15-17, malam lainnya), fungsi `bagianHari` diuji. Tidak ada data pribadi.
- **Check-in sebelum diisi** lebih tenang (kartu putih bergaris tipis; yang terpilih berlatar hijau muda dengan cincin). Setelah diisi tetap kartu hijau muda yang dirancang ulang sebelumnya.
- **Kolom cari** satu kolom setinggi 48px dengan ikon kaca pembesar di dalam; tombol terpisah dihapus (Enter mengirim, ada tombol kirim tersembunyi untuk pembaca layar).
- **Token desain** di `tailwind.config.ts`: skala tipografi (`text-judul`, `text-subjudul`, `text-isi`, `text-kecil`, `text-mikro`) dan ritme jarak (`bagian` = 24px antar bagian, `isi` = 12px di dalam bagian). Beranda memakainya; layar lain belum dimigrasi.
- **Merek:** wordmark "Transisi." (tebal, rapat, titik berwarna aksen) di header layar non-menu.
- **Umpan balik sentuhan:** kelas `.tekan` (mengecil sedikit saat ditekan, mati bila pengguna meminta gerak dikurangi) pada tombol, kartu baris, tab navbar, saran pencarian, dan ubin check-in.
- **Ukuran teks:** label ubin check-in dan tab navbar 13px (sebelumnya 12px). Diperiksa di lebar 360px: semua label muat (Bingung 52px, Istirahat 53px dalam ubin 55px). Karena ruangnya tipis, jangan menambah kata atau memperbesar font label tanpa memeriksa ulang.
- Perubahan token Tailwind memerlukan server dev dimulai ulang.

- Segmen pencarian di Beranda diberi latar tipis (token baru `permukaan` #F2F6F6, abu kehijauan sangat muda) dalam kartu membulat, supaya judul, kolom, dan saran terbaca sebagai satu kelompok. Kontras tinta dan redup di atasnya diuji. Padding saran dirapatkan agar tiga saran tetap satu baris. Token baru memerlukan server dev dimulai ulang.

- Segmen pencarian kini pita selebar layar (tepi ke tepi) berlatar `permukaan`. Bagi pengunjung baru, sapaan ikut masuk ke dalam pita dan kartu "Cek kebutuhan di rumah" menimpa tepi bawahnya sekitar 40px (kartu diberi bayangan tipis); pita langsung menyambung di bawah banner cakupan. Setelah menjawab, pita berada di bawah kartu "Lanjutkan panduan Anda" tanpa tumpang tindih.

- Jarak saran pencarian ke kartu "Cek kebutuhan di rumah" ditambah (24px menjadi sekitar 32px). Warna latar di luar area aplikasi (token `luar`) diganti dari abu kebiruan #DCE3E5 menjadi krem pasir hangat #E9E2D6 supaya jelas berbeda dari area aplikasi dan dari pita pencarian yang berwarna kehijauan. Token Tailwind berubah: server dev perlu dimulai ulang.

- Latar di luar area aplikasi (token `luar`) diganti hijau tua pekat #0A4549 (sama dengan `utama-gelap`, agar selaras dengan palet) menggantikan krem pasir. Hanya terlihat di layar lebar; di ponsel aplikasi memenuhi layar. Token berubah: server dev perlu dimulai ulang.

## Server dev membaca ulang Tailwind otomatis
- Masalah: perubahan `tailwind.config.ts` (token warna, jarak, tipografi) tidak terbaca server dev yang sedang berjalan; harus Ctrl+C lalu `npm run dev`. Diuji: bahkan restart dalam proses yang sama dan "menyentuh" berkas CSS tidak membantu, karena Tailwind menyimpan konfigurasi di memori.
- Perbaikan: konfigurasi Tailwind kini diberikan langsung dari `vite.config.ts` (`css.postcss.plugins`), sehingga Vite memantau `tailwind.config.ts` sebagai dependensi dan memulai ulang servernya sendiri bila berubah. Diuji dengan mengubah satu warna lalu mengembalikannya: CSS berubah tanpa Ctrl+C.
- Berkas `postcss.config.js` dihapus karena fungsinya pindah ke `vite.config.ts`. `tsconfig.json` mendapat `allowImportingTsExtensions` (aman karena `noEmit`) agar impor `./tailwind.config.ts` sah tanpa peringatan.
- Sekali ini server dev yang sedang berjalan tetap perlu dimulai ulang agar memakai pengaturan baru; sesudahnya tidak lagi.

- Latar di luar area aplikasi (token `luar`) diganti abu netral tipis #ECECEA (menggantikan hijau tua pekat), sesuai permintaan pemilik.

## Catatan cakupan kembali ke Beranda (kuning, bisa ditutup)
- Catatan "Saat ini baru tersedia panduan untuk aktivitas di kamar mandi bagi pengguna kursi roda" tampil lagi di Beranda, di atas sapaan "Selamat pagi", sebagai kartu kuning lembut selebar isi (bukan tepi ke tepi) dengan tombol tutup. Tetap ada juga di hasil pencarian dan pertanyaan pertama asesmen.
- Keputusan paling sederhana: status "ditutup" hanya disimpan di memori halaman, jadi catatan muncul lagi saat halaman dimuat ulang. Tidak ada data baru di localStorage. Bila ingin tetap tertutup, perlu satu bidang baru di `transisi:v1`.
- Token warna baru `catatan` (teks #5C3D00, latar #FFF3C4, garis #E8CF7A). Kontras teks di atas latar sekitar 8,9:1.

## Prettier dipasang
- Prettier ditambahkan sebagai dependensi dev dengan `.prettierrc.json` (`printWidth` 140 agar sesuai gaya kode yang sudah ada, `trailingComma: all`). Perintah: `npm run format` dan `npm run format:cek`.
- Diformat: `src/`, `tests/`, dan berkas konfigurasi di akar. Tidak diformat (lihat `.prettierignore`): `content/` (teks yang diedit tim non-teknis), berkas Markdown, dan `package-lock.json`.
- Seluruh kode diformat sekali dalam satu commit terpisah; tidak ada perubahan perilaku (lint, typecheck, tes, dan build lulus).

## "Situasi" dan "Kenapa penting" digabung di hero Detail Panduan
- Di hero Detail Panduan, judul dan "Situasi" sering nyaris sama, sedangkan "Kenapa ini penting" dulu berupa bagian lipat terpisah. Keduanya kini digabung: kotak kuning Situasi menampilkan `situasi`, lalu `kenapa_penting` di kalimat berikutnya bila isinya berbeda (tidak ditampilkan dua kali bila sama atau sudah terkandung). Tidak ada teks baru yang ditulis; seluruhnya dari bidang yang sudah ada di kartu.
- Daftar, Panduan Saya, Cetak, dan pencarian tidak berubah.

## Lencana "Sementara, bisa dibatalkan" dihapus
- Lencana ini dihapus di Detail Panduan dan di kartu Panduan Saya (permintaan pemilik). Hanya solusi permanen yang diberi lencana "Permanen", sehingga prinsip 5 ("solusi permanen ditandai") tetap terpenuhi: yang tidak bertanda adalah solusi yang bisa dibatalkan. Teks `umum.sementara` di `content/ui.json` kini tidak terpakai.

## Waktu pengerjaan diisi sementara (placeholder, belum ditinjau)
- Atas permintaan pemilik, kolom `usaha.waktu` yang masih kosong diisi: Tanpa biaya "15 menit", Alat tanpa bongkar "1-2 jam", Renovasi "1-3 hari". Nilai ini disalin dari satu-satunya panduan yang sudah punya data waktu (`bath-transfer-toilet`) dan diterapkan ke tingkat yang sama di panduan lain. Itu BUKAN estimasi per panduan; hanya pengisi sementara.
- Renovasi di `bath-space-turning`, `bath-shower-entry`, dan `bath-emergency-call` sengaja tetap kosong karena pekerjaannya (membongkar dinding, merencanakan, atau instalasi listrik) hampir pasti lebih lama dari "1-3 hari".
- Kisaran biaya (`biaya.kisaran_rp`) TIDAK diisi: mesin rekomendasi membacanya untuk menghitung total dan menandai "di atas anggaran", jadi angka karangan akan diam-diam mengubah rekomendasi. Menunggu angka dari tim konten.
- Semua kartu tetap berstatus `draf`; angka ini perlu ditinjau sebelum dianggap benar.

## Estimasi biaya (placeholder, hanya tampilan)
- Atas permintaan pemilik, pil biaya di Detail Panduan dan Cetak kini menampilkan "Rp x rb - y jt" (awalnya dengan kata "Estimasi", lalu kata itu diganti tanda "~" di depan angka atas permintaan pemilik; angka tetap perkiraan) untuk tingkat Alat tanpa bongkar dan Renovasi yang belum punya `kisaran_rp`. Angkanya disimpan di bidang BARU `biaya.estimasi_rp` (opsional, hanya tampilan). Mesin rekomendasi tetap hanya membaca `kisaran_rp`, jadi total biaya, "di atas anggaran", dan urutan rekomendasi TIDAK terpengaruh.
- Angka ini adalah perkiraan kasar saya dari pengetahuan umum tentang harga barang di Indonesia, bukan dari survei atau sumber. Kisarannya sengaja lebar. Semua kartu masih `draf`. Perlu diganti dengan angka dari survei sebelum dipakai pengguna sungguhan; bila `kisaran_rp` diisi, ia menggantikan estimasi.
- Tiga renovasi (`bath-space-turning`, `bath-shower-entry`, `bath-emergency-call`) dan kartu pendamping tidak diberi estimasi karena biayanya sangat bergantung pada kondisi rumah; pilnya tetap "Biaya menyusul".

## Detail Panduan: struktur disederhanakan (kurangi beban kognitif)
- Sebelumnya halaman memuat sekitar 12 blok terpisah (3 kartu solusi, 2 kartu peran, peringatan, 2 bagian lipat, catatan non-medis, dua tombol). Sekarang: hero, satu wadah solusi (3 baris berpemisah), tombol ahli, peringatan, satu wadah peran (2 baris), satu wadah "istilah dan sumber" (2 baris lipat), dan catatan non-medis sebagai teks kecil tanpa kotak.
- Hanya satu tingkat solusi terbuka pada satu waktu (membuka satu menutup yang lain). Tombol "Kembali ke ..." di dasar dihapus karena header sudah punya panah kembali.
- Peringatan keselamatan sengaja tetap terlihat (tidak dilipat) dan berwarna.

## Halaman "Ikuti langkahnya" digabung ke panel solusi
- Halaman terpisah `/aksi/sendiri/...` hanya mengubah daftar langkah menjadi kotak centang. Sekarang daftar langkah di panel solusi (Detail Panduan) langsung berupa kotak centang, dengan bilah kemajuan dan pertanyaan "Bagaimana hasilnya?" yang muncul setelah semua langkah tercentang. Data tetap sama (`state.checklist` dan `state.hasil`), jadi Panduan Saya (beres atau tingkat berikutnya) dan halaman Cetak tidak berubah.
- Tombol "Ikuti langkahnya" dihapus dari panel. Di Panduan Saya, tombol utama untuk tingkat tanpa barang kini berbunyi "Lihat langkahnya" dan menuju panel solusi tingkat itu. Alamat lama `/aksi/sendiri/...` diarahkan ke halaman panduan.

## Tombol "Kenali peran ahli" dan "Pesan ke tukang" diberi konteks
- Tombol "Kenali peran ahli" yang berdiri sendiri di bawah daftar solusi dihapus karena muncul tanpa alasan. Sekarang tombol itu muncul di dua tempat yang masuk akal: (1) di panel tingkat Renovasi, dengan kalimat pengantar "Renovasi sering perlu dibantu ahli dan tukang. Kenali siapa yang cocok untuk panduan ini.", dan (2) sebagai saran setelah pengguna menjawab "Masih sulit" di tingkat terakhir.
- Tombol "Pesan ke tukang" kini langsung di panel tingkat yang mendukungnya, dengan kalimat pengantar. Sebelumnya hanya bisa dicapai lewat halaman peran ahli.
- Kalimat pengantar baru (`kartu.jembatanTukang`, `kartu.jembatanAhli`) ditulis oleh asisten dan perlu ditinjau tim konten.

## Alat tanpa bongkar: beli dulu, tukang hanya untuk memasang
- Di tingkat "Alat tanpa bongkar", tombol utama (hijau penuh) adalah "Lihat alat". "Pesan ke tukang" tetap ada tetapi sekunder, dengan pengantar "Perlu dipasangkan, atau ingin alatnya dibuat khusus oleh tukang? ..." (`kartu.jembatanPasang`). Di tingkat Renovasi sebaliknya: "Pesan ke tukang" utama dengan pengantar "Ingin dikerjakan tukang? ..." dan "Lihat alat" (bila ada barang) sekunder. Kalimat pengantar baru ditulis asisten; perlu ditinjau.

## Butir pilihan "alat dibuat khusus" di pesan ke tukang
- Untuk tingkat "Alat tanpa bongkar", pesan ke tukang punya butir tambahan "Alat ingin dibuat khusus sesuai ukuran dan kondisi di rumah, bukan beli jadi." Butir ini TIDAK dicentang dari awal dan baru masuk pesan bila pengguna mencentangnya (teksnya bisa disunting). Tidak muncul di tingkat lain. Kalimatnya ditulis asisten (`aksi.brief.alatKhusus`); perlu ditinjau.

- Pembaruan: pengantar dan tombol "Pesan ke tukang" untuk tingkat Alat tanpa bongkar dipindah dari panel di Detail Panduan ke halaman "Lihat alat" (di bawah daftar barang), karena di sanalah orang memutuskan membeli, memasang, atau membuat khusus. Di panel Detail Panduan, tukang hanya tampil di tingkat Renovasi. Komponen `Jembatan` kini dipakai bersama.
- Daftar "Barang yang dibutuhkan" (nama, cek kecocokan, spesifikasi, harga) dihapus dari panel di Detail Panduan karena isinya sama dengan halaman "Lihat alat" yang dibuka tombolnya. Informasi barang kini hanya ada di satu tempat.
- Di tingkat Renovasi, "Pesan ke tukang" dan "Kenali peran ahli" digabung dalam satu blok dengan satu kalimat pengantar (`kartu.jembatanRenovasi`), karena halaman peran ahli sudah memuat tukang sebagai salah satu jenis bantuan. Dua kalimat pengantar terpisah sebelumnya (`jembatanTukang`, `jembatanAhli`) dihapus.

## Menu Darurat menjadi Kontak (seperti yellow pages)
- Tab "Darurat" diganti "Kontak" (alamat `/kontak`; `/igd` diarahkan ke sana). Halaman memuat: kartu darurat (tanda bahaya dari `ui.igd` dan nomor darurat dengan tombol telepon), penyaring jenis kontak, lalu satu kartu per jenis (nama, arti, kontak, dan "Dipakai di panduan" berisi tautan ke panduan terkait).
- Fitur "Kenali peran ahli" dipindah ke sini. Halaman `/aksi/ahli/:id` dan `/jelajah/ahli` kini mengarah ke Kontak; dari panduan, jenis ahli yang disarankan panduan itu tampil lebih dulu dengan keterangannya. Komponen `AksiAhli` dan `DaftarAhli` dihapus.
- Data kontak ada di berkas baru `content/kontak.json` dan divalidasi zod (nomor harus berbentuk nomor; kategori dan id harus sah). Delapan kategori: darurat, dokter rehabilitasi medik, prostetis-ortotis, okupasi terapis, fisioterapis, tukang, arsitek, komunitas.
- ISI KONTAK: hanya dua nomor yang diisi, yaitu 112 (nomor darurat nasional) dan 119 (layanan darurat kesehatan), berstatus draf dan perlu diverifikasi tim sebelum rilis. Semua kategori lain sengaja kosong dan tampil "sedang disiapkan"; tidak ada nama, nomor, atau alamat yang dikarang. Arti dua kategori baru (dokter rehabilitasi medik, prostetis-ortotis) ditulis asisten dan perlu ditinjau.
- Nomor di tautan `tel:` dan `wa.me` tidak dikirim ke server mana pun; tidak ada data pribadi di alamat halaman.

## Isi kontak diisi dari sumber resmi pemerintah
- Atas permintaan pemilik, `content/kontak.json` diisi hanya dari situs pemerintah yang diperiksa pada saat pengisian, dan setiap entri menyimpan `sumber` (alamat halaman resminya; ada tes yang menjaga semua sumber berakhiran `.go.id`). Isi: darurat (112, 119, 115 Basarnas, 110 polisi, 113 pemadam), layanan pemerintah (Halo Kemenkes 1500-567 dan WhatsApp, Kemensos 171, BPJS Kesehatan 165), dan RS Ortopedi Prof. Dr. R. Soeharso Surakarta (rumah sakit Kemenkes; rehabilitasi medik, ortotik-prostetik, okupasi terapi, fisioterapi) di empat kategori.
- Yang TIDAK diisi: tukang, arsitek, komunitas, dan kontak ahli lokal. Itu bukan layanan pemerintah, sehingga tetap "sedang disiapkan".
- Hal yang perlu diverifikasi manusia: (1) nomor BPJS 165 diambil dari ringkasan pencarian atas situs resmi BPJS karena halaman utamanya tidak bisa dibaca otomatis; (2) 110 dan 113 bersumber dari halaman Komdigi tentang 112 yang menyatakan nomor itu masih bisa dipakai; (3) layanan 112 berbeda antar daerah; (4) nomor rumah sakit bisa berubah. Semua entri berstatus `draf`.
- Nomor WhatsApp Kemensos yang tertaut di situs lama (628877171171) sengaja TIDAK dipakai karena ada peringatan resmi pemerintah daerah tentang nomor WhatsApp palsu atas nama Kemensos; hanya telepon 171 yang dipakai.

## Peran penyandang disabilitas dan caregiver pindah ke panel solusi
- Kartu "peran" yang berdiri sendiri dihapus. Dua kalimat peran (`peran.penyandang_disabilitas` dan `peran.caregiver`) kini tampil sebagai dua baris kecil berlabel di dalam panel solusi, tepat di atas daftar langkah. Label daftar langkah tetap "Langkah" (bukan "Peran caregiver") karena sebagian langkah dikerjakan sendiri oleh penyandang disabilitas, dan prinsip produk menempatkan penyandang disabilitas sebagai pemegang keputusan.

## Penanda peran di setiap langkah (checklist)
- Kartu atau kotak peran dihapus dari Detail Panduan. Sebagai gantinya, setiap langkah di checklist diberi penanda kecil siapa yang mengerjakannya: Penyandang disabilitas, Caregiver, Bersama, atau Tukang (tingkat Renovasi). Data disimpan di bidang baru `peran_langkah` (urutan sama dengan `langkah`; jumlahnya harus sama, dijaga skema dan tes). Bidang `peran` lama di kartu tidak lagi ditampilkan.
- Pembagian peran untuk 106 langkah DITENTUKAN ASISTEN dengan aturan sederhana dari kata kerja pertama dan sedikit penyesuaian manual: memutuskan, mencoba, dan memakai = penyandang disabilitas; menyiapkan, memasang, memindahkan, dan membeli = caregiver; melatih, menyepakati, dan menguji = bersama; pekerjaan bangunan di Renovasi = tukang; kartu pendamping semuanya caregiver. Ini penilaian, bukan fakta dari ahli. Semua kartu masih draf dan tim konten perlu meninjau penandanya.

- Baris "Kesulitan" (mis. "Mudah, bisa sendiri") dihapus dari panel solusi karena penanda peran di setiap langkah sudah menunjukkan siapa yang terlibat. Datanya (`usaha.kesulitan`) tetap ada di konten.

- Lencana "Permanen" dan "Tunggu dulu, kebutuhan Anda mungkin berubah" dihapus dari panel solusi di Detail Panduan (permintaan pemilik): nama tingkat "Renovasi" dan urutan dari yang paling ringan sudah menyiratkannya. Lencana yang sama masih tampil di kartu rencana pada Panduan Saya.

- Tombol "Lihat kontak ahli" dihapus dari panel tingkat Renovasi karena sudah ada menu Kontak; yang tersisa hanya "Pesan ke tukang" dengan pengantar `kartu.jembatanRenovasi`. Tombol ke Kontak tetap muncul setelah pengguna menjawab "Masih sulit" di tingkat terakhir.

- Tombol ke halaman Kontak setelah menjawab "Masih sulit" di tingkat terakhir dihapus (permintaan pemilik). Tersisa kalimat saja: "Ini sudah pilihan terakhir di panduan ini. Pertimbangkan bertanya ke ahli lewat menu Kontak." Satu-satunya jalan ke Kontak dari panduan kini lewat tab Kontak di bilah bawah.
- Urutan isi panel solusi sekarang: ringkasan dan pil, langkah bercentang, ukuran (bila ada), ajakan bertindak ("Lihat alat" dan, di Renovasi, "Pesan ke tukang"), lalu pertanyaan "Bagaimana hasilnya?" di paling bawah (hanya muncul setelah semua langkah tercentang). Komponen dipecah menjadi `LangkahChecklist` dan `HasilLangkah`.

## Penanda hasil di daftar Panduan
- Jawaban "Bagaimana hasilnya?" (Sudah cukup / Masih sulit) kini juga tampil sebagai penanda di baris panduan pada halaman Panduan: "Beres" (ikon centang) atau "Masih sulit" (ikon peringatan). Panduan yang belum dicatat tidak diberi penanda. Datanya sama dengan yang dipakai Panduan Saya (`state.hasil`), tersimpan di perangkat. Teks penanda ada di `jelajah.status`.

- Tombol "Kembali ke panduan saya" setelah menjawab "Sudah cukup" dihapus (permintaan pemilik); pesan "Kabar baik. Panduan ini ditandai beres di Panduan Saya." tetap tampil. Teks `keRencana` dihapus dari konten.

- Urutan panel solusi diperbarui lagi: ringkasan dan pil, ajakan bertindak ("Lihat alat" dan, di Renovasi, "Pesan ke tukang") DI ATAS langkah, lalu langkah bercentang, ukuran, dan "Bagaimana hasilnya?" di paling bawah.
- Biaya dipindah dari kartu tab solusi ke dalam panel solusi, sejajar dengan pil waktu. Kartu tab kini hanya berisi nama tingkat (lebih pendek). Konsekuensinya biaya tiga tingkat tidak lagi bisa dibandingkan sekilas tanpa berpindah tab.
- Nama tingkat "Alat tanpa bongkar" di antarmuka diganti "Pakai alat" supaya sejajar dengan "Tanpa biaya" dan "Renovasi" (dua kata, pola sama). Kunci data `alat_tanpa_bongkar` dan prinsip "tanpa bongkar" tidak berubah. Maksud "tanpa bongkar" tetap dijelaskan di ringkasan tiap solusi ("alat yang bisa dilepas").

- Kalimat pengantar di atas "Pesan ke tukang" pada tingkat Renovasi dihapus (permintaan pemilik); tombolnya berdiri sendiri. Teks `jembatanRenovasi` dihapus dari konten. Pengantar "Perlu dipasangkan, atau ingin alatnya dibuat khusus..." di halaman Lihat alat tidak berubah.

- Bagian "Perhatian" (peringatan keselamatan panduan) dipindah dari bawah solusi ke hero Detail Panduan, di bawah kotak Situasi, supaya terbaca sebelum pengguna mengikuti langkah. Tampil di semua panduan yang punya peringatan, termasuk kartu yang isinya masih menyusul.

## Penyempurnaan tampilan setelah melihat hasil render (Chrome headless)
- Detail Panduan: hero diberi label kelompok (mis. "MANDI") di sebelah ikon; checklist memakai kotak centang kustom (garis tipis, terisi teal dengan tanda centang), pemisah tipis antarlangkah tanpa blok abu, bilah kemajuan tipis dengan hitungan n/N.
- Kontak: nomor darurat kini di paling atas sebagai kisi tombol telepon dua kolom (nomor besar + nama), karena sebelumnya daftar tanda bahaya yang panjang mendorong nomor ke bawah. Tanda bahaya dan keterangan/sumber nomor dilipat. Dalam keadaan darurat orang perlu menelepon dulu, membaca kemudian.

- Saat semua langkah tercentang, pesan "Semua langkah selesai..." diberi emoji 🎉 di depannya (hiasan; disembunyikan dari pembaca layar karena kalimatnya sudah jelas).

- Hero Detail Panduan: "Perhatian" kini berwarna kuning lembut (token `catatan`), "Situasi" berganti hijau muda, dan label "Situasi" serta nama kelompok tidak lagi huruf kapital semua.

- "Perhatian" dipindah dari hero ke tepat di atas bagian "Pilihan solusi" (permintaan pemilik), tetap kuning. Tampil di semua panduan yang punya peringatan, termasuk yang isinya menyusul.

## Ilustrasi sederhana di hero Detail Panduan
- Hero kini punya ilustrasi kecil di sisi kanan judul, satu per kelompok (mandi, toilet, wudhu, grooming, umum, caregiver), menggantikan petak ikon. Berupa SVG inline (tanpa berkas unduhan, kurang dari 5 KB untuk semuanya), warna mengikuti token `utama` dan `daun`, dekoratif (`aria-hidden`). Ilustrasi sengaja hanya menggambarkan benda (pancuran, kloset, keran, cermin, pintu, hati), tanpa orang, ukuran, atau cara pasang, supaya tidak menyiratkan klaim teknis atau menempatkan penyandang disabilitas sebagai objek gambar.
- Ilustrasi digambar asisten dan sengaja sederhana; desainer bisa mengganti isi `src/components/Ilustrasi.tsx` dengan karya sendiri tanpa mengubah tata letak.

## Ilustrasi selebar panel untuk pilihan solusi (bertahap)
- Dibuat bertahap, mulai dari panduan "Lantai licin saat basah" (`bath-floor-slip`) saja. Tiap pilihan solusinya punya ilustrasi selebar panel di atas deskripsi: tanpa biaya (pel, genangan, ember), pakai alat (keset anti-slip dan stiker), renovasi (lantai berubin dengan saluran dan palu). Panduan lain belum punya, sehingga panelnya tidak berubah. Daftar ada di `src/components/IlustrasiSolusi.tsx` dengan kunci `idKartu:tingkat`; menambah panduan baru tinggal menambah satu entri.
- SVG inline dan dekoratif; hanya benda dan situasinya, tanpa orang, ukuran, atau cara pasang.
- Gaya ilustrasi diubah dari bentuk padat berwarna cerah (terkesan seperti gambar anak-anak) menjadi gambar garis tipis ala gambar teknik: dinding berubin tipis, lantai berperspektif, benda berkontur teal, isian tonal lembut, dan satu aksen hijau kecil. Tanpa kilau, tanda centang, atau bentuk bulat tebal.
- Ilustrasi "Tanpa biaya" untuk lantai licin diubah: lantai kini bersih dan kosong (tanpa genangan, ember, atau pel), dengan elemen kamar mandi tetap terlihat (pancuran yang mati, saluran lantai, kloset) dan kilau tipis sebagai tanda kering. Ini sesuai maksud langkahnya, yaitu hasil akhirnya lantai kering dan bebas benda.
- Ilustrasi solusi tidak lagi memakai isian padat berwarna hijau atau teal (keset, waterpas, dan lantai kini putih atau abu muda dengan garis), supaya tidak bersaing dengan tombol hijau di bawahnya. Jarak di panel diatur ulang: ilustrasi ke deskripsi 20px, deskripsi ke pil biaya dan waktu 16px.
- Jarak panel solusi dinaikkan 4px: ilustrasi ke deskripsi 24px, deskripsi ke pil 20px, pil ke tombol atau garis pemisah 24px.

## Halaman "Alat yang dibutuhkan" (Lihat alat) didesain ulang
- Latar putih (pengaturan `latarPutih` di `AksiHalaman`, hanya dipakai halaman ini). Tiap alat berupa kartu bergaris tipis tanpa bayangan: nama dan label afiliasi di atas, kotak hijau muda "Cek kecocokan dulu" berikon, daftar Spesifikasi dan Harga sebagai baris berpemisah (label di kiri, nilai di kanan), lalu tombol "Lihat produk" berikon tautan luar. Bila tautan belum ada, bagian itu berupa kotak abu "Tautan produk menyusul", bukan tombol nonaktif yang pucat. Ajakan "Pesan ke tukang" berada di kotak abu muda dengan ikon palu.

- Tombol "Kembali ke panduan" di dasar halaman "Alat yang dibutuhkan" dihapus (permintaan pemilik); panah kembali di header tetap ada. Halaman aksi lain (Pesan ke tukang) masih memilikinya.

- Kalimat "Baca cara cek kecocokan dulu sebelum membeli." dihapus dari halaman "Alat yang dibutuhkan" (permintaan pemilik); kotak "Cek kecocokan dulu" pada tiap alat sudah menyampaikannya. Teksnya dihapus dari konten.

- Tombol "Lihat alat" diganti "Lihat Spesifikasi dan Panduan" (`aksi.tombol.beli`; sempat lebih panjang, dipersingkat atas permintaan pemilik; kapitalisasi mengikuti permintaan pemilik). Teks ini satu sumber, jadi berlaku di panel solusi dan tombol utama kartu rencana di Panduan Saya.

- Header Detail Panduan (`/kartu/...`) dan halaman aksinya (`/aksi/...`) kini bertuliskan "Panduan" (dengan panah kembali) menggantikan logo "Transisi.", seperti halaman menu Panduan.
- Header halaman "Alat yang dibutuhkan" (`/aksi/beli/...`) bertuliskan "Pakai Alat" (`umum.headerPakaiAlat`), mengikuti nama tingkat solusinya; halaman aksi lain tetap "Panduan".

- Kepala halaman "Pakai Alat" diganti: label kecil "Alat yang dipakai ketika..." (`aksi.beli.label`) di atas, lalu judulnya adalah nama masalah panduan (mis. "Lantai licin saat basah") sehingga terbaca satu kalimat. Judul lama "Alat yang dibutuhkan" dan baris konteks "panduan · tingkat" dihapus. Saya menafsirkan "Masalahnya" sebagai judul masalah pada panduan; bila yang dimaksud teks harfiah "Masalahnya", cukup ubah `judul` di `AksiBeli.tsx`.

- Kepala halaman "Pakai Alat" kini berwarna hijau muda (`utama-muda`) dan memakai ilustrasi kelompok panduan di sisi kanan judul, seperti hero Detail Panduan. Pengaturan `kepalaPita` di kerangka halaman kini menerima `"hijau"` selain `true` (abu kehijauan).

- Hero halaman "Pakai Alat": ilustrasi dihapus; kartu alat pertama kini sedikit menimpa tepi bawah hero (pengaturan `kepalaTumpang` di kerangka halaman: hero diberi ruang bawah ekstra, isi naik 32px).

- Kotak "Cek kecocokan dulu" di halaman "Pakai Alat" berwarna kuning lembut (token `catatan`), sama dengan kotak peringatan di Detail Panduan, supaya terpisah dari hero hijau muda.

- Judul "Cek kecocokan dulu" dihapus dari kotak kuning di halaman "Pakai Alat"; kotak hanya berisi ikon papan centang dan teks pemeriksaannya.

## Data contoh (dummy) untuk alat di "Lantai licin saat basah"
- Atas permintaan pemilik, barang "Keset atau stiker anti-slip" di tingkat Pakai alat pada `bath-floor-slip` diisi data CONTOH supaya desain halaman bisa dinilai: spesifikasi umum (ditandai "(Data contoh)" di teksnya), harga "Rp 30.000 - Rp 150.000" (ditampilkan "Rp 30 rb - 150 rb"), dan tautan `https://example.com/contoh-keset-anti-slip` (alamat contoh yang memang tidak mengarah ke toko). Afiliasi tetap `false`. Semuanya WAJIB diganti dengan data asli dari survei sebelum dipakai pengguna sungguhan. Harga alat tidak memengaruhi mesin rekomendasi (hanya tampilan).
- Harga alat di halaman "Pakai Alat" kini memakai format singkat rb/jt seperti pil biaya.
- Di halaman "Pakai Alat", spesifikasi alat kini berlabel di atas dan nilai di bawahnya (rata kiri) karena teks spesifikasi bisa panjang; harga tetap satu baris dengan nilai di kanan.

## Foto produk di bawah judul
- Kolom opsional `gambar` pada `barang[]`: `{ "url": "https://...", "alt": "..." }` atau `null` (bawaan bila kolom tidak ditulis). Teks `alt` wajib mengisi bila ada `url`.
- Tampil di bawah judul produk di "Daftar alat" dan di layar Beli, lewat `src/components/GambarProduk.tsx`. Bingkai tinggi tetap (h-40), `object-contain`, `loading="lazy"`, `referrerPolicy="no-referrer"`.
- Tanpa foto: kotak polos dengan ikon kotak dan teks "Foto produk menyusul" (`aksi.beli.fotoMenyusul` di `content/ui.json`).
- Tidak ada foto yang diisi: tautan gambar tidak boleh dikarang. Semua produk contoh masih `null`.
- Foto dimuat dari alamat luar saat dilihat, jadi peramban pengguna menghubungi situs itu (alamat IP terlihat). Tanpa cookie atau data aplikasi, tetapi ini beda dari prinsip "tidak ada data keluar perangkat"; perlu keputusan tim bila foto mulai diisi (alternatif: simpan berkas kecil di `public/`).

## Menu Kontak menjadi Dukungan, tampilan dirapikan
- Nama menu dan header: "Kontak" menjadi "Dukungan" (`umum.tabDarurat`, `kontak.judul` di `content/ui.json`). Alamat tetap `/kontak` agar tautan lama tidak putus. Kalimat "lewat menu Dukungan" di panduan ikut diganti.
- Latar halaman putih (`latarPutih`), sesuai latar bawaan.
- Setiap jenis kontak punya ikon dalam kotak hijau muda (`IKON_KATEGORI` di `src/screens/Kontak.tsx`, dari lucide-react, dekoratif). Jenis kontak baru di `KategoriKontak` wajib diberi ikon, kalau tidak typecheck gagal.
- Alamat/kota memakai ikon pin dan baris sendiri, catatan di bawahnya. Tombol telepon dan WhatsApp selebar kartu, bertumpuk, supaya mudah ditekan satu tangan.
- **Dukungan tanpa merah:** nomor darurat kini dalam panel teal muda dengan ubin putih bernomor teal; "Kapan harus ke dokter atau IGD" memakai warna hangat `aksen` (terakota), bukan `bahaya`. Pesan tetap jelas lewat ikon (sirene, segitiga peringatan) dan teks, bukan warna saja. Token `bahaya` hanya dipakai untuk hapus data dan galat.
- **Revisi:** "Kapan harus ke dokter atau IGD" kembali memakai warna merah `bahaya` (permintaan pemilik). Nomor darurat tetap teal. Token `bahaya` dipakai untuk hapus data, galat, dan tanda bahaya medis.
- **Revisi warna Dukungan (permintaan pemilik):** panel "Nomor Kontak Darurat" merah (`bahaya`), kotak "Kapan harus ke dokter atau IGD" kuning lembut (token `catatan`, sama dengan catatan lain). Tetap ada ikon dan teks, jadi arti tidak bergantung pada warna.

## Menu Saya menjadi Profil
- Nama menu dan header: "Saya" menjadi "Profil" (`umum.tabSaya`, `saya.judul`). Alamat tetap `/saya`. Judul besar dan kalimat pengantar dihapus (judul tetap ada untuk pembaca layar); latar halaman putih.
- Kartu jawaban memakai baris berikon (ruangan, aktivitas, prioritas) dan status aktivitas berbentuk pil abu muda, supaya terbaca sekilas.

## Panduan Saya (setelah asesmen) dirapikan
- Kepala memakai pita hijau muda dan kartu pertama menimpa tepinya (seperti halaman Pakai Alat). Ikon bendera di depan penanda prioritas.
- Kartu kemajuan dan perkiraan biaya mendapat ikon dalam kotak hijau muda. Judul "Mulai dari sini" dan "Rekomendasi lainnya" menampilkan jumlah panduan dalam pil kecil.
- Kartu panduan (`KartuRingkas`): ikon dalam kotak hijau muda, tingkat solusi jadi baris bernomor 1-2-3 (urutan dari yang paling ringan), dan garis pemisah di atas tombol.
- **Revisi Panduan Saya:** latar halaman putih (`latarPutih`); pita kepala hijau muda dan kartu hero teal tetap.
- **Kepala Panduan Saya berlabel:** ruangan dan prioritas kini dua baris di kotak putih, masing-masing dengan ikon, label kecil ("Ruangan", "Prioritas"), nilai tebal, dan tautan ubah ("Ganti", "Ubah jawaban") di kanan. Sebelumnya teksnya lepas tanpa label. Label memakai teks yang sudah ada di `content/ui.json` (`saya.ruangan`, `saya.prioritas`).
- **"Beres" diganti "Teratasi"** di semua teks yang terlihat pengguna (kartu kemajuan, lipatan "Sudah teratasi", penanda di Jelajah, balasan setelah menandai "Sudah cukup"). Alasannya: tiap panduan membahas satu masalah, dan "Sudah cukup" berarti masalahnya teratasi, bukan panduannya selesai dibaca. Nama kunci di kode (`beres`) tidak diubah supaya tes dan struktur tetap sama. Kata "dibereskan" (ruangan yang dibereskan) tidak diubah.
- **Rincian kemajuan:** kartu kemajuan punya lipatan "Lihat rincian" berisi semua panduan, masing-masing dengan status teks (Teratasi, Masih sulit, Belum dicoba) dan tautan ke panduannya.
