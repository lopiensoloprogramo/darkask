// ProfileUserWrapper.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileUser from "../Components/Profile/ProfileUser";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../services/firebase";
import type { User } from "firebase/auth";

export default function ProfileUserWrapper() {
  const { id, username } = useParams<{ id?: string; username?: string }>();

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ===== AUTH ===== */
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  /* ===== RESOLVE PROFILE ID ===== */
  useEffect(() => {
    const resolveProfile = async () => {
      setLoading(true);

      // 👉 Caso 1: viene por /profile/:id
      if (id) {
        setProfileUserId(id);
        setLoading(false);
        return;
      }

      // 👉 Caso 2: viene por /u/:username
      if (username) {
        const q = query(
          collection(db, "users"),
          where("usernameLower", "==", username.toLowerCase()),
          limit(1)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          setProfileUserId(snap.docs[0].id);
        } else {
          setProfileUserId(null);
        }

        setLoading(false);
        return;
      }

      setLoading(false);
    };

    resolveProfile();
  }, [id, username]);

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Cargando perfil...
      </p>
    );
  }

  if (!profileUserId) {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Perfil no encontrado.
      </p>
    );
  }

  return <ProfileUser profileUserId={profileUserId} authUser={authUser} />;
}