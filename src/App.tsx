import { Navigate, Route, Routes } from "react-router-dom";
import { Asesmen } from "./screens/Asesmen";
import { Beranda } from "./screens/Beranda";
import { HapusData } from "./screens/HapusData";
import { Igd } from "./screens/Igd";
import { Onboarding } from "./screens/Onboarding";
import { StoreProvider } from "./state/store";

export function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/mulai/:langkah" element={<Onboarding />} />
        <Route path="/asesmen" element={<Asesmen />} />
        <Route path="/igd" element={<Igd />} />
        <Route path="/hapus" element={<HapusData />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  );
}
