import { useEffect, useState } from "react";
import { collection, query, where, getDocs,getDoc,doc } from "firebase/firestore";
import { db } from "../services/firebase";


export default function Estadisticas() {
  const [autoCount, setAutoCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [globalViews, setGlobalViews] = useState<number | null>(null);
const [todayViews, setTodayViews] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {

      const globalRef = doc(db, "stats", "global");
      const globalSnap = await getDoc(globalRef);

          if (globalSnap.exists()) {
          const data = globalSnap.data();

          setGlobalViews(data.totalViews || 0);

         const today = new Intl.DateTimeFormat("en-CA", {
              timeZone: "America/Lima",
              year: "numeric",
              month: "2-digit",
              day: "2-digit"
            }).format(new Date());

          setTodayViews(data.dailyViews?.[today] || 0);
          console.log("DATA:", data);
          console.log("Visitas hoy",todayViews)
        }


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
      <p>🌍 Visitas totales en perfiles : {globalViews ?? "..."}</p>
      <p>🔥 Visitas hoy: {todayViews ?? "..."}</p>
 
    </div>
  );
}