import { useEffect } from "react";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function RegistroGlobalVisitas() {
  const location = useLocation();

  useEffect(() => {

    // 🚫 NO contar estadísticas
    if (location.pathname === "/estadisticas") return;

    const today = new Date().toISOString().slice(0, 10);

    // 🔥 GLOBAL
    const globalRef = doc(db, "stats", "global");

    // 🔥 POR DÍA
    const dailyRef = doc(db, "stats", today);

    // guardar ambos
    setDoc(globalRef, { visits: increment(1) }, { merge: true });
    setDoc(dailyRef, { visits: increment(1) }, { merge: true });

  }, [location.pathname]);

  return null;
}