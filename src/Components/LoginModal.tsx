import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function LoginModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          username: user.displayName?.replace(/\s+/g, "").toLowerCase(),
          usernameLower: user.displayName?.replace(/\s+/g, "").toLowerCase(),
          createdAt: Date.now()
        });
      }

      onClose(); // cerrar modal automáticamente

      window.location.href = `/profile/${user.uid}`;

    } catch (error) {
      console.error(error);
      alert("Error iniciando sesión");
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {loading ? (
          <>
            <div style={loader}></div>
            <p>Iniciando sesión...</p>
          </>
        ) : (
          <>
            <h2>🔥 Entra al chisme</h2>
            <button style={button} onClick={handleLogin}>
              Iniciar sesión con Google
            </button>
            <button style={closeBtn} onClick={onClose}>
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const modal: React.CSSProperties = {
  background: "#fff",
  padding: 30,
  borderRadius: 16,
  width: 320,
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,.3)"
};

const button: React.CSSProperties = {
  background: "#4285F4",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  width: "100%",
  marginTop: 10
};

const closeBtn: React.CSSProperties = {
  marginTop: 12,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "#555"
};

const loader: React.CSSProperties = {
  width: 40,
  height: 40,
  border: "4px solid #ddd",
  borderTopColor: "#6366f1",
  borderRadius: "50%",
  margin: "0 auto 15px",
  animation: "spin 1s linear infinite"
};