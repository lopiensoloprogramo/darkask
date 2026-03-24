import { useEffect } from "react";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function RegistroGlobalVisitas() {

  const location = useLocation();

  useEffect(() => {

    // 🚫 no contar estadísticas
    if (location.pathname === "/estadisticas") return;

    const today = new Date().toISOString().slice(0, 10);

    const ref = doc(db, "stats", today);

    // 🔥 ESTO ES LA CLAVE
    setDoc(ref, {  
      visits: increment(1)
    }, { merge: true });

  }, [location.pathname]);

  return null;
}