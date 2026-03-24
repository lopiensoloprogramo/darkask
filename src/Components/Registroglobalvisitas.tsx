import { useEffect, useRef } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function RegistroGlobalVisitas() {

  const location = useLocation();
  const lastExecution = useRef(0);

  useEffect(() => {

    const now = Date.now();

    // 🚫 evita doble ejecución inmediata (StrictMode)
    if (now - lastExecution.current < 1000) return;

    lastExecution.current = now;

    const ref = doc(db, "stats", "global");

    updateDoc(ref, {
      visits: increment(1)
    });

  }, [location.pathname]);

  return null;
}