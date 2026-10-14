import { Navigate, useParams } from "react-router-dom";
import { AksiAhli } from "./AksiAhli";
import { AksiBeli } from "./AksiBeli";
import { AksiTukang } from "./AksiTukang";

export function Aksi() {
  const { jenis, id, tingkat } = useParams();
  switch (jenis) {
    case "sendiri":
      // Alamat lama: langkah kini ada di panel solusi pada halaman panduan.
      return <Navigate to={id ? `/kartu/${id}${tingkat ? `/${tingkat}` : ""}` : "/rencana"} replace />;
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
