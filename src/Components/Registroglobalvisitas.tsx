import { useEffect } from "react";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Registroglobalvisitas() {

  const registerGlobalVisit = async () => {
    const today = new Date().toISOString().split("T")[0];

    const ref = doc(db, "stats", today);

    await setDoc(
      ref,
      { visits: increment(1) },
      { merge: true }
    );
  };

  useEffect(() => {
    if (!sessionStorage.getItem("visited")) {
      registerGlobalVisit();
      sessionStorage.setItem("visited", "true");
    }
  }, []);

  return null; // 👈 importante, no renderiza nada
}