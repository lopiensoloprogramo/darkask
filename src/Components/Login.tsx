import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "../services/firebase";

/* ===== HELPERS ===== */

const generateUsernameBase = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
};

const getUniqueUsername = async (base: string): Promise<string> => {
  let username = base;
  let suffix = 0;

  while (true) {
    const q = query(
      collection(db, "users"),
      where("usernameLower", "==", username),
      limit(1)
    );

    const snap = await getDocs(q);

    if (snap.empty) return username;

    suffix++;
    username = `${base}${suffix}`;
  }
};

/* ===== COMPONENT ===== */

export default function Login() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let usernameToSave: string | null = null;

      // 👉 Solo generar username si no existe
      if (!userSnap.exists() || !userSnap.data().username) {
        const baseUsername = generateUsernameBase(user.displayName || "user");
        usernameToSave = await getUniqueUsername(baseUsername);
      }

      await setDoc(
        userRef,
        {
          name: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          ...(usernameToSave && {
            username: usernameToSave,
            usernameLower: usernameToSave.toLowerCase()
          }),
          createdAt: Date.now()
        },
        { merge: true }
      );

      // Redirigir al perfil
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
          fontSize: "16px"
        }}
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
}
