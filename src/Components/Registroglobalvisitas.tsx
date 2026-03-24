import { useEffect } from "react";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function RegistroGlobalVisitas() {

  const location = useLocation();

  useEffect(() => {

    // 🚫 no contar estadísticas
    if (location.pathname === "/estadisticas") return;

    const ref = doc(db, "stats", "global");

    setDoc(ref, {
      visits: increment(1)
    }, { merge: true });

  }, [location.pathname]);

  return null;
}