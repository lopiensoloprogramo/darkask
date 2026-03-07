import { useEffect, useState } from "react";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import type { Question } from "../types/QuestionsInterfaz";

export default function InternalFeed() {

  const [questions, setQuestions] = useState<Question[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});

  const navigate = useNavigate();

  useEffect(() => {

    const fetchQuestions = async () => {

      const q = query(
        collection(db, "questions"),
        where("answered", "==", true),
        orderBy("timestamp", "desc")
      );

      const snap = await getDocs(q);

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

  }, []);

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
    <div style={{
        maxWidth: 1100,
        margin: "auto",
        padding: "24px",
        background: "#f3f4f6",
        minHeight: "100vh"
        }}>

                <h2 style={{
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 25
            }}>
            🔥 Lo que la gente está respondiendo
            </h2>

      {questions.map(q => {

        const user = usersMap[q.ownerId];

        return (
          <div key={q.id} style={feedCard}>

            {/* USUARIO */}
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

            {/* PREGUNTA */}
            <p style={feedQuestion}>{q.question}</p>

            {/* RESPUESTA */}
            <div style={feedAnswer}>{q.answer}</div>

            {/* META */}
            <div style={feedMeta}>
              <span>⏳ {timeAgo(q.timestamp)}</span>
              <span>❤️ {q.likes || 0} | ⭐ {q.score || 0}</span>
            </div>

          </div>
        );
      })}

    </div>
  );
}

/* ESTILOS (los mismos que usas) */

const feedCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 22,
  marginBottom: 18,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  transition: "0.25s"
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
  opacity: 0.8
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