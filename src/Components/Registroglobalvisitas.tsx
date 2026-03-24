import { useEffect } from "react";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function RegistroGlobalVisitas() {
  const location = useLocation();

  useEffect(() => {

    // 🚫 no contar estadísticas
    if (location.pathname === "/estadisticas") return;

    const key = `visited_${location.pathname}`;

    // 🔥 evitar duplicado en la misma sesión
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "true");

    const today = new Date().toISOString().slice(0, 10);

    const globalRef = doc(db, "stats", "global");
    const dailyRef = doc(db, "stats", today);

    setDoc(globalRef, { visits: increment(1) }, { merge: true });
    setDoc(dailyRef, { visits: increment(1) }, { merge: true });

  }, [location.pathname]);

  return null;
}