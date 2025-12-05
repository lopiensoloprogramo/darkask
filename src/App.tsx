import { useEffect, useState } from "react";
import { Routes, Route, Navigate} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ProfileUserWrapper from "./Pages/ProfileUserWrapper";
import LatestAnsweredQuestions from "./Components/LatestAnsweredQuestions";
import Login from "./Components/Login";

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
 

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
    <Routes>
      {/* Perfil del usuario */}
      <Route path="/profile/:id" element={<ProfileUserWrapper />} />

      {/* Página pública */}
      <Route
        path="/"
        element={userId ? <Navigate to={`/profile/${userId}`} replace /> : <LatestAnsweredQuestions limit={20} />}
      />

      {/* Página de login opcional */}
      <Route path="/login" element={<Login />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
