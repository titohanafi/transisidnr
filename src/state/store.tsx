import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { hapus, muat, simpan, stateAwal, type State } from "./storage";

interface Store {
  state: State;
  setJawabanOnboarding: (pertanyaanId: string, pilihan: string[]) => void;
  hapusSemua: () => void;
}

const Konteks = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(muat);

  const setJawabanOnboarding = useCallback((id: string, pilihan: string[]) => {
    setState((prev) => {
      const next = { ...prev, onboarding: { ...prev.onboarding, [id]: pilihan } };
      simpan(next); // idempoten, aman bila dipanggil dua kali
      return next;
    });
  }, []);

  const hapusSemua = useCallback(() => {
    hapus();
    setState(stateAwal());
  }, []);

  const nilai = useMemo(() => ({ state, setJawabanOnboarding, hapusSemua }), [state, setJawabanOnboarding, hapusSemua]);
  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

export function useStore(): Store {
  const s = useContext(Konteks);
  if (!s) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return s;
}
