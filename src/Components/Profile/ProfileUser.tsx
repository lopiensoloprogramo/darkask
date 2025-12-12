import { useEffect, useState } from "react";
import {
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  limit,
  arrayUnion,
  arrayRemove,
  increment
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../services/firebase";

import AnswerModal from "../AnswerModal";
import QuestionModal from "../QuestionModal";
import QuestionForm from "../QuestionForm";
import ShareModal from "../ShareModal";

import type { Question } from "../../types/QuestionsInterfaz";


/* ===== INTERFACES ===== */

interface ProfileProps {
  profileUserId: string;
  authUser: any;
}

interface UserData {
  name: string;
  email: string;
  photoURL?: string;
}

/* ===== COMPONENT ===== */

export default function ProfileUser({ profileUserId, authUser }: ProfileProps) {

  const [userData, setUserData] = useState<UserData | null>(null);
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
  const [topQuestions, setTopQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [sharedQuestion, setSharedQuestion] = useState<Question | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  const isOwner = authUser?.uid === profileUserId;

  /* ===== RESPONSIVE ===== */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===== DATA LOAD ===== */
  useEffect(() => {

    const loadData = async () => {
      setLoading(true);

      const normalize = (d: any) => ({
        ...d,
        likedBy: d.likedBy || [],
        likes: d.likes || 0,
        score: d.score || 0
      });

      /* --- PERFIL --- */
      const refUser = doc(db, "users", profileUserId);
      const snapUser = await getDoc(refUser);

        if (snapUser.exists()) {
        const data = snapUser.data() as UserData;
        console.log("USER DATA:", data); // ✅ ahora sí existe data
        setUserData(data);
        } else {
        setUserData(null);
        }

      /* --- RESPONDIDAS --- */
      const qAnswered = query(
        collection(db, "questions"),
        where("ownerId", "==", profileUserId),
        where("answered", "==", true),
        orderBy("timestamp", "desc")
      );

      const snapAnswered = await getDocs(qAnswered);
      
      setAnsweredQuestions(
        snapAnswered.docs.map(d => ({ id: d.id, ...normalize(d.data()) })) as Question[]
      );

     
      if (isOwner) {
        const qPending = query(
          collection(db, "questions"),
          where("ownerId", "==", profileUserId),
          where("answered", "==", false),
          orderBy("timestamp", "desc")
        );

        const snapPending = await getDocs(qPending);
        setPendingQuestions(
          snapPending.docs.map(d => ({ id: d.id, ...normalize(d.data()) })) as Question[]
        );
      } else {
        setPendingQuestions([]); // ✅ limpia si NO es dueño
      }

      /* --- TOP RESPONDIDAS --- */
      const qTop = query(
        collection(db, "questions"),
        where("ownerId", "==", profileUserId),
        where("answered", "==", true),
        orderBy("likes", "desc"),
        limit(5)
      );

      const snapTop = await getDocs(qTop);
      setTopQuestions(
        snapTop.docs.map(d => ({ id: d.id, ...normalize(d.data()) })) as Question[]
      );

      setLoading(false);
    };

    loadData();
  }, [profileUserId, isOwner]);

  /* ===== VISIBLES ===== */
 

  /* ===== LOGOUT ===== */
  const handleLogout = async () => {
    await signOut(getAuth());
    window.location.href = "/";
  };

  /* ===== LIKE ===== */
  const handleLike = async (q: Question) => {
    if (!authUser) return alert("Debes iniciar sesión ❤️");

    const userId = authUser.uid;
    const ref = doc(db, "questions", q.id);
    const alreadyLiked = q.likedBy?.includes(userId) ?? false;

    await updateDoc(ref, {
      likes: increment(alreadyLiked ? -1 : 1),
      likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId)
    });

    const snap = await getDoc(ref);
    const updated = { id: ref.id, ...snap.data() } as Question;

    const sync = (list: Question[]) =>
      list.map(item =>
        item.id === q.id
          ? { ...item, likes: updated.likes, likedBy: updated.likedBy }
          : item
      );

    setAnsweredQuestions(sync);
    setTopQuestions(sync);
  };

  /* ===== LOADING ===== */
  if (loading)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Cargando perfil...</p>;

  if (!userData)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Perfil no encontrado</p>;

  /* ===== UI ===== */
  return (
    <div style={layout(isMobile)}>

      {/* PERFIL */}
      <div style={profileCard}>
        <img
          src={userData.photoURL}
          
          style={avatar}
        />

        <h2>{userData.name}</h2>
        <p style={{ opacity: 0.85 }}>{userData.email}</p>

        {isOwner && (
          <button style={btnLogout} onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}

        {!isOwner && (
          <button style={btnAsk} onClick={() => setQuestionModalOpen(true)}>
            Hacer pregunta
          </button>
        )}
      </div>

      {/* PREGUNTAS */}
{/* PREGUNTAS */}


{isOwner && (
  <div style={{ marginBottom: 30 }}>
    <h2 style={sectionTitle}>🕒 Preguntas pendientes</h2>

    {pendingQuestions.length === 0 && (
      <p>No tienes preguntas pendientes.</p>
    )}

    {pendingQuestions.map(q => (
      <div key={q.id} style={card}>
        <p style={questionTitle}>{q.question}</p>

        <div style={pendingBox}>⏳ Pendiente</div>

        <button style={btnAnswer} onClick={() => setSelectedQuestion(q)}>
          Responder
        </button>
      </div>
    ))}
  </div>
)}


<div style={{ marginBottom: 30 }}>
  <h2 style={sectionTitle}>✔ Preguntas respondidas</h2>

  {answeredQuestions.length === 0 && (
    <p>No hay preguntas respondidas aún.</p>
  )}

  {answeredQuestions.map(q => (
    <div key={q.id} style={card}>
      <p style={questionTitle}>{q.question}</p>

      <div style={answerBox}>{q.answer}</div>

      <div style={likeRow}>
        <button
          style={heart(q.likedBy?.includes(authUser?.uid ?? "") ?? false)}
          onClick={() => handleLike(q)}
        >
          ❤️ {q.likes}
        </button>
      </div>

      {isOwner && (
        <button style={btnShare} onClick={() => setSharedQuestion(q)}>
          Compartir
        </button>
      )}
    </div>
  ))}
</div>


      {/* DESTACADAS */}
      <div>
        <h2 style={sectionTitle}>🔥 Destacadas</h2>

        {topQuestions.length === 0 && <p>No hay ranking aún</p>}

        {topQuestions.map((q, i) => (
          <div key={q.id} style={rankCard}>
            <div style={rankNumber}>#{i + 1}</div>
            <div>
              <strong>{q.question}</strong>
              <p style={rankMeta}>❤️ {q.likes} · ⭐ {q.score}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODALES */}
      {selectedQuestion && (
        <AnswerModal
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          onAnswered={(updated: Question) => {
            setPendingQuestions(p => p.filter(q => q.id !== updated.id));
            setAnsweredQuestions(a => [updated, ...a]);
            setSharedQuestion(updated);
            setSelectedQuestion(null);
          }}
        />
      )}

      {sharedQuestion && (
        <ShareModal
          isOpen={true}
          onClose={() => setSharedQuestion(null)}
          question={sharedQuestion}
        />
      )}

      <QuestionModal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
      >
        <QuestionForm
          recipientUid={profileUserId}
          onClose={() => setQuestionModalOpen(false)}
        />
      </QuestionModal>

    </div>
  );
}

/* ===== ESTILOS ===== */

const layout = (mobile: boolean): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: mobile ? "1fr" : "300px 2fr 1fr",
  gap: 24,
  padding: 24,
  maxWidth: 1400,
  margin: "auto"
});

const profileCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  borderRadius: 20,
  padding: 22,
  color: "#fff",
  textAlign: "center"
};

const avatar: React.CSSProperties = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid white"
};

const sectionTitle: React.CSSProperties = {
  marginBottom: 14,
  fontWeight: 700
};

const card: React.CSSProperties = {
  background: "#fff",
  padding: 18,
  borderRadius: 18,
  boxShadow: "0 8px 20px rgba(0,0,0,.08)",
  marginBottom: 16
};

const questionTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 15,
  marginBottom: 6
};

const answerBox: React.CSSProperties = {
  background: "#E3FCEF",
  padding: 10,
  borderRadius: 10,
  color: "#0f5132",
  marginTop: 6
};

const pendingBox: React.CSSProperties = {
  background: "#FFF3CD",
  padding: 10,
  borderRadius: 10,
  marginTop: 6,
  color: "#664d03"
};

const btnAsk: React.CSSProperties = {
  marginTop: 14,
  background: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 600,
  cursor: "pointer"
};

const btnAnswer: React.CSSProperties = {
  marginTop: 8,
  background: "#198754",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer"
};

const btnShare: React.CSSProperties = {
  marginTop: 8,
  marginLeft: 6,
  background: "#0d6efd",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer"
};

const btnLogout: React.CSSProperties = {
  marginTop: 14,
  background: "#dc3545",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600
};

const rankCard: React.CSSProperties = {
  display: "flex",
  gap: 12,
  padding: 14,
  background: "#f9f9f9",
  borderRadius: 14,
  marginBottom: 10
};

const rankNumber: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "#000",
  color: "#fff",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const rankMeta: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.7
};

const likeRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 6
};

const heart = (active: boolean): React.CSSProperties => ({
  background: "none",
  border: "none",
  fontSize: 16,
  cursor: "pointer",
  fontWeight: "bold",
  color: active ? "crimson" : "#aaa"
});
