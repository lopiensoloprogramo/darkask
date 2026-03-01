import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  where
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import type { Question } from "../types/QuestionsInterfaz";
import fbIcon from "../assets/fbICONO.png";
import inIcon from "../assets/inICONO.png";
import logoBANNER from "../assets/bannernew.png";
import ProfileSearch from "../Components/ProfileSearch";

interface UserSummary {
  id: string;
  name: string;
  photoURL?: string;
  score: number;
}

interface Props {
  limit?: number;
}

export default function LatestAnsweredQuestions({ limit = 20 }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topUsers, setTopUsers] = useState<UserSummary[]>([]);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    return auth.onAuthStateChanged(user => setAuthUser(user));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // 🔹 Cargar preguntas
      try {
        const q = query(
          collection(db, "questions"),
          where("answered", "==", true),
          orderBy("timestamp", "desc"),
          firestoreLimit(limit)
        );

        const snap = await getDocs(q);
        setQuestions(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          })) as Question[]
        );
      } catch (error) {
        console.error("Error cargando preguntas:", error);
        setQuestions([]);
      }

      // 🔹 Cargar top usuarios
      try {
        const qUsers = query(
          collection(db, "users"),
          orderBy("score", "desc"),
          firestoreLimit(5)
        );

        const snapUsers = await getDocs(qUsers);
        setTopUsers(
          snapUsers.docs.map(d => ({
            id: d.id,
            ...(d.data() as any)
          }))
        );
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        setTopUsers([]);
      }

      setLoading(false);
    };

    loadData();
  }, [limit]);

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      navigate(`/profile/${result.user.uid}`);
    } catch {
      alert("No se pudo iniciar sesión.");
    }
  };

  function timeAgo(timestamp: any) {
    if (!timestamp) return "hace un momento";

    let past: number;

    if (timestamp?.toDate) {
      past = timestamp.toDate().getTime();
    } else {
      past = new Date(timestamp).getTime();
    }

    const now = Date.now();
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return "hace segundos";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
    return `hace ${Math.floor(diff / 2592000)} mes(es)`;
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <p>Cargando contenido...</p>
      </div>
    );
  }

  return (
    <>
      {/* HERO */}
      <div style={{ textAlign: "center", padding: 30 }}>
        <h1>El chisme es público. Tu nombre no.</h1>
        <button onClick={handleLogin}>
          💀Ver lo que dicen de mí🔥
        </button>
      </div>

      {/* FEED */}
      <div style={{ maxWidth: 1000, margin: "auto", padding: 20 }}>
        {questions.length === 0 && (
          <p>No hay preguntas públicas todavía.</p>
        )}

        {questions.map(q => (
          <div key={q.id} style={{ marginBottom: 20 }}>
            <p><strong>{q.question}</strong></p>
            <p>{q.answer}</p>
            <small>{timeAgo(q.timestamp)}</small>
          </div>
        ))}

        <hr />

        <h3>🔥 Más mencionados</h3>
        {topUsers.map((user, i) => (
          <div
            key={user.id}
            style={{ cursor: "pointer", marginBottom: 10 }}
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            #{i + 1} {user.name} ⭐ {user.score}
          </div>
        ))}
      </div>
    </>
  );
}