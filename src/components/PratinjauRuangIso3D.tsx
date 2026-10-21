import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LANTAI_DALAM, LANTAI_LEBAR, posisiTiga, posisiTigaMenempel } from "../domain/isoTigaGeometri";
import { OBJEK_DENAH, type LetakDenah, type ObjekDenah } from "../domain/pindai";
import {
  DASAR_Y,
  KEMIRINGAN_AREA_MANDI,
  MODEL_SRC,
  ROTASI_KALIBRASI,
  TEBAL_DINDING,
  TINGGI_DINDING,
  TINGGI_TARGET,
} from "./iso3dKalibrasi";

const ELEVASI_KAMERA = Math.atan(1 / Math.sqrt(2));
const JARAK_KAMERA = 12;

/** Azimuth kamera (radian) supaya dinding yang solid SELALU di sisi jauh dari kamera (tidak menghalangi benda) —
 *  lihat penjelasan perhitungan di plan Milestone 5: kamera di (+X,+Z) (azimuth 45°) membuat sisi kiri+belakang
 *  jadi "jauh" (aman solid); kamera di (-X,+Z) (azimuth 135°) membuat sisi kanan+belakang yang jauh. Ini rotasi
 *  KAMERA sungguhan (bukan trik tukar dinding seperti versi SVG) — menjawab keluhan awal proyek ini. */
function azimuthDariSudut(sisiSamping: "kiri" | "kanan"): number {
  return sisiSamping === "kanan" ? (3 * Math.PI) / 4 : Math.PI / 4;
}

function posisiKamera(azimuth: number): THREE.Vector3 {
  return new THREE.Vector3(
    JARAK_KAMERA * Math.cos(ELEVASI_KAMERA) * Math.cos(azimuth),
    JARAK_KAMERA * Math.sin(ELEVASI_KAMERA),
    JARAK_KAMERA * Math.cos(ELEVASI_KAMERA) * Math.sin(azimuth),
  );
}

/**
 * Scene Three.js tingkat-ruangan — Milestone 4+5 (lihat DECISIONS.md), prototipe di belakang flag `VITE_ISO_3D`.
 * Menampilkan ke-4 benda (pintu/kloset/wastafel/shower) diposisikan+dirotasi sesuai `letak(id)` yang sama persis
 * dipakai tampak-atas/isometrik SVG (lewat `posisiTiga`, turunan dari `titikDinding`), ditambah dinding (belakang
 * selalu, satu sisi samping tergantung `sudutAktif.x`) dan kamera yang BENAR-BENAR berputar saat tombol putar
 * diklik (bukan trik tukar dinding solid seperti versi SVG). BELUM ada warna status atau badge — lihat scope
 * milestone di plan.
 */
export function PratinjauRuangIso3D({
  letak,
  sudutAktif,
  kelas = "h-96 w-full",
}: {
  letak: (id: ObjekDenah) => LetakDenah;
  sudutAktif: { x: "kiri" | "kanan" };
  kelas?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const dindingKiriRef = useRef<THREE.Object3D | null>(null);
  const dindingKananRef = useRef<THREE.Object3D | null>(null);

  // Efek pemasangan: bangun scene SEKALI (lantai, dinding, model, loop render) — supaya klik tombol putar (efek
  // kedua di bawah) tidak memuat ulang model GLB dari jaringan tiap kali, cukup pindahkan kamera + ganti dinding
  // mana yang terlihat lewat ref, jauh lebih ringan untuk pengguna kuota rendah.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();

    // Lantai acuan: datar, netral.
    const lantai = new THREE.Mesh(
      new THREE.PlaneGeometry(LANTAI_LEBAR, LANTAI_DALAM),
      new THREE.MeshStandardMaterial({ color: 0xe5e7eb, side: THREE.DoubleSide }),
    );
    lantai.rotation.x = -Math.PI / 2;
    scene.add(lantai);

    // Dinding belakang: selalu ada, di sisi z rendah (dinding "belakang" = y rendah di titikDinding -> z rendah
    // lewat posisiTiga). Dinding "depan" (sisi kamera/pintu) tidak pernah digambar — konsisten dengan versi SVG.
    const materialDinding = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, side: THREE.DoubleSide });
    const dindingBelakang = new THREE.Mesh(new THREE.BoxGeometry(LANTAI_LEBAR, TINGGI_DINDING, TEBAL_DINDING), materialDinding);
    dindingBelakang.position.set(0, TINGGI_DINDING / 2, -LANTAI_DALAM / 2);
    scene.add(dindingBelakang);

    const dindingKiri = new THREE.Mesh(new THREE.BoxGeometry(TEBAL_DINDING, TINGGI_DINDING, LANTAI_DALAM), materialDinding);
    dindingKiri.position.set(-LANTAI_LEBAR / 2, TINGGI_DINDING / 2, 0);
    scene.add(dindingKiri);
    dindingKiriRef.current = dindingKiri;

    const dindingKanan = new THREE.Mesh(new THREE.BoxGeometry(TEBAL_DINDING, TINGGI_DINDING, LANTAI_DALAM), materialDinding);
    dindingKanan.position.set(LANTAI_LEBAR / 2, TINGGI_DINDING / 2, 0);
    scene.add(dindingKanan);
    dindingKananRef.current = dindingKanan;

    // Frustum harus cukup besar untuk memuat lantai DAN tinggi dinding (sebelumnya cuma dihitung dari diagonal
    // lantai, jadi kalau TINGGI_DINDING dinaikkan bagian atas dinding/pintu bisa terpotong) — dicek visual.
    const ukuranDiagonal = Math.hypot(LANTAI_LEBAR, LANTAI_DALAM) / 2;
    const ukuranFrustum = Math.max(ukuranDiagonal, TINGGI_DINDING * 1.1) * 1.2;
    const camera = new THREE.OrthographicCamera(-ukuranFrustum, ukuranFrustum, ukuranFrustum, -ukuranFrustum, 0.1, 30);
    camera.position.copy(posisiKamera(azimuthDariSudut(sudutAktif.x)));
    camera.lookAt(0, 0.3, 0);
    kameraRef.current = camera;

    // Dinding samping yang solid: sesuai `sudutAktif.x` saat dipasang — efek kedua di bawah yang mengurus
    // perubahan berikutnya (klik tombol putar), tanpa membangun ulang scene ini.
    dindingKiri.visible = sudutAktif.x === "kiri";
    dindingKanan.visible = sudutAktif.x === "kanan";

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const cahayaUtama = new THREE.DirectionalLight(0xffffff, 1.8);
    cahayaUtama.position.set(4, 8, 6);
    scene.add(cahayaUtama);
    const cahayaPengisi = new THREE.DirectionalLight(0xffffff, 0.9);
    cahayaPengisi.position.set(-4, 4, -6);
    scene.add(cahayaPengisi);

    let batal = false;
    const loader = new GLTFLoader();
    for (const id of OBJEK_DENAH) {
      // `letak(id)` (closure dari DenahKamarMandi.tsx) sudah menjatuhkan ke POSISI_BAWAAN kalau dindingnya
      // "tidak_terlihat" — selalu mengembalikan LetakDenah yang valid (4 dinding, tidak pernah "tidak_terlihat").
      // `area_mandi` (kepala shower) & `pintu` (daun pintu) pakai `posisiTigaMenempel` (rata ke garis dinding
      // sungguhan di satuan 3D) karena keduanya SUNGGUHAN menempel/tertanam di dinding — beda dari kloset/
      // wastafel yang wajar berdiri berjarak dari dinding (lihat komentar di isoTigaGeometri.ts). Tanpa ini,
      // shower terlihat mengambang di tengah ruangan dan pintu menyisakan sejumput lantai di belakangnya yang
      // seharusnya sudah jadi bagian dinding.
      const letakId = letak(id);
      const menempel = id === "area_mandi" || id === "pintu";
      const posisi = menempel ? posisiTigaMenempel(letakId) : posisiTiga(letakId);
      // Dorong sedikit ke dalam ruangan (menjauhi garis dinding) supaya mesh tidak z-fighting / menembus dinding
      // — kecil saja (separuh tebal dinding + sedikit), cukup supaya kelihatan menempel tanpa tenggelam di dalam
      // geometri dinding.
      if (menempel) {
        const dorong = TEBAL_DINDING / 2 + 0.02;
        if (letakId.dinding === "kiri") posisi.x += dorong;
        else if (letakId.dinding === "kanan") posisi.x -= dorong;
        else if (letakId.dinding === "depan") posisi.z -= dorong;
        else posisi.z += dorong;
      }
      loader.load(
        MODEL_SRC[id],
        (gltf) => {
          if (batal) return;
          const model = gltf.scene;
          const kotakAsli = new THREE.Box3().setFromObject(model);
          const ukuranAsli = new THREE.Vector3();
          kotakAsli.getSize(ukuranAsli);
          const skala = TINGGI_TARGET[id] / Math.max(ukuranAsli.y, 0.0001);
          model.scale.setScalar(skala);
          const kotakSetelahSkala = new THREE.Box3().setFromObject(model);
          const pusat = new THREE.Vector3();
          kotakSetelahSkala.getCenter(pusat);
          // Pusatkan x/z benda ke titik jangkarnya sendiri (0,0,0) dulu, baru digeser ke posisi dunia — supaya
          // titik jangkar konsisten di tengah-bawah model, lepas dari titik tumpu aslinya di file GLB.
          model.position.set(-pusat.x, -kotakSetelahSkala.min.y, -pusat.z);
          // Kemiringan kepala shower diterapkan di ROTASI LOKAL model (bukan pembungkus) — supaya "menunduk"-nya
          // selalu relatif ke benda itu sendiri, lepas dari rotasi Y pembungkus yang menentukan dinding mana yang
          // dihadapi (dua rotasi di dua node berbeda, tidak perlu mengatur urutan Euler).
          if (id === "area_mandi") model.rotation.x = KEMIRINGAN_AREA_MANDI;
          const pembungkus = new THREE.Group();
          pembungkus.add(model);
          pembungkus.position.set(posisi.x, DASAR_Y[id], posisi.z);
          pembungkus.rotation.y = posisi.rotasiY + ROTASI_KALIBRASI[id];
          scene.add(pembungkus);
        },
        undefined,
        (err) => {
          console.error(`Gagal memuat model 3D untuk "${id}" (prototipe VITE_ISO_3D):`, err);
        },
      );
    }

    let frameId = 0;
    const render = () => {
      const { clientWidth, clientHeight } = canvas;
      if (clientWidth > 0 && clientHeight > 0 && (canvas.width !== clientWidth || canvas.height !== clientHeight)) {
        renderer.setSize(clientWidth, clientHeight, false);
        camera.left = -ukuranFrustum * (clientWidth / clientHeight);
        camera.right = ukuranFrustum * (clientWidth / clientHeight);
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      batal = true;
      cancelAnimationFrame(frameId);
      renderer.dispose();
      kameraRef.current = null;
      dindingKiriRef.current = null;
      dindingKananRef.current = null;
    };
    // `letak` adalah closure baru tiap render dari pemanggil; scene cukup dibangun ulang saat komponen dipasang,
    // bukan tiap kali closure-nya berganti identitas. `sudutAktif` cuma dibaca untuk nilai AWAL kamera/dinding —
    // perubahan berikutnya ditangani efek kedua di bawah (`kameraRef`/`dindingKiriRef`/`dindingKananRef`) supaya
    // klik tombol putar tidak memuat ulang model GLB dari jaringan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efek kedua: HANYA respons klik tombol putar — pindahkan kamera + ganti dinding mana yang terlihat lewat ref
  // yang sudah dibangun efek pertama, TANPA memuat ulang model (ringan untuk pengguna kuota rendah). Ini yang
  // membuat rotasi di scene 3D ini SUNGGUHAN memutar sudut pandang, bukan trik tukar dinding solid seperti SVG.
  useEffect(() => {
    const camera = kameraRef.current;
    if (!camera) return;
    camera.position.copy(posisiKamera(azimuthDariSudut(sudutAktif.x)));
    camera.lookAt(0, 0.3, 0);
    if (dindingKiriRef.current) dindingKiriRef.current.visible = sudutAktif.x === "kiri";
    if (dindingKananRef.current) dindingKananRef.current.visible = sudutAktif.x === "kanan";
  }, [sudutAktif.x]);

  return <canvas ref={canvasRef} className={kelas} aria-hidden="true" />;
}
