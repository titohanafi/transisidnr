import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LANTAI_DALAM, LANTAI_LEBAR, posisiTiga } from "../domain/isoTigaGeometri";
import { OBJEK_DENAH, type LetakDenah, type ObjekDenah } from "../domain/pindai";

const MODEL_SRC: Record<ObjekDenah, string> = {
  pintu: "/model/pintu/quaternius-pintu.glb",
  kloset: "/model/toilet-quaternius/quaternius-toilet.glb",
  wastafel: "/model/wastafel/quaternius-wastafel.glb",
  area_mandi: "/model/shower/poly-google-shower-head.glb",
};

// Tinggi target tiap benda setelah dinormalkan (satuan Three.js, sama skala dengan lantai — lihat
// `LANTAI_LEBAR`/`LANTAI_DALAM` di isoTigaGeometri.ts) — BEDA dari PratinjauIsoTiga.tsx (yang menyamakan semua
// benda ke 0.8 supaya adil dibandingkan satu-satu) karena di sini benda-benda berdiri BERSAMA dalam satu ruangan,
// jadi proporsi relatif antar benda penting (pintu harus jelas lebih tinggi dari kloset, dst). Angka-angka ini
// perkiraan kasar (bukan ukuran nyata — dilarang mengarang ukuran kamar mandi pengguna, lihat CLAUDE.md), cuma
// supaya siluetnya masuk akal berdampingan.
const TINGGI_TARGET: Record<ObjekDenah, number> = {
  pintu: 1.0,
  kloset: 0.4,
  wastafel: 0.5,
  area_mandi: 0.25,
};

// Dasar vertikal (y) tempat benda "berdiri" — kebanyakan di lantai (y=0), KECUALI kepala shower yang menempel
// tinggi di dinding. Belum ada dinding 3D di milestone ini (lihat plan), jadi angka 0.9 ini perkiraan kasar posisi
// "tinggi di dinding" tanpa acuan dinding sungguhan — akan dihitung ulang begitu dinding 3D ditambahkan.
const DASAR_Y: Record<ObjekDenah, number> = {
  pintu: 0,
  kloset: 0,
  wastafel: 0,
  area_mandi: 0.9,
};

// Rotasi tambahan PER JENIS BENDA (radian, ditambahkan ke rotasi dasar dari `posisiTiga`) — model GLB diekspor
// dengan arah "depan" bawaan yang tidak diketahui pasti (tidak ada konvensi universal), jadi mungkin perlu offset
// kalibrasi supaya benda benar-benar menghadap ke dalam ruangan, bukan ke dinding. Mulai dari 0 (asumsikan model
// sudah menghadap +Z) — DITENTUKAN/DIPERBAIKI lewat cek visual langsung di browser, lihat commit kalibrasi.
const ROTASI_KALIBRASI: Record<ObjekDenah, number> = {
  pintu: 0,
  kloset: 0,
  wastafel: 0,
  area_mandi: 0,
};

/**
 * Scene Three.js tingkat-ruangan — Milestone 4 (lihat DECISIONS.md), prototipe di belakang flag `VITE_ISO_3D`.
 * Menampilkan ke-4 benda (pintu/kloset/wastafel/shower) diposisikan+dirotasi sesuai `letak(id)` yang sama persis
 * dipakai tampak-atas/isometrik SVG (lewat `posisiTiga`, turunan dari `titikDinding`) — supaya tata letaknya bisa
 * dinilai sesuai data sungguhan, bukan sekadar galeri benda berdiri sendiri (lihat `PratinjauIsoTiga.tsx`/
 * `GaleriIso3D` untuk itu). BELUM ada dinding 3D, sinkron rotasi kamera, warna status, atau badge — lihat scope
 * milestone di plan.
 */
export function PratinjauRuangIso3D({
  letak,
  kelas = "h-96 w-full",
}: {
  letak: (id: ObjekDenah) => LetakDenah;
  kelas?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();

    // Lantai acuan: datar, netral, cukup untuk konteks spasial tanpa kompleksitas dinding 3D (lihat scope plan).
    const lantai = new THREE.Mesh(
      new THREE.PlaneGeometry(LANTAI_LEBAR, LANTAI_DALAM),
      new THREE.MeshStandardMaterial({ color: 0xe5e7eb, side: THREE.DoubleSide }),
    );
    lantai.rotation.x = -Math.PI / 2;
    scene.add(lantai);

    const ukuranDiagonal = Math.hypot(LANTAI_LEBAR, LANTAI_DALAM) / 2;
    const ukuranFrustum = ukuranDiagonal * 1.15;
    const camera = new THREE.OrthographicCamera(-ukuranFrustum, ukuranFrustum, ukuranFrustum, -ukuranFrustum, 0.1, 30);
    const elevasi = Math.atan(1 / Math.sqrt(2));
    const azimuth = Math.PI / 4;
    const jarakKamera = 12;
    camera.position.set(
      jarakKamera * Math.cos(elevasi) * Math.cos(azimuth),
      jarakKamera * Math.sin(elevasi),
      jarakKamera * Math.cos(elevasi) * Math.sin(azimuth),
    );
    camera.lookAt(0, 0.3, 0);

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
      const posisi = posisiTiga(letak(id));
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
    };
    // `letak` adalah closure baru tiap render dari pemanggil; scene cukup dibangun ulang saat komponen dipasang,
    // bukan tiap kali closure-nya berganti identitas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={kelas} aria-hidden="true" />;
}
