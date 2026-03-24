import { useEffect, useRef } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function RegistroGlobalVisitas() {

  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {

    // evitar duplicado misma ruta
    if (lastPath.current === location.pathname) return;

    lastPath.current = location.pathname;

    const ref = doc(db, "stats", "global");

    updateDoc(ref, {
      visits: increment(1)
    });

  }, [location.pathname]);

  return null;
}