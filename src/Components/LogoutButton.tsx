import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LogoutButton() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirige al inicio
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Solo mostrar botón si hay usuario logueado
  if (!user) return null;

  return (
    <button style={btnLogout} onClick={logout}>
      Cerrar sesión
    </button>
  );
}

// Estilo del botón
const btnLogout: React.CSSProperties = {
  marginTop: 14,
  background: "#ff4d4f",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 600,
  cursor: "pointer",
};
