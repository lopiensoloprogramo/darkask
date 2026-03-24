import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Estadisticas() {
  const [autoCount, setAutoCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [totalVisits, setTotalVisits] = useState<number | null>(null);
  const [todayVisits, setTodayVisits] = useState<number | null>(null);

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

      // 🔥 GLOBAL
      const globalRef = doc(db, "stats", "global");
      const globalSnap = await getDoc(globalRef);

      // 🔥 HOY
      const today = new Date().toISOString().slice(0, 10);
      const todayRef = doc(db, "stats", today);
      const todaySnap = await getDoc(todayRef);

      setAutoCount(autoSnap.size);
      setPendingCount(pendingSnap.size);

      setTotalVisits(globalSnap.exists() ? globalSnap.data().visits || 0 : 0);
      setTodayVisits(todaySnap.exists() ? todaySnap.data().visits || 0 : 0);
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>📊 Estadísticas</h1>

      <p>🤖 Preguntas automáticas: {autoCount ?? "..."}</p>
      <p>⏳ Preguntas pendientes: {pendingCount ?? "..."}</p>

      <p>👀 Visitas totales: {totalVisits ?? "..."}</p>
      <p>📅 Visitas hoy: {todayVisits ?? "..."}</p>
    </div>
  );
}