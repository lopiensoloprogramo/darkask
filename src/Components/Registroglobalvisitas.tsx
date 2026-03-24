import { useEffect } from "react";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function RegistroGlobalVisitas() {
  const location = useLocation();

  useEffect(() => {

    const path = location.pathname;

    // 🚫 NO contar estas rutas
    if (path === "/" || path === "/estadisticas") return;

    // 🔥 evitar duplicados por navegación rápida / redirect
    const lastPath = sessionStorage.getItem("last_path");

    if (lastPath === path) return;

    sessionStorage.setItem("last_path", path);

    const today = new Date().toISOString().slice(0, 10);

    const globalRef = doc(db, "stats", "global");
    const dailyRef = doc(db, "stats", today);

    setDoc(globalRef, { visits: increment(1) }, { merge: true });
    setDoc(dailyRef, { visits: increment(1) }, { merge: true });

  }, [location.pathname]);

  return null;
}