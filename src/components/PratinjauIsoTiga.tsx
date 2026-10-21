import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Pratinjau 3D kloset lewat Three.js — prototipe Milestone 3 (lihat DECISIONS.md: "Pengecualian aturan 'tanpa
 * pustaka berat'"), dibandingkan langsung dengan versi SVG lewat flag dev `VITE_ISO_3D`. BUKAN pengganti produksi —
 * cuma menampilkan satu model kloset dari sudut isometrik, belum terintegrasi ke posisi/rotasi/status denah
 * sungguhan (lihat scope Milestone 3 di plan).
 *
 * Kamera orthographic diposisikan untuk sudut pandang isometrik SEJATI (elevasi atan(1/√2) ≈ 35.264°, azimuth 45°
 * — konvensi "sudut pandang pojok" baku di grafis 3D), beda dari trik 2D `iso()` yang dipakai versi SVG (itu
 * proyeksi 30°/30° tanpa kompresi sumbu) — keduanya sama-sama disebut "isometrik" tapi rumusnya beda; di sini
 * dipakai konvensi 3D baku karena modelnya memang objek 3D sungguhan, bukan diturunkan dari `iso()`.
 */
export function PratinjauIsoTiga({ kelas = "h-80 w-full" }: { kelas?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();

    const ukuranFrustum = 0.9;
    const camera = new THREE.OrthographicCamera(-ukuranFrustum, ukuranFrustum, ukuranFrustum, -ukuranFrustum, 0.1, 10);
    const elevasi = Math.atan(1 / Math.sqrt(2));
    const azimuth = Math.PI / 4;
    const jarakKamera = 3;
    camera.position.set(
      jarakKamera * Math.cos(elevasi) * Math.cos(azimuth),
      jarakKamera * Math.sin(elevasi),
      jarakKamera * Math.cos(elevasi) * Math.sin(azimuth),
    );
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const arahCahaya = new THREE.DirectionalLight(0xffffff, 0.9);
    arahCahaya.position.set(2, 4, 3);
    scene.add(arahCahaya);

    let frameId = 0;
    let batal = false;
    const loader = new GLTFLoader();
    loader.load(
      "/model/toilet/kenney-toilet.glb",
      (gltf) => {
        if (batal) return;
        const model = gltf.scene;
        // Normalisasi ukuran model (satuan aslinya tidak diketahui pasti) supaya tingginya konsisten mengisi
        // kanvas, lalu dipusatkan di sumbu x/z dan didudukkan di lantai (y=0) — model mentah biasanya punya
        // titik tumpu/origin yang tidak selalu di tengah-bawah.
        const kotakAsli = new THREE.Box3().setFromObject(model);
        const ukuranAsli = new THREE.Vector3();
        kotakAsli.getSize(ukuranAsli);
        const tinggiTarget = 0.8;
        const skala = tinggiTarget / Math.max(ukuranAsli.y, 0.0001);
        model.scale.setScalar(skala);
        const kotakSetelahSkala = new THREE.Box3().setFromObject(model);
        const pusat = new THREE.Vector3();
        kotakSetelahSkala.getCenter(pusat);
        model.position.set(-pusat.x, -kotakSetelahSkala.min.y, -pusat.z);
        scene.add(model);
      },
      undefined,
      (err) => {
        console.error("Gagal memuat model kloset 3D (prototipe VITE_ISO_3D):", err);
      },
    );

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
  }, []);

  return <canvas ref={canvasRef} className={kelas} aria-hidden="true" />;
}
