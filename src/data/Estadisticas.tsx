import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Estadisticas() {
  const [autoCount, setAutoCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  

  useEffect(() => {
    const fetchStats = async () => {

      // 🔥 preguntas automáticas
      const autoQ = query(
        collection(db, "questions"),
        where("isAuto", "==", true)
      );
      const autoSnap = await getDocs(autoQ);

      // 🔥 preguntas pendientes
      const pendingQ = query(
        collection(db, "questions"),
        where("answered", "==", false)
      );
      const pendingSnap = await getDocs(pendingQ);

   

      setAutoCount(autoSnap.size);
      setPendingCount(pendingSnap.size);

    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>📊 Estadísticas</h1>

      <p>🤖 Preguntas automáticas: {autoCount ?? "..."}</p>
      <p>⏳ Preguntas pendientes: {pendingCount ?? "..."}</p>

 
    </div>
  );
}