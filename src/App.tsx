import { useEffect, useState } from "react";
import { Routes, Route, Navigate} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ProfileUserWrapper from "./Pages/ProfileUserWrapper";
import LatestAnsweredQuestions from "./Components/LatestAnsweredQuestions";
import Login from "./Components/Login";
import Internalfeed from "./Components/Internalfeed";
import Estadisticas from "./data/Estadisticas";

import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "./services/firebase";

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
 
useEffect(() => {

  const today = new Date().toISOString().slice(0, 10);

  // 🔥 claves distintas
  const globalKey = "counted_global";
  const dailyKey = `counted_${today}`;

  // 🔥 refs
  const globalRef = doc(db, "stats", "global");
  const dailyRef = doc(db, "stats", today);

  // ✅ GLOBAL (una vez por sesión)
  if (!sessionStorage.getItem(globalKey)) {
    sessionStorage.setItem(globalKey, "true");

    setDoc(globalRef, {
      visits: increment(1)
    }, { merge: true });
  }

  // ✅ DIARIO (una vez por día por sesión)
  if (!sessionStorage.getItem(dailyKey)) {
    sessionStorage.setItem(dailyKey, "true");

    setDoc(dailyRef, {
      visits: increment(1)
    }, { merge: true });
  }

}, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      setUserId(user ? user.uid : null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Cargando sesión...</p>;

  return (
    <>  

    <Routes>
      {/* Perfil del usuario */}
      <Route path="/profile/:id" element={<ProfileUserWrapper />} />
      <Route path="/u/:username" element={<ProfileUserWrapper />} />

      {/* Página pública */}
      <Route
        path="/"
        element={userId ? <Navigate to={`/profile/${userId}`} replace /> : <LatestAnsweredQuestions />}
      />

      {/* Página de login opcional */}
      <Route path="/login" element={<Login />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Feed Interno */}
      <Route path="/feed" element={<Internalfeed />} />
      <Route path="/estadisticas" element={<Estadisticas />} />
    </Routes>
    </>
  );
}
