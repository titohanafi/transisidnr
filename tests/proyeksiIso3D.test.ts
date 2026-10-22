import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { bangunProyeksi, posisiKameraIso } from "../src/lib/proyeksiIso3D";

describe("proyeksi isometrik tanpa Three.js", () => {
  it.each([Math.PI / 4, (3 * Math.PI) / 4])("sama dengan kamera ortografik Three.js (azimuth %f)", (azimuth) => {
    const [lebar, tinggi, frustum] = [280, 256, 4.1];
    const kamera = new THREE.OrthographicCamera((-frustum * lebar) / tinggi, (frustum * lebar) / tinggi, frustum, -frustum, 0.1, 30);
    kamera.position.set(...posisiKameraIso(azimuth));
    kamera.lookAt(0, 0.3, 0);
    kamera.updateMatrixWorld();
    kamera.updateProjectionMatrix();
    const proyeksi = bangunProyeksi(azimuth, lebar, tinggi, frustum);
    const v = new THREE.Vector3();
    for (const [x, y, z] of [
      [0, 0, 0],
      [1.2, -1.8, 0],
      [-1.2, 1.8, 2.6],
      [0.4, 0.7, 1.1],
    ] as const) {
      v.set(x, z, y).project(kamera);
      const [px, py] = proyeksi(x, y, z);
      expect(px).toBeCloseTo((v.x * 0.5 + 0.5) * lebar, 6);
      expect(py).toBeCloseTo((0.5 - v.y * 0.5) * tinggi, 6);
    }
  });
});
