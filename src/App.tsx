import { Navigate, Route, Routes } from "react-router-dom";
import { Aksi } from "./screens/Aksi";
import { AsesmenAktivitas } from "./screens/AsesmenAktivitas";
import { AsesmenFoto } from "./screens/AsesmenFoto";
import { AsesmenPertanyaan } from "./screens/AsesmenPertanyaan";
import { AsesmenPrioritas } from "./screens/AsesmenPrioritas";
import { Beranda } from "./screens/Beranda";
import { Cetak } from "./screens/Cetak";
import { DetailKartu } from "./screens/DetailKartu";
import { Jelajah } from "./screens/Jelajah";
import { HapusData } from "./screens/HapusData";
import { Kontak } from "./screens/Kontak";
import { Onboarding } from "./screens/Onboarding";
import { PindaiFoto } from "./screens/PindaiFoto";
import { PilihRuangan } from "./screens/PilihRuangan";
import { Saya } from "./screens/Saya";
import { Rencana } from "./screens/Rencana";
import { StoreProvider } from "./state/store";

export function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/jelajah/:filter?" element={<Jelajah />} />
        <Route path="/mulai/:langkah" element={<Onboarding />} />
        <Route path="/ruangan" element={<PilihRuangan />} />
        <Route path="/asesmen" element={<Navigate to="/asesmen/aktivitas" replace />} />
        <Route path="/asesmen/aktivitas" element={<AsesmenAktivitas />} />
        <Route path="/asesmen/prioritas" element={<AsesmenPrioritas />} />
        <Route path="/asesmen/pertanyaan/:nomor" element={<AsesmenPertanyaan />} />
        <Route path="/asesmen/foto" element={<AsesmenFoto />} />
        <Route path="/rencana" element={<Rencana />} />
        <Route path="/aksi/:jenis/:id/:tingkat?" element={<Aksi />} />
        <Route path="/cetak" element={<Cetak />} />
        <Route path="/kartu/:id/:tingkat?" element={<DetailKartu />} />
        <Route path="/pindai" element={<PindaiFoto />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/igd" element={<Navigate to="/kontak" replace />} />
        <Route path="/saya" element={<Saya />} />
        <Route path="/hapus" element={<HapusData />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  );
}
