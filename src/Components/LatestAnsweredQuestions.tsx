import { useEffect, useState } from "react";
import { collection, query, orderBy, limit as firestoreLimit, getDocs, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import type { Question } from "../types/QuestionsInterfaz";
import fbIcon from "../assets/fbICONO.png"
import inIcon from "../assets/inICONO.png";
import logoBANNER from "../assets/finalbanner.png"

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
    const fetchQuestions = async () => {
      const q = query(
        collection(db, "questions"),
        where("answered", "==", true),
        orderBy("timestamp", "desc"),
        firestoreLimit(limit)
      );
      const snap = await getDocs(q);
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Question[]);
    };

    const fetchTopUsers = async () => {
      const q = query(
        collection(db, "users"),
        orderBy("score", "desc"),
        firestoreLimit(5)
      );
      const snap = await getDocs(q);
      setTopUsers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    };

    const load = async () => {
      await Promise.all([fetchQuestions(), fetchTopUsers()]);
      setLoading(false);
    };

    load();
  }, []);

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      navigate(`/profile/${result.user.uid}`);
    } catch (err) {
      alert("No se pudo iniciar sesión.");
    }
  };

  if (loading) {
    return (
      <div style={loaderOverlay}>
        <div style={loader}></div>
        <p style={{ marginTop: 15, fontWeight: 600 }}>Cargando contenido...</p>
      </div>
    );
  }

  return (
    <>
      {/* HEADER CON BANNER */}
      <div style={bannerHeader}>
        <img src={logoBANNER}/>
        <div style={bannerSocial}>
         
         <img src={fbIcon} style={bannerIcon} />
         <img src={inIcon} style={bannerIcon} />
        </div>
      </div>
      <div style={bannerSubtitle}>
      <p style={bannerDescription}>
          Recibe preguntas anónimas y respóndelas sin saber quién las envió.
        </p>
      </div>

      {/* LAYOUT ORIGINAL */}
      <div style={layout(isMobile)}>
        {/* COLUMNA IZQUIERDA */}
        <div style={panel}>
          <h2 style={title}>🔥 Últimas respuestas</h2>
          {questions.map(q => (
            <div key={q.id} style={{ ...feedCard, ...fadeIn, ...hoverLift }}>
              <p style={feedQuestion}>{q.question}</p>
              <div style={feedAnswer}>{q.answer}</div>
              <div style={feedMeta}>
                ❤️ {q.likes || 0}
                <span>⭐ {q.score || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA */}
        <div style={panel}>
          {!authUser && (
            <button style={{ ...loginBtnVIP, ...popIn }} onClick={handleLogin}>
              🚀 Iniciar sesión con Google
            </button>
          )}
          <h3 style={sidebarTitle}>Perfiles más populares</h3>
          {topUsers.map((user, i) => (
            <div
              key={user.id}
              style={{ ...userCard, ...fadeIn, ...hoverLift }}
              onClick={() => navigate(`/profile/${user.id}`)}
            >
             
              <div>
                <strong>{i + 1}. {user.name}</strong>
                <p style={userScore}>⭐ {user.score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ======= ESTILOS ======= */

const loaderOverlay: React.CSSProperties = {
  height: "100vh",
  background: "#f3f4f6",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center"
};

const loader: React.CSSProperties = {
    width: 50,
    height: 50,
    border: "5px solid #ddd",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animationName: "spin",
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear"
  };
  

const layout = (mobile: boolean): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: mobile ? "1fr" : "2.2fr 1fr",
  gap: 28,
  padding: 24,
  maxWidth: 1400,
  margin: "auto",
  background: "#f3f4f6",
  minHeight: "100vh"
});

const panel: React.CSSProperties = {
  background: "#ffffff",
  padding: 20,
  borderRadius: 18,
  boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column"
};

const title: React.CSSProperties = {
  fontWeight: "bold",
  marginBottom: 20
};

const feedCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 14,
  padding: 18,
  marginBottom: 14,
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
};

const feedQuestion: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 8
};

const feedAnswer: React.CSSProperties = {
  background: "#ecfdf5",
  borderRadius: 10,
  padding: 10,
  color: "#065f46",
  marginBottom: 10,
  fontSize: 14
};

const feedMeta: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
  opacity: 0.75
};

const sidebarTitle: React.CSSProperties = {
  marginTop: 20,
  marginBottom: 16,
  fontWeight: "bold"
};

const loginBtnVIP: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff",
  padding: "12px",
  borderRadius: 12,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  width: "100%",
  marginBottom: 20
};

const userCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 10,
  borderRadius: 12,
  cursor: "pointer",
  background: "#f9fafb",
  marginBottom: 10,
  transition: "0.25s ease"
};



const userScore: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.65,
  marginTop: 2
};

const fadeIn: React.CSSProperties = {
  animation: "fadeIn .4s ease"
};

const popIn: React.CSSProperties = {
  animation: "pop .45s ease"
};

const hoverLift: React.CSSProperties = {
  transition: "0.25s"
};

/* ======= HEADER CON BANNER ======= */
const bannerHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "24px 32px",
  borderRadius: 18,
  margin: "24px auto",
  maxWidth: 1400,
  backgroundImage: "url('/images/banner-bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "#fff",
  boxShadow: "0 8px 20px rgba(0,0,0,0.12)"
};



const bannerSocial: React.CSSProperties = {
  display: "flex",
  gap: 16
};

const bannerIcon: React.CSSProperties = {
  width: 32,
  height: 32,
  cursor: "pointer",
  
};
const bannerSubtitle: React.CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto 10px",
  padding: "0 32px",
  textAlign: "left"
};



const bannerDescription: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280"
};

const keyFrames = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
@keyframes pop { from { opacity:0; transform:scale(.94);} to {opacity:1; transform:scale(1);} }
`;

if (!document.getElementById("ani-css")) {
  const s = document.createElement("style");
  s.id = "ani-css";
  s.innerHTML = keyFrames;
  document.head.appendChild(s);
}
