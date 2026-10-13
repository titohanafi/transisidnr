import { useMemo } from "react";
import { konten } from "../domain/content";
import { buatKonteks, buatRencana, type Masukan } from "../domain/engine";
import { keMasukan } from "./masukan";
import { useStore } from "./store";

export function useRencana() {
  const { state } = useStore();
  return useMemo(() => {
    const masukan: Masukan = keMasukan(state, konten.onboarding);
    return {
      masukan,
      konteks: buatKonteks(masukan, konten.config),
      rencana: buatRencana(masukan, konten.kartu, konten.asesmen, konten.config),
    };
  }, [state]);
}
