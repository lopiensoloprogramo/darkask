// ProfileUserWrapper.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileUser from "../Components/Profile/ProfileUser";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

export default function ProfileUserWrapper() {
  const { id } = useParams<{ id: string }>();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Cargando perfil...</p>;
  }

  if (!id) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Perfil no encontrado.</p>;
  }

  // ✅ SIEMPRE se muestra el perfil (logueado o no)
  return <ProfileUser profileUserId={id} authUser={authUser} />;
}
