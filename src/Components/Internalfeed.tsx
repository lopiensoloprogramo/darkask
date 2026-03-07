import { useEffect, useState } from "react";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import type { Question } from "../types/QuestionsInterfaz";

export default function InternalFeed() {

  const [questions, setQuestions] = useState<Question[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [tab, setTab] = useState<"recent" | "top" | "spicy">("recent");

  const navigate = useNavigate();

  useEffect(() => {

    const fetchQuestions = async () => {

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
          orderBy("likes", "desc")
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
    };

    fetchQuestions();

  }, [tab]);

  function timeAgo(timestamp: any) {

    if (!timestamp) return "hace un momento";

    const now = new Date().getTime();
    const past = timestamp.toDate().getTime();
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return "hace segundos";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;

    return `hace ${Math.floor(diff / 86400)} días`;
  }

  return (

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

      {/* FEED */}

      {questions.map(q => {

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
             <span>⏳ {timeAgo(q.assweredAt || q.timestamp)}</span>
              <span>❤️ {q.likes || 0} | ⭐ {q.score || 0}</span>
            </div>

          </div>
        );
      })}

    </div>
  );
}










/* ======================
ESTILOS
====================== */

const container: React.CSSProperties = {
  maxWidth: 1000,
  margin: "auto",
  padding: 24,
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