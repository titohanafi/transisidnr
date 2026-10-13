import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { konten } from "../domain/content";
import type { Aktivitas } from "../domain/schema";
import { rapikan, ubahPrioritas } from "./asesmen";
import {
  hapus, hapusFoto, muat, muatFoto, simpan, simpanFoto, stateAwal,
  type AsesmenState, type HasilPanduan, type State, STATUS_AKTIVITAS,
} from "./storage";

type StatusAkt = (typeof STATUS_AKTIVITAS)[number];

interface Store {
  state: State;
  foto: string | null;
  setJawabanOnboarding: (pertanyaanId: string, pilihan: string[]) => void;
  setStatusAktivitas: (id: Aktivitas, status: StatusAkt | null) => void;
  /** Menambah atau melepas satu prioritas (maksimal dua). */
  togglePrioritas: (id: Aktivitas) => void;
  setJawaban: (pertanyaanId: string, ya: boolean) => void;
  /** null menghapus foto. Mengembalikan false bila gagal disimpan. */
  /** Mencentang atau melepas satu langkah checklist. */
  toggleLangkah: (kunci: string, nomor: number) => void;
  setCheckin: (id: string | null) => void;
  /** null menghapus hasil panduan itu. */
  setHasil: (kartuId: string, hasil: HasilPanduan | null) => void;
  setFoto: (dataUrl: string | null) => boolean;
  hapusSemua: () => void;
}

const Konteks = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(muat);
  const [foto, setFotoState] = useState<string | null>(muatFoto);

  const ubah = useCallback((fn: (s: State) => State) => {
    setState((prev) => {
      const next = fn(prev);
      simpan(next); // idempoten, aman bila dipanggil dua kali
      return next;
    });
  }, []);
  const ubahAsesmen = useCallback(
    (fn: (a: AsesmenState) => AsesmenState) =>
      ubah((s) => ({ ...s, asesmen: rapikan(konten.asesmen, fn(s.asesmen)) })),
    [ubah],
  );

  const setJawabanOnboarding = useCallback(
    (id: string, pilihan: string[]) => ubah((s) => ({ ...s, onboarding: { ...s.onboarding, [id]: pilihan } })),
    [ubah],
  );
  const setStatusAktivitas = useCallback(
    (id: Aktivitas, status: StatusAkt | null) =>
      ubahAsesmen((a) => {
        const st = { ...a.status };
        if (status) st[id] = status;
        else delete st[id];
        return { ...a, status: st };
      }),
    [ubahAsesmen],
  );
  const togglePrioritas = useCallback(
    (id: Aktivitas) => ubahAsesmen((a) => ({ ...a, prioritas: ubahPrioritas(a.prioritas, id) })),
    [ubahAsesmen],
  );
  const setJawaban = useCallback(
    (id: string, ya: boolean) => ubahAsesmen((a) => ({ ...a, jawaban: { ...a.jawaban, [id]: ya } })),
    [ubahAsesmen],
  );

  const toggleLangkah = useCallback(
    (kunci: string, nomor: number) =>
      ubah((s) => {
        const ada = s.checklist[kunci] ?? [];
        const baru = ada.includes(nomor) ? ada.filter((n) => n !== nomor) : [...ada, nomor].sort((a, b) => a - b);
        return { ...s, checklist: { ...s.checklist, [kunci]: baru } };
      }),
    [ubah],
  );

  const setCheckin = useCallback((id: string | null) => ubah((s) => ({ ...s, checkin: id })), [ubah]);

  const setHasil = useCallback(
    (kartuId: string, hasil: HasilPanduan | null) =>
      ubah((s) => {
        const baru = { ...s.hasil };
        if (hasil) baru[kartuId] = hasil;
        else delete baru[kartuId];
        return { ...s, hasil: baru };
      }),
    [ubah],
  );

  const setFoto = useCallback((dataUrl: string | null) => {
    if (dataUrl === null) {
      hapusFoto();
      setFotoState(null);
      return true;
    }
    if (!simpanFoto(dataUrl)) return false;
    setFotoState(dataUrl);
    return true;
  }, []);

  const hapusSemua = useCallback(() => {
    hapus();
    setState(stateAwal());
    setFotoState(null);
  }, []);

  const nilai = useMemo(
    () => ({ state, foto, setJawabanOnboarding, setStatusAktivitas, togglePrioritas, setJawaban, toggleLangkah, setCheckin, setHasil, setFoto, hapusSemua }),
    [state, foto, setJawabanOnboarding, setStatusAktivitas, togglePrioritas, setJawaban, toggleLangkah, setCheckin, setHasil, setFoto, hapusSemua],
  );
  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

export function useStore(): Store {
  const s = useContext(Konteks);
  if (!s) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return s;
}
