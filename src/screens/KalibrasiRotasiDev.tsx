// Alat bantu DEV-ONLY (lihat App.tsx — hanya didaftarkan saat `import.meta.env.DEV`, tidak pernah masuk build
// produksi) untuk memverifikasi kalibrasi rotasi 3D Pindai. Dibuat karena riwayat berulang: klaim "sudah
// diverifikasi di 4 dinding" oleh asisten AI ternyata KELIRU — render isometrik 45° di `PratinjauRuangIso3D.tsx`
// terlalu kecil & ambigu untuk dipakai menilai arah benda (lihat catatan di `iso3dKalibrasi.ts`). Di sini tiap
// benda dirender SENDIRIAN menempel SATU dinding, dengan kamera TEGAK LURUS ke dinding itu (bukan isometrik) —
// supaya "menghadap ke ruangan" vs "menghadap ke dinding" tidak ambigu. User menandai tiap sel Benar/Salah
// sendiri; asisten AI TIDAK BOLEH mengklaim kalibrasi benar tanpa tanda ini.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  bangunPembungkusObjek,
  DASAR_Y,
  KEMIRINGAN_AREA_MANDI,
  MODEL_SRC,
  ROTASI_KALIBRASI,
  TEBAL_DINDING,
  TINGGI_DINDING,
  TINGGI_TARGET,
} from "../components/iso3dKalibrasi";
import { LANTAI_DALAM, LANTAI_LEBAR, posisiTiga, posisiTigaMenempel } from "../domain/isoTigaGeometri";
import { DINDING_DENAH, OBJEK_DENAH, type DindingDenah, type ObjekDenah } from "../domain/pindai";

const KUNCI_TANDA = "transisi:dev:kalibrasi-rotasi:v1";

type Tanda = "benar" | "salah";

function bacaTanda(): Record<string, Tanda> {
  try {
    const mentah = localStorage.getItem(KUNCI_TANDA);
    return mentah ? (JSON.parse(mentah) as Record<string, Tanda>) : {};
  } catch {
    return {};
  }
}

function simpanTanda(tanda: Record<string, Tanda>) {
  try {
    localStorage.setItem(KUNCI_TANDA, JSON.stringify(tanda));
  } catch {
    // localStorage bisa gagal (mode privat dsb) — tanda cukup hilang, bukan fatal untuk alat dev ini.
  }
}

// Cache model GLB bersama ANTAR SEL (4 benda x 4 dinding = 16 sel, tapi cuma 4 model unik) — supaya tiap model
// cuma diunduh SEKALI, bukan 4x (satu per dinding yang diuji). `bangunPembungkusObjek` meng-clone sebelum
// dipakai, jadi aman dipakai ulang dari satu objek Promise yang sama.
const cacheModel = new Map<string, Promise<THREE.Object3D>>();
function muatModel(src: string): Promise<THREE.Object3D> {
  let janji = cacheModel.get(src);
  if (!janji) {
    janji = new Promise((resolve, reject) => {
      new GLTFLoader().load(src, (gltf) => resolve(gltf.scene), undefined, reject);
    });
    cacheModel.set(src, janji);
  }
  return janji;
}

/** Posisi+arah kamera ORTOGRAFIK TEGAK LURUS ke satu dinding tertentu (BUKAN isometrik seperti tampilan utama) —
 *  inti dari alat ini: dari sudut pandang ini, benda yang menghadap ke ruangan vs menghadap ke dinding langsung
 *  kelihatan beda (yang benar: sisi "depan" benda menghadap kamera; yang salah: kita melihat punggung/belakangnya
 *  atau benda menempel miring ke dinding). Dibidik ke TENGAH TINGGI BENDA ITU SENDIRI (bukan tengah dinding) —
 *  supaya benda pendek (kloset/wastafel) tidak jadi titik kecil di tengah bingkai yang dihitung untuk benda
 *  setinggi pintu.
 *
 *  Kamera DINAIKKAN sedikit (~20° dari horizontal, BUKAN 45° isometrik seperti tampilan utama) — murni tegak
 *  lurus ternyata membuat bentuk mangkuk kloset/wastafel tidak terbaca (dari depan persis, mangkuknya tersembunyi
 *  di belakang siluet tangki, terlihat seperti kotak datar polos). Sedikit dari atas membuka bentuknya tanpa
 *  membuat arah "menghadap ruangan vs menghadap dinding" ambigu lagi seperti render isometrik 45° lama. */
function kameraUntukDinding(objek: ObjekDenah, dinding: DindingDenah): { posisi: THREE.Vector3; target: THREE.Vector3 } {
  const jarak = 6;
  const tinggiTarget = DASAR_Y[objek] + TINGGI_TARGET[objek] / 2;
  const tinggiKamera = tinggiTarget + jarak * Math.tan((20 * Math.PI) / 180);
  switch (dinding) {
    case "belakang":
      return { posisi: new THREE.Vector3(0, tinggiKamera, jarak), target: new THREE.Vector3(0, tinggiTarget, 0) };
    case "depan":
      return { posisi: new THREE.Vector3(0, tinggiKamera, -jarak), target: new THREE.Vector3(0, tinggiTarget, 0) };
    case "kiri":
      return { posisi: new THREE.Vector3(jarak, tinggiKamera, 0), target: new THREE.Vector3(0, tinggiTarget, 0) };
    case "kanan":
      return { posisi: new THREE.Vector3(-jarak, tinggiKamera, 0), target: new THREE.Vector3(0, tinggiTarget, 0) };
  }
}

function lebarDindingUntuk(dinding: DindingDenah): number {
  return dinding === "kiri" || dinding === "kanan" ? LANTAI_DALAM : LANTAI_LEBAR;
}

/** Satu sel grid: scene Three.js mandiri berisi SATU dinding (solid, tegak lurus kamera) + SATU benda menempel
 *  padanya di posisi "tengah". Dibangun sebagai efek React biasa (bukan lewat `PratinjauRuangIso3D` yang didesain
 *  untuk ruangan penuh 4 dinding+4 benda sekaligus) karena kebutuhannya beda: di sini tiap sel cuma perlu 1
 *  dinding dari sudut tegak lurus, bukan ruangan isometrik lengkap. */
function SelKalibrasi({ objek, dinding }: { objek: ObjekDenah; dinding: DindingDenah }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let batal = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6);

    const lebarDinding = lebarDindingUntuk(dinding);
    const materialDinding = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, side: THREE.DoubleSide });
    const dindingMesh = new THREE.Mesh(
      dinding === "kiri" || dinding === "kanan"
        ? new THREE.BoxGeometry(TEBAL_DINDING, TINGGI_DINDING, lebarDinding)
        : new THREE.BoxGeometry(lebarDinding, TINGGI_DINDING, TEBAL_DINDING),
      materialDinding,
    );
    const posisiDinding =
      dinding === "kiri"
        ? [-LANTAI_LEBAR / 2, TINGGI_DINDING / 2, 0]
        : dinding === "kanan"
          ? [LANTAI_LEBAR / 2, TINGGI_DINDING / 2, 0]
          : dinding === "depan"
            ? [0, TINGGI_DINDING / 2, LANTAI_DALAM / 2]
            : [0, TINGGI_DINDING / 2, -LANTAI_DALAM / 2];
    dindingMesh.position.set(posisiDinding[0], posisiDinding[1], posisiDinding[2]);
    scene.add(dindingMesh);

    const lantai = new THREE.Mesh(
      new THREE.PlaneGeometry(LANTAI_LEBAR, LANTAI_DALAM),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, side: THREE.DoubleSide }),
    );
    lantai.rotation.x = -Math.PI / 2;
    scene.add(lantai);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const cahaya = new THREE.DirectionalLight(0xffffff, 1.2);
    cahaya.position.set(2, 6, 4);
    scene.add(cahaya);

    // Dibidik ke ukuran BENDA ITU SENDIRI (bukan lebar dinding penuh, ATAU batas tetap berdasar TINGGI_DINDING) —
    // sebelumnya pakai lebar dinding, benda pendek (kloset/wastafel) jadi titik kecil tak terbaca; lalu dicoba
    // batas bawah TINGGI_DINDING*0.55, tapi itu bikin shower (jauh lebih pendek dari kloset) ikut jadi kecil tak
    // terbaca juga. Sekarang MURNI proporsional ke ukuran benda masing-masing (ditambah margin kecil) — tiap sel
    // boleh punya tingkat zoom beda, yang penting bendanya sendiri besar & jelas di bingkainya sendiri.
    //
    // area_mandi dapat margin EKSTRA (2.3x bukan 1.4x): kemiringan (KEMIRINGAN_AREA_MANDI, rotasi sumbu-X lokal)
    // membuat jangkauan vertikal benda SETELAH dimiringkan lebih besar dari TINGGI_TARGET aslinya (yang dihitung
    // sebelum kemiringan diterapkan) — tanpa margin ekstra, kepala shower kepotong di tepi bingkai pada beberapa
    // dinding (lihat screenshot cek visual).
    const margin = objek === "area_mandi" ? 2.3 : 1.4;
    const frustumSetengah = Math.max(TINGGI_TARGET[objek] * margin, 0.3);
    const camera = new THREE.OrthographicCamera(-frustumSetengah, frustumSetengah, frustumSetengah, -frustumSetengah, 0.1, 30);
    const { posisi, target } = kameraUntukDinding(objek, dinding);
    camera.position.copy(posisi);
    camera.lookAt(target);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    muatModel(MODEL_SRC[objek]).then((modelAsli) => {
      if (batal) return;
      scene.add(bangunPembungkusObjek(objek, { dinding, posisi: "tengah" }, modelAsli));
    });

    let frameId = 0;
    const render = () => {
      const { clientWidth, clientHeight } = canvas;
      if (clientWidth > 0 && clientHeight > 0 && (canvas.width !== clientWidth || canvas.height !== clientHeight)) {
        renderer.setSize(clientWidth, clientHeight, false);
        camera.left = -frustumSetengah * (clientWidth / clientHeight);
        camera.right = frustumSetengah * (clientWidth / clientHeight);
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
  }, [objek, dinding]);

  return <canvas ref={canvasRef} className="h-40 w-full rounded border border-neutral-300" aria-hidden="true" />;
}

/** Teks asumsi rotasi yang sedang dipakai untuk sel ini — supaya user bisa baca ANGKA yang dinilai, bukan cuma
 *  menebak dari gambar. */
function labelAsumsi(objek: ObjekDenah, dinding: DindingDenah): string {
  const posisi = (objek === "area_mandi" ? posisiTigaMenempel : posisiTiga)({ dinding, posisi: "tengah" });
  const totalDerajat = Math.round(((posisi.rotasiY + ROTASI_KALIBRASI[objek]) * 180) / Math.PI);
  const tilt = objek === "area_mandi" ? `, kemiringan ${Math.round((KEMIRINGAN_AREA_MANDI * 180) / Math.PI)}°` : "";
  return `rotasi dinding ${totalDerajat}°${tilt}`;
}

const LABEL_OBJEK: Record<ObjekDenah, string> = {
  pintu: "Pintu",
  kloset: "Kloset",
  wastafel: "Wastafel",
  area_mandi: "Shower",
};

const LABEL_DINDING: Record<DindingDenah, string> = {
  kiri: "Kiri",
  kanan: "Kanan",
  depan: "Depan",
  belakang: "Belakang",
};

export function KalibrasiRotasiDev() {
  const [tanda, setTanda] = useState<Record<string, Tanda>>(() => bacaTanda());

  const tandaiSel = (kunci: string, nilai: Tanda) => {
    setTanda((sebelumnya) => {
      const berikutnya = { ...sebelumnya, [kunci]: nilai };
      simpanTanda(berikutnya);
      return berikutnya;
    });
  };

  const jumlahBenar = Object.values(tanda).filter((t) => t === "benar").length;
  const jumlahSalah = Object.values(tanda).filter((t) => t === "salah").length;
  const totalSel = OBJEK_DENAH.length * DINDING_DENAH.length;

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="text-lg font-bold text-neutral-900">Kalibrasi rotasi 3D (dev only)</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Tiap sel: satu benda menempel SATU dinding, kamera tegak lurus ke dinding itu (bukan isometrik) — supaya
        arah "menghadap ruangan" vs "menghadap dinding" tidak ambigu. Klik Benar/Salah per sel; tanda disimpan di
        localStorage browser ini saja (tidak dikirim kemana-mana).
      </p>
      <p className="mt-2 text-sm font-medium text-neutral-800">
        Ditandai: {jumlahBenar} benar, {jumlahSalah} salah, {totalSel - jumlahBenar - jumlahSalah} belum ditandai dari {totalSel} sel.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OBJEK_DENAH.map((objek) =>
          DINDING_DENAH.map((dinding) => {
            const kunci = `${objek}_${dinding}`;
            const nilai = tanda[kunci];
            return (
              <div
                key={kunci}
                className={`rounded-lg border-2 p-2 ${
                  nilai === "benar" ? "border-green-500" : nilai === "salah" ? "border-red-500" : "border-neutral-200"
                }`}
              >
                <div className="mb-1 flex items-center justify-between text-sm font-semibold text-neutral-800">
                  <span>
                    {LABEL_OBJEK[objek]} — dinding {LABEL_DINDING[dinding]}
                  </span>
                </div>
                <SelKalibrasi objek={objek} dinding={dinding} />
                <p className="mt-1 text-xs text-neutral-500">{labelAsumsi(objek, dinding)}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => tandaiSel(kunci, "benar")}
                    className={`min-h-11 flex-1 rounded border px-2 text-sm font-medium ${
                      nilai === "benar" ? "border-green-600 bg-green-600 text-white" : "border-green-600 text-green-700"
                    }`}
                  >
                    Benar
                  </button>
                  <button
                    type="button"
                    onClick={() => tandaiSel(kunci, "salah")}
                    className={`min-h-11 flex-1 rounded border px-2 text-sm font-medium ${
                      nilai === "salah" ? "border-red-600 bg-red-600 text-white" : "border-red-600 text-red-700"
                    }`}
                  >
                    Salah
                  </button>
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
