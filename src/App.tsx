import { useEffect, useState } from "react";
import { Routes, Route, Navigate} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ProfileUserWrapper from "./Pages/ProfileUserWrapper";
import LatestAnsweredQuestions from "./Components/LatestAnsweredQuestions";
import Login from "./Components/Login";
import Internalfeed from "./Components/Internalfeed";
import Estadisticas from "./data/Estadisticas";
import Registroglobalvisitas from "./Components/Registroglobalvisitas";


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
  <Registroglobalvisitas />
  return (
    
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
    
  );
}
