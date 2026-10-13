import { Navigate, Route, Routes } from "react-router-dom";
import { AsesmenAktivitas } from "./screens/AsesmenAktivitas";
import { AsesmenFoto } from "./screens/AsesmenFoto";
import { AsesmenPertanyaan } from "./screens/AsesmenPertanyaan";
import { AsesmenPrioritas } from "./screens/AsesmenPrioritas";
import { Beranda } from "./screens/Beranda";
import { HapusData } from "./screens/HapusData";
import { Igd } from "./screens/Igd";
import { Onboarding } from "./screens/Onboarding";
import { Rencana } from "./screens/Rencana";
import { StoreProvider } from "./state/store";

export function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/mulai/:langkah" element={<Onboarding />} />
        <Route path="/asesmen" element={<Navigate to="/asesmen/aktivitas" replace />} />
        <Route path="/asesmen/aktivitas" element={<AsesmenAktivitas />} />
        <Route path="/asesmen/prioritas" element={<AsesmenPrioritas />} />
        <Route path="/asesmen/pertanyaan/:nomor" element={<AsesmenPertanyaan />} />
        <Route path="/asesmen/foto" element={<AsesmenFoto />} />
        <Route path="/rencana" element={<Rencana />} />
        <Route path="/igd" element={<Igd />} />
        <Route path="/hapus" element={<HapusData />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  );
}
