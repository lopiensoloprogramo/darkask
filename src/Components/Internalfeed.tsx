import { useEffect, useState } from "react";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import type { Question } from "../types/QuestionsInterfaz";
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./Header";
import logoBANNER from "../assets/bannernew.png";
import fbIcon from "../assets/fbICONO.png";
import inIcon from "../assets/inICONO.png";

export default function InternalFeed() {

  const [questions, setQuestions] = useState<Question[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [tab, setTab] = useState<"recent" | "top" | "spicy">("recent");
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 900);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

useEffect(() => {

  const unsub = onAuthStateChanged(auth, (user) => {

    if (!user) {
      navigate("/");
      return;
    }

    setAuthUser(user);

  });

  return () => unsub();

}, []);








  
  const navigate = useNavigate();

  useEffect(() => {

    const fetchQuestions = async () => {

      setLoading(true);

      let q;

      if (tab === "recent") {
        q = query(
          collection(db, "questions"),
          where("answered", "==", true),
          orderBy("answeredAt", "desc")
        );
      }

      if (tab === "top") {
        q = query(
          collection(db, "questions"),
          where("answered", "==", true),
          orderBy("likesCount", "desc")
        );
      }

      if (tab === "spicy") {
        q = query(
          collection(db, "questions"),
          where("answered", "==", true),
          orderBy("score", "desc")
        );
      }

      const snap = await getDocs(q!);

      const questionsData = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Question[];

      setQuestions(questionsData);

      /* cargar usuarios */

      const ownerIds = [...new Set(questionsData.map(q => q.ownerId))];

      const usersSnap = await getDocs(collection(db, "users"));

      const map: Record<string, any> = {};

      usersSnap.docs.forEach(doc => {
        if (ownerIds.includes(doc.id)) {
          map[doc.id] = doc.data();
        }
      });

      setUsersMap(map);

      setLoading(false);
    };

    fetchQuestions();

  }, [tab]);

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

const handleLike = async (q: Question) => {

  if (!authUser) {
    navigate("/login");
    return;
  }

  const likeId = `${q.id}_${authUser.uid}`;

  const likeRef = doc(db, "likes", likeId);
  const questionRef = doc(db, "questions", q.id);

  const likeSnap = await getDoc(likeRef);

  try {

    if (likeSnap.exists()) {

      // quitar like
      await deleteDoc(likeRef);

      await updateDoc(questionRef, {
        likesCount: increment(-1)
      });

      setQuestions(prev =>
        prev.map(item =>
          item.id === q.id
            ? { ...item, likesCount: (item.likesCount || 0) - 1 }
            : item
        )
      );

    } else {

      // dar like
      await setDoc(likeRef, {
        questionId: q.id,
        userId: authUser.uid,
        createdAt: serverTimestamp()
      });

      await updateDoc(questionRef, {
        likesCount: increment(1)
      });

      setQuestions(prev =>
        prev.map(item =>
          item.id === q.id
            ? { ...item, likesCount: (item.likesCount || 0) + 1 }
            : item
        )
      );

    }

  } catch (err) {
    console.error("Error toggle like", err);
  }

};






  return (
    <div style={cajaMayor}>
  
   <Header
     isMobile={isMobile}
     logo={logoBANNER}
     fbIcon={fbIcon}
     inIcon={inIcon}
     
   />

   

    <div style={container}>
      
      <h2 style={title}>🔥 Chismes del momento</h2>

      {/* TABS */}

      <div style={tabsContainer}>

        <button
          style={tab === "recent" ? tabActive : tabBtn}
          onClick={() => setTab("recent")}
        >
          🔥 Recientes
        </button>

        <button
          style={tab === "top" ? tabActive : tabBtn}
          onClick={() => setTab("top")}
        >
          ⭐ Populares
        </button>

        <button
          style={tab === "spicy" ? tabActive : tabBtn}
          onClick={() => setTab("spicy")}
        >
          🧨 Picantes
        </button>

      </div>

      {/* SPINNER */}

      {loading && (
        <div style={spinnerContainer}>
          <div style={spinner}></div>
        </div>
      )}

      {/* FEED */}

      {!loading && questions.map(q => {

        const user = usersMap[q.ownerId];

        return (
          <div key={q.id} style={feedCard}>

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

            <div style={feedAnswer}>{q.answer}</div>

            <div style={feedMeta}>
              <span>⏳ {timeAgo(q.answeredAt || q.timestamp)}</span>
                      <span
                        onClick={() => handleLike(q)}
                        style={{ cursor: "pointer" }}
                      >
                        ❤️ {q.likesCount || 0}
                      </span>
            </div>

          </div>
        );
      })}

    </div>
  
    </div>
  );
  
}


/* ======================
ESTILOS
====================== */


const cajaMayor: React.CSSProperties={
  maxWidth: 1000,
  margin: "auto",
  padding: 24,
}


const container: React.CSSProperties = {
 
 
 
  background: "#f3f4f6",
  minHeight: "100vh"
};

const title: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  marginBottom: 20
};

const tabsContainer: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginBottom: 20
};

const tabBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 12,
  border: "none",
  background: "#e5e7eb",
  cursor: "pointer",
  fontWeight: 600
};

const tabActive: React.CSSProperties = {
  ...tabBtn,
  background: "#6366f1",
  color: "#fff"
};

const feedCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
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
  opacity: 0.6
};

const feedQuestion: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 8
};

const feedAnswer: React.CSSProperties = {
  background: "linear-gradient(120deg,#ecfdf5,#f0fdf4)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "#064e3b",
  marginBottom: 10,
  fontSize: 14
};

const feedMeta: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
  opacity: 0.8
};

const spinnerContainer: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 40
};

const spinner: React.CSSProperties = {
  width: 40,
  height: 40,
  border: "4px solid #e5e7eb",
  borderTop: "4px solid #6366f1",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};