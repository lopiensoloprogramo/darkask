import { useEffect, useState } from "react";
import { collection, query, where, getDocs,doc, getDoc  } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Estadisticas() {
  const [autoCount, setAutoCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
 const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
  const fetchStats = async () => {

    // 🔥 preguntas automáticas
    const autoQ = query(
      collection(db, "questions"),
      where("isAuto", "==", true)
    );

    const autoSnap = await getDocs(autoQ);

    // 🔥 preguntas sin responder
    const pendingQ = query(
      collection(db, "questions"),
      where("answered", "==", false)
    );

    const pendingSnap = await getDocs(pendingQ);

    // 🔥 visitas de hoy
    const today = new Date().toISOString().split("T")[0];

    const visitRef = doc(db, "stats", today);
    const visitSnap = await getDoc(visitRef);

    const todayVisits = visitSnap.exists()
      ? visitSnap.data().visits || 0
      : 0;

    setAutoCount(autoSnap.size);
    setPendingCount(pendingSnap.size);
    setVisits(todayVisits);
  };

  fetchStats();
}, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>📊 Estadísticas</h1>

      <p>🤖 Preguntas automáticas: {autoCount ?? "..."}</p>
      <p>⏳ Preguntas pendientes: {pendingCount ?? "..."}</p>
      <p>👀 Visitas totales: {visits ?? "..."}</p>
    </div>
  );
}