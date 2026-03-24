import { useEffect, useRef } from "react";
import { doc, setDoc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function RegistroGlobalVisitas() {

  const location = useLocation();
  const lastExecution = useRef(0);

  useEffect(() => {

    const now = Date.now();

    // 🚫 evitar doble ejecución (StrictMode)
    if (now - lastExecution.current < 1000) return;

    lastExecution.current = now;

    const ref = doc(db, "stats", "global");

    const updateVisits = async () => {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // 🔥 crear doc si no existe
        await setDoc(ref, { visits: 1 });
      } else {
        // 🔥 incrementar si ya existe
        await updateDoc(ref, {
          visits: increment(1)
        });
      }
    };

    updateVisits();

  }, [location.pathname]);

  return null;
}