import { useEffect, useState } from "react";
import { useCallback } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  limit as firestoreLimit, 
  getDocs, getDoc,
  where,
  startAfter,
  doc,
  increment,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";

import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import type { Question } from "../types/QuestionsInterfaz";

import fbIcon from "../assets/fbICONO.png"
import inIcon from "../assets/inICONO.png";
import logoBANNER from "../assets/bannernew.png"

import ProfileSearch from "../Components/ProfileSearch";
import LoginModal from "./LoginModal";

interface UserSummary {
  id: string;
  name: string;
  photoURL?: string;
  score: number;
}


export default function LatestAnsweredQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topUsers, setTopUsers] = useState<UserSummary[]>([]);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const [lastDoc, setLastDoc] = useState<any>(null);
const [loadingMore, setLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [showLogin, setShowLogin] = useState(false);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
// guarda qué preguntas ya le gustaron al usuario
const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});












// ======================================
// LIKE CON TRANSACCIÓN (EVITA ERRORES)
// ======================================


 const fetchQuestions = useCallback(async (isLoadMore = false) => {

  if (isLoadMore) setLoadingMore(true);

  let q;

  if (isLoadMore && lastDoc) {
    q = query(
      collection(db, "questions"),
      where("answered", "==", true),
      orderBy("answeredAt", "desc"),
      startAfter(lastDoc),
      firestoreLimit(PAGE_SIZE)
    );
  } else {
    q = query(
      collection(db, "questions"),
      where("answered", "==", true),
      orderBy("answeredAt", "desc"),
      firestoreLimit(PAGE_SIZE)
    );
  }

  const snap = await getDocs(q);

  const newQuestions = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  })) as Question[];

  setQuestions(prev =>
    isLoadMore ? [...prev, ...newQuestions] : newQuestions
  );

  // usuarios
  const ownerIds = [...new Set(newQuestions.map(q => q.ownerId))];

const newUsersMap = { ...usersMap };

await Promise.all(
  ownerIds.map(async (id) => {
    if (!newUsersMap[id]) {
      const snap = await getDoc(doc(db, "users", id));
      if (snap.exists()) {
        newUsersMap[id] = snap.data();
      }
    }
  })
);

setUsersMap(newUsersMap);

  // paginación
  const lastVisible = snap.docs[snap.docs.length - 1];
  setLastDoc(lastVisible);

  if (snap.docs.length < PAGE_SIZE) {
    setHasMore(false);
  }

  if (isLoadMore) setLoadingMore(false);

}, [lastDoc]); // 👈 clave

const handleLike = async (q: Question) => {

  if (!authUser) {
    setShowLogin(true);
    return;
  }
const alreadyLiked = userLikes[q.id];
  try {

    const likeId = `${q.id}_${authUser.uid}`;

    const likeRef = doc(db, "likes", likeId);
    const questionRef = doc(db, "questions", q.id);

    // ==========================
// ACTUALIZACIÓN INSTANTÁNEA
// ==========================

// actualizar contador visual inmediatamente
setQuestions(prev =>
  prev.map(item =>
    item.id === q.id
      ? {
          ...item,
          likesCount: (item.likesCount || 0) + (alreadyLiked ? -1 : 1)
        }
      : item
  )
);

// actualizar corazón
setUserLikes(prev => ({
  ...prev,
  [q.id]: !alreadyLiked
}));

    await runTransaction(db, async (transaction) => {

      const likeSnap = await transaction.get(likeRef);

      if (likeSnap.exists()) {

        // quitar like
        transaction.delete(likeRef);

        transaction.update(questionRef, {
          likesCount: increment(-1)
        });

      } else {

        // dar like
        transaction.set(likeRef, {
          questionId: q.id,
          userId: authUser.uid,
          createdAt: serverTimestamp()
        });

        transaction.update(questionRef, {
          likesCount: increment(1)
        });

  // 🔥 SUMAR SCORE SOLO AQUÍ
      const userRef = doc(db, "users", q.ownerId);

      transaction.update(userRef, {
        score: increment(2)
      });
      }

    });

  } catch (err) {

    console.error("Error toggle like", err);

  // ==========================
  // REVERTIR CAMBIOS VISUALES
  // ==========================

  setQuestions(prev =>
    prev.map(item =>
      item.id === q.id
        ? {
            ...item,
            likesCount: (item.likesCount || 0) + (alreadyLiked ? 1 : -1)
          }
        : item
    )
  );

  setUserLikes(prev => ({
    ...prev,
    [q.id]: alreadyLiked
  }));

  }

};


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

  if (questions.length > 0) return; // 🔥 evita recargar y borrar paginación

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
    await Promise.all([fetchQuestions(false), fetchTopUsers()]);
    setLoading(false);
  };

  load();

}, [fetchQuestions, questions.length]);


const handleLogin = () => {
  navigate("/login");
};

  if (loading) {
    return (
      <div style={loaderOverlay}>
        <div style={loader}></div>
        <p style={{ marginTop: 15, fontWeight: 600 }}>Cargando contenido...</p>
      </div>
    );
  }

        function timeAgo(timestamp: any) {

          if (!timestamp) return "hace un momento";

          const now = Date.now();

          let past;

          if (timestamp?.toDate) {
            // Timestamp de Firestore
            past = timestamp.toDate().getTime();
          } else if (typeof timestamp === "number") {
            // Date.now()
            past = timestamp;
          } else {
            // string o Date
            past = new Date(timestamp).getTime();
          }

          const diff = Math.floor((now - past) / 1000);

          if (diff < 60) return "hace segundos";
          if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
          if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;

          return `hace ${Math.floor(diff / 86400)} días`;
        }




  return (
    <>
      {/* HEADER CON BANNER */}
      <div style={bannerHeader(isMobile)}>
        
        <div style={bannerLeft}>
              <img
                src={logoBANNER}
                style={{
                  width: isMobile ? "90%" : "380px",   // ✔ Ancho ideal
                  maxWidth: "100%",                    // ✔ Nunca se sale del contenedor
                  height: "auto",                      // ✔ Mantiene proporción real
                  objectFit: "contain",                // ✔ No se deforma
                  display: "block",
                  alignSelf: "flex-start",             // ✔ Pegado a la izquierda
                }}
              />
      </div>

            <div style={bannerRight}>
              <ProfileSearch />
              
              <div style={bannerSocial}>
                
              <img src={fbIcon} style={bannerIcon} />
              <a href="https://www.instagram.com/ladarkask?igsh=NjE4ZGpncGdoN2Uy" target="_blank" 
              rel="noopener noreferrer"
              style={{ display: "flex" }}
              >
                <img src={inIcon} style={bannerIcon} />
              </a>
              </div>
            </div>




        
      </div>
<div style={heroBox}>
  <h1 style={heroTitle}>
  El chisme es público.<br />
  Tu nombre no.
</h1>
  <p style={heroText}>
    Confesiones, rumores y preguntas que nadie haría con su nombre.
  </p>

<button style={heroBtn} onClick={() => setShowLogin(true)}>
  💀Ver lo que dicen de mí(Ingresar)🔥
</button>
       <div style={morboBox}>
        <p>💬 "¿Por qué nadie te soporta?"</p>
        <p>💬 "Tu ex aún habla de ti."</p>
        <p>💬 "No eres tan buena persona como crees."</p>
      </div>

        <div style={heroSteps}>
          <span>1️⃣ Comparte tu perfil</span>
          <span>2️⃣ Recibe chisme</span>
          <span>3️⃣ Responde público</span>
        </div>
      </div>

      {/* LAYOUT ORIGINAL */}
      <div style={layout(isMobile)}>
        {/* COLUMNA IZQUIERDA */}
        <div style={panel}>
          <h2 style={title}>🔥El chisme del momento</h2>
              {questions.map(q => {

                const user = usersMap[q.ownerId];

                return (
                  <div key={q.id} style={{ ...feedCard, ...fadeIn, ...hoverLift }}>

                    {/* HEADER USUARIO */}
                    <div
                      style={feedUser}
                      onClick={() => navigate(`/profile/${q.ownerId}`)}
                    >
                      <img
                        src={user?.photoURL || "https://i.pravatar.cc/40"}
                        style={feedAvatar}
                      />

                      <div>
                        <strong>{user?.name || "Usuario"}</strong>
                        <p style={feedUserSub}>respondió una pregunta anónima</p>
                      </div>
                    </div>

                    <p style={feedQuestion}>{q.question}</p>
                  
                    <div style={feedAnswer}>
                        {q.answer}

                        {q.imageUrl && (
                          <img
                            src={q.imageUrl}
                            alt="respuesta"
                            style={{
                              width: "100%",
                              marginTop: 10,
                              borderRadius: 12,
                              objectFit: "contain"
                            }}
                          />
                        )}
                      </div>

                    <div style={feedMeta}>
                    <span>⏳ {timeAgo(q.answeredAt || q.timestamp)}</span>
                    <span
                      onClick={() => handleLike(q)}
                      style={{
                        cursor: "pointer",
                        color: userLikes[q.id] ? "#ef4444" : "#9ca3af",
                        fontWeight: "bold"
                      }}
                    >
                      ❤️ {q.likesCount || 0}
                    </span>
                    </div>

                  </div>
                );
              })}
                    {/* 🔥 BOTÓN PAGINACIÓN */}
              {hasMore && (
                <button style={btnVermas} onClick={() => fetchQuestions(true)}>
                  {loadingMore ? "Cargando..." : "Ver más 🔥"}
                </button>
        )}
        </div>

        {/* COLUMNA DERECHA */}
        <div style={panel}>
          {!authUser && (
            <button style={{ ...loginBtnVIP, ...popIn }} onClick={handleLogin}>
              🔥 Entrar al chisme con Google
            </button>
          )}
          <h3 style={avisoAnonimo}>🕵️Nadie sabrá que fuiste tú.</h3>
          <h3 style={sidebarTitle}>👀Los más mencionados hoy</h3>
         
              {topUsers.map((user, i) => (
                <div
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  style={{
                    ...userCard,
                    ...fadeIn,
                    ...hoverLift,
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    cursor: "pointer"
                  }}
                >
                  {/* FOTO */}
                  <img
                    src={user.photoURL || "https://i.pravatar.cc/150"}
                    alt={user.name}
                    style={{
                      width: i === 0 ? 90 : 60,
                      height: i === 0 ? 90 : 60,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: i === 0 ? "3px solid gold" : "2px solid #ccc",
                      transition: "0.3s",
                      boxShadow: i === 0 ? "0 0 15px gold" : "none"
                    }}
                  />

                  {/* INFO */}
                  <div style={{ marginTop: 8 }}>
                    <strong style={{ fontSize: i === 0 ? 16 : 14 }}>
                      🏆 #{i + 1} {user.name}
                    </strong>

                    <p style={userScore}>⭐ {user.score}</p>
                  </div>
                </div>
              ))}
        </div>
      </div>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
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
  gap: mobile ? 16 : 28,
  padding: mobile ? "12px" : "24px",
  maxWidth: 1400,
  margin: mobile ? "0" : "auto",
  background: "#f3f4f6",
  minHeight: "100vh"
});

const panel: React.CSSProperties = {
  background: "#ffffff",
  padding: 0,
  borderRadius: 18,
  boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  marginLeft:"0"
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
  background: "linear-gradient(120deg, #ecfdf5, #f0fdf4)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "#064e3b",
  marginBottom: 10,
  fontSize: 14,
  fontWeight: 500
};

const feedMeta: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
  opacity: 0.8,
  cursor: "pointer"
};

const sidebarTitle: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 16,
  marginLeft:10,
  fontWeight: "bold",
  
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
  padding: 12,
  borderRadius: 14,
  cursor: "pointer",
  background: "linear-gradient(135deg, #f9fafb, #eef2ff)",
  marginBottom: 10,
  transition: "0.25s ease",
  fontWeight: 600
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
const bannerHeader = (mobile: boolean): React.CSSProperties => ({
  display: "flex",
  flexDirection: mobile ? "column" : "row",
  justifyContent: "space-between",
  alignItems: "left",
  padding: mobile ? "16px" : "24px 32px",
  borderRadius: 18,
  margin: "8px auto",
  maxWidth: 1400,
  gap: mobile ? 12 : 0,
  backgroundImage: "url('/images/banner-bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",

  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  textAlign: mobile ? "center" : "left",
});




const bannerSocial: React.CSSProperties = {
  display: "flex",
  gap: 16
};

const bannerIcon: React.CSSProperties = {
  width: 32,
  height: 32,
  cursor: "pointer",
  
};

const avisoAnonimo: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
  marginLeft: 10
  
};


const heroBox: React.CSSProperties = {
  maxWidth: 1400,
  margin: "8px auto 24px",
  padding: "20px",
  borderRadius: 16,
  textAlign: "center",
  background: "linear-gradient(135deg, #111827, #1f2933)",
  color: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,.15)"
};

const isMobile = window.innerWidth < 768;

const heroTitle: React.CSSProperties = {
  fontSize: isMobile ? "2rem" : "3rem",
  lineHeight: "1.05",
  marginBottom: "8px",
  textAlign: isMobile ? "center" : "center",
  fontWeight: "bold",
  letterSpacing: "-0.5px",
 
  
};

const heroText: React.CSSProperties = {
  fontSize: "0.95rem",
  opacity: 0.85,
  marginBottom: 16,
  color: "#9ca3af"
};

const heroBtn: React.CSSProperties = {
  background: "linear-gradient(135deg, #ef4444, #f97316)",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 15,
  marginBottom: 12,
  boxShadow: "0 6px 18px rgba(0,0,0,.3)"
};

const heroSteps: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 20,
  flexWrap: "wrap",
  marginTop: 8,
  fontSize: 12,
  opacity: 0.75
};

const morboBox : React.CSSProperties = {
  marginTop: "15px",
  color: "#9ca3af",
  fontSize: "0.95rem",
  textAlign: "center",
  lineHeight: "1.5",
  opacity: 0.85,
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
const bannerRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginLeft:"5px"
};

const bannerLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center"
};

const feedUser: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
  cursor: "pointer"
};

const feedAvatar: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  objectFit: "cover"
};

const feedUserSub: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.6,
  marginTop: -2
};
const btnVermas: React.CSSProperties={
  border:0,
  background: "#ff0000",
  color:"#fff",
  fontSize:14
}