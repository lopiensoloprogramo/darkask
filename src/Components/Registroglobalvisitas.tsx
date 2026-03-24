import { useEffect, useRef } from "react";
import { doc, setDoc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function RegistroGlobalVisitas() {

  const location = useLocation();
  const lastExecution = useRef(0);
const excludedRoutes = ["/estadisticas"];
  useEffect(() => {

    // 🚫 NO contar stats
    if (excludedRoutes.includes(location.pathname)) return;

    const now = Date.now();

    // 🚫 evitar doble ejecución
    if (now - lastExecution.current < 1000) return;
    lastExecution.current = now;

    const today = new Date().toISOString().slice(0, 10);
    const ref = doc(db, "stats", today);

    const updateVisits = async () => {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, { visits: 1 });
      } else {
        await updateDoc(ref, {
          visits: increment(1)
        });
      }
    };

    updateVisits();

  }, [location.pathname]);

  return null;
}