import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

import Login from "../Components/Login";
import LogoutButton from "../Components/LogoutButton"
import Aswered from "../Components/Answered";

import "../styles/Inicio.css";

export default function Inicio() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });

    return () => unsub();
  }, []);

  if (loadingAuth) return <p>Cargando...</p>;

  return (
    <div className="home-container">
      <h1 className="home-title">Preguntas Respondidas</h1>

      <div className="questions-wrapper">
        <Aswered />
      </div>

 
             {/* Login/Logout opcional */}
             <div style={{ marginTop: 20 }}>
         {!user ? <Login /> : <LogoutButton />}
       </div>
    </div>
  
  );
}
