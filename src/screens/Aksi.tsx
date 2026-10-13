import { Navigate, useParams } from "react-router-dom";
import { AksiAhli } from "./AksiAhli";
import { AksiBeli } from "./AksiBeli";
import { AksiSendiri } from "./AksiSendiri";
import { AksiTukang } from "./AksiTukang";

export function Aksi() {
  const { jenis } = useParams();
  switch (jenis) {
    case "sendiri":
      return <AksiSendiri />;
    case "beli":
      return <AksiBeli />;
    case "tukang":
      return <AksiTukang />;
    case "ahli":
      return <AksiAhli />;
    default:
      return <Navigate to="/rencana" replace />;
  }
}
