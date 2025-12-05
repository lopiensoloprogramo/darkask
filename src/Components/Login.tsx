import React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase"; // Ajusta tu ruta

export default function Login() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          createdAt: Date.now(),
        },
        { merge: true } // <-- No borra campos existentes si el usuario ya estaba
      );




      // Redirigir al perfil del usuario logueado
      navigate(`/profile/${user.uid}`);
    } catch (error) {
      console.error("Error iniciando sesión con Google:", error);
      alert("No se pudo iniciar sesión. Intenta de nuevo.");
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Inicia sesión con Google</h2>
      <button
        onClick={handleLogin}
        style={{
          background: "#4285F4",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
}
