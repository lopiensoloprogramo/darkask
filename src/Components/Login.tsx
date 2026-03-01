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
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  return base || "user";
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
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

const handleLogin = async () => {
  try {
    console.log("Iniciando login...");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("Usuario autenticado:", user.uid);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let usernameToSave: string | null = null;

    if (!userSnap.exists()) {
      const baseUsername = generateUsernameBase(
        user.displayName || "user"
      );

      usernameToSave = await getUniqueUsername(baseUsername);

      await setDoc(userRef, {
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        username: usernameToSave,
        usernameLower: usernameToSave,
        createdAt: Date.now(),
        score: 0
      });

      console.log("Usuario creado");
    } else {
      console.log("Usuario ya existía");
    }

    // 🔥 VERIFICACIÓN REAL
    const verify = await getDoc(userRef);

    if (!verify.exists()) {
      alert("Error: el usuario no se creó en Firestore.");
      return;
    }

    console.log("Documento confirmado en Firestore");

    navigate(`/profile/${user.uid}`);

  } catch (error) {
    console.error("ERROR INICIANDO SESIÓN:", error);
    alert("No se pudo iniciar sesión. Revisa la consola.");
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