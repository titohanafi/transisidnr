import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { titikDinding } from "../domain/denahGeometri";
import { gambarShower, TINGGI_DINDING_PANEL, type Kerangka, type Titik } from "../domain/gambarShower";
import { LANTAI_DALAM, LANTAI_LEBAR, posisiTigaMenempel } from "../domain/isoTigaGeometri";
import { OBJEK_DENAH, type LetakDenah, type ObjekDenah, type VarianShower } from "../domain/pindai";
import { LapisPrimitif } from "./GambarShower";
import { bangunPembungkusObjek, MODEL_SRC, TEBAL_DINDING, TINGGI_DINDING } from "./iso3dKalibrasi";

const ELEVASI_KAMERA = Math.atan(1 / Math.sqrt(2));
const JARAK_KAMERA = 12;
// Frustum harus cukup besar untuk memuat lantai DAN tinggi dinding (sebelumnya cuma dihitung dari diagonal
// lantai, jadi kalau TINGGI_DINDING dinaikkan bagian atas dinding/pintu bisa terpotong) — dicek visual.
const UKURAN_FRUSTUM = Math.max(Math.hypot(LANTAI_LEBAR, LANTAI_DALAM) / 2, TINGGI_DINDING * 1.1) * 1.2;

/** Azimuth kamera (radian) supaya dinding yang solid SELALU di sisi jauh dari kamera (tidak menghalangi benda) —
 *  lihat penjelasan perhitungan di plan Milestone 5: kamera di (+X,+Z) (azimuth 45°) membuat sisi kiri+belakang
 *  jadi "jauh" (aman solid); kamera di (-X,+Z) (azimuth 135°) membuat sisi kanan+belakang yang jauh. Ini rotasi
 *  KAMERA sungguhan (bukan trik tukar dinding seperti versi SVG) — menjawab keluhan awal proyek ini. */
function azimuthDariSudut(sisiSamping: "kiri" | "kanan"): number {
  return sisiSamping === "kanan" ? (3 * Math.PI) / 4 : Math.PI / 4;
}

/**
 * Proyeksi dari koordinat ruangan (x sepanjang lebar, y sepanjang kedalaman, z tinggi) ke piksel kanvas, memakai
 * kamera ortografik yang parameternya SAMA dengan kamera di scene (azimuth, frustum, titik bidik), supaya gambar
 * shower yang ditumpuk di atas kanvas pas dengan dinding 3D di titik mana pun dan di sudut pandang mana pun.
 */
function bangunProyeksi(azimuth: number, lebar: number, tinggi: number): (x: number, y: number, z: number) => Titik {
  const aspek = lebar / tinggi;
  const kamera = new THREE.OrthographicCamera(-UKURAN_FRUSTUM * aspek, UKURAN_FRUSTUM * aspek, UKURAN_FRUSTUM, -UKURAN_FRUSTUM, 0.1, 30);
  kamera.position.copy(posisiKamera(azimuth));
  kamera.lookAt(0, 0.3, 0);
  kamera.updateMatrixWorld();
  kamera.updateProjectionMatrix();
  const v = new THREE.Vector3();
  return (x, y, z) => {
    v.set(x, z, y).project(kamera);
    return [(v.x * 0.5 + 0.5) * lebar, (0.5 - v.y * 0.5) * tinggi];
  };
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
 *
 * Shower TIDAK lagi memakai model GLB: digambar dengan gaya manual perakitan (`../domain/gambarShower.ts`) sebagai
 * lapisan SVG di atas kanvas, diproyeksikan lewat kamera yang sama, sesuai jenis shower yang terbaca/dipilih.
 */
export function PratinjauRuangIso3D({
  letak,
  sudutAktif,
  varianShower = "tidak_jelas",
  kelas = "h-96 w-full",
}: {
  letak: (id: ObjekDenah) => LetakDenah;
  sudutAktif: { x: "kiri" | "kanan" };
  varianShower?: VarianShower;
  kelas?: string;
}) {
  const pembungkusRef = useRef<HTMLDivElement>(null);
  const [ukuran, setUkuran] = useState<{ lebar: number; tinggi: number } | null>(null);
  useEffect(() => {
    const el = pembungkusRef.current;
    if (!el) return;
    const ukur = () => setUkuran(el.clientWidth > 0 && el.clientHeight > 0 ? { lebar: el.clientWidth, tinggi: el.clientHeight } : null);
    ukur();
    const pengamat = new ResizeObserver(ukur);
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);
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

    const ukuranFrustum = UKURAN_FRUSTUM;
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
      // Shower digambar sebagai lapisan SVG (lihat bawah), bukan model GLB.
      if (id === "area_mandi") continue;
      // `letak(id)` (closure dari DenahKamarMandi.tsx) sudah menjatuhkan ke POSISI_BAWAAN kalau dindingnya
      // "tidak_terlihat" — selalu mengembalikan LetakDenah yang valid (4 dinding, tidak pernah "tidak_terlihat").
      const letakId = letak(id);
      loader.load(
        MODEL_SRC[id],
        (gltf) => {
          if (batal) return;
          // `bangunPembungkusObjek` SATU-SATUNYA tempat logika skala/posisi/rotasi ditulis — dipakai sama persis
          // oleh alat bantu dev `KalibrasiRotasiDev.tsx`, supaya tidak ada dua salinan yang diam-diam beda.
          scene.add(bangunPembungkusObjek(id, letakId, gltf.scene));
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

  const azimuth = azimuthDariSudut(sudutAktif.x);
  let lapisShower = null;
  if (ukuran) {
    const letakShower = letak("area_mandi");
    const dinding = titikDinding(letakShower).dinding;
    const posisi = posisiTigaMenempel(letakShower);
    // Permukaan dalam dinding (dinding digambar setebal TEBAL_DINDING, berpusat di garis lantai).
    const bidang =
      dinding === "belakang"
        ? -LANTAI_DALAM / 2 + TEBAL_DINDING / 2
        : dinding === "depan"
          ? LANTAI_DALAM / 2 - TEBAL_DINDING / 2
          : dinding === "kiri"
            ? -LANTAI_LEBAR / 2 + TEBAL_DINDING / 2
            : LANTAI_LEBAR / 2 - TEBAL_DINDING / 2;
    const kerangka: Kerangka = {
      dinding,
      sepanjang: dinding === "belakang" || dinding === "depan" ? posisi.x : posisi.z,
      bidang,
      proyeksi: bangunProyeksi(azimuth, ukuran.lebar, ukuran.tinggi),
      skala: TINGGI_DINDING / TINGGI_DINDING_PANEL,
      lihat: { x: sudutAktif.x === "kanan" ? -1 : 1, y: 1 },
    };
    lapisShower = (
      <svg
        viewBox={`0 0 ${ukuran.lebar} ${ukuran.tinggi}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <g strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round">
          <LapisPrimitif daftar={gambarShower(varianShower, "kondisi", { kerangka })} tebal={0.75} />
        </g>
      </svg>
    );
  }

  return (
    <div ref={pembungkusRef} className={`relative mx-auto ${kelas}`}>
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      {lapisShower}
    </div>
  );
}
