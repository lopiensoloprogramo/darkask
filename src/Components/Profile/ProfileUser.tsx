import React, { useEffect, useState } from "react";
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
  increment,
  onSnapshot
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../services/firebase";

import AnswerModal from "../AnswerModal";
import QuestionModal from "../QuestionModal";
import QuestionForm from "../QuestionForm";
import ShareModal from "../ShareModal";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Question } from "../../types/QuestionsInterfaz";
import { useNavigate } from "react-router-dom";
/* ===== INTERFACES ===== */

interface ProfileProps {
  profileUserId: string;
  authUser: any;
}

interface UserData {
  name: string;
  email: string;
  photoURL?: string;
  googlePhotoURL?: string;
  coverURL?: string;
  username: string;
  bio?: string;
    // posición de la portada
  coverX?: number;
  coverY?: number;


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
  const [activeTab, setActiveTab] = useState<"pending" | "answered">("answered");

  const isOwner = authUser?.uid === profileUserId;

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioTextValue, setBioTextValue] = useState("");

  /* ===== COVER DRAG SYSTEM (PRO) ===== */

  const [movingCover, setMovingCover] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [coverPos, setCoverPos] = useState({
    x: 50,
    y: 50
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [prevNotifCount, setPrevNotifCount] = useState(0);
  const navigate = useNavigate();

  /* ===== RESPONSIVE ===== */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

useEffect(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes ring {
  0% { transform: rotate(0); }
  15% { transform: rotate(-18deg); }
  30% { transform: rotate(18deg); }
  45% { transform: rotate(-12deg); }
  60% { transform: rotate(12deg); }
  75% { transform: rotate(-6deg); }
  100% { transform: rotate(0); }
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}, []);
  /* ===== PENDING QUESTIONS REALTIME ===== */
useEffect(() => {
  if (!isOwner) return;

 const normalize = (d: any) => ({
  ...d,
  likedBy: d.likedBy || [],
  likesCount: d.likesCount || 0,
  score: d.score || 0
});

  const qPending = query(
    collection(db, "questions"),
    where("ownerId", "==", profileUserId),
    where("answered", "==", false),
    orderBy("timestamp", "desc")
  );

  const unsubscribe = onSnapshot(qPending, snapshot => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...normalize(doc.data())
    })) as Question[];

    setPendingQuestions(data);
  });

  return () => unsubscribe();

}, [profileUserId, isOwner]);

  /* ===== LOAD DATA ===== */
/* ===== LOAD DATA ===== */
useEffect(() => {
  const normalize = (d: any) => ({
    ...d,
    likedBy: d.likedBy || [],
    likes: d.likes || 0,
    score: d.score || 0
  });

  const loadData = async () => {
    setLoading(true);

    /* --- USER --- */
    const snapUser = await getDoc(doc(db, "users", profileUserId));
    const data = snapUser.exists() ? (snapUser.data() as UserData) : null;

    setUserData(data);

    if (data) {
      setCoverPos({
        x: data.coverX ?? 50,
        y: data.coverY ?? 50
      });
    }

    /* --- ANSWERED --- */
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

    /* --- TOP --- */
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

}, [profileUserId]);

useEffect(() => {
  if (!authUser) return;

  const q = query(
    collection(db, "notifications"),
    where("ownerId", "==", authUser.uid),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setNotifications(data);
  });

  return () => unsubscribe();
}, [authUser]);


useEffect(() => {
  if (notifications.length > prevNotifCount) {

    const bell = document.getElementById("bell-icon");

    if (bell) {
      bell.style.animation = "ring 0.6s 2";
      setTimeout(() => {
        bell.style.animation = "";
      }, 1200);
    }

  }

  setPrevNotifCount(notifications.length);

}, [notifications]);
  

  /* ===== LOGOUT ===== */
  const handleLogout = async () => {
    await signOut(getAuth());
    window.location.href = "/";
  };

  /* ===== LIKE ===== */
 const handleLike = async (q: Question) => {

  if (!authUser) {
    navigate("/");
    return;
  }

  const userId = authUser.uid;
  const ref = doc(db, "questions", q.id);
  const alreadyLiked = q.likedBy?.includes(userId) ?? false;

  await updateDoc(ref, {
    likesCount: increment(alreadyLiked ? -1 : 1),
    likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId)
  });

  const snap = await getDoc(ref);
  const updated = { id: ref.id, ...snap.data() } as Question;

  const sync = (list: Question[]) =>
    list.map(item =>
      item.id === q.id
        ? { ...item, likesCount: updated.likesCount, likedBy: updated.likedBy }
        : item
    );

  setAnsweredQuestions(sync);
  setTopQuestions(sync);
};

  /*Subir imagen de perfil */

const handleAvatarChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file || !authUser) return;

  try {
    setUploadingAvatar(true);

    const storage = getStorage();
    const avatarRef = ref(
      storage,
      `avatars/${authUser.uid}/avatar.jpg`
    );

    await uploadBytes(avatarRef, file);

    const downloadURL = await getDownloadURL(avatarRef);

    const userRef = doc(db, "users", authUser.uid);
    await updateDoc(userRef, {
      photoURL: downloadURL
    });

    setUserData(prev =>
      prev ? { ...prev, photoURL: downloadURL } : prev
    );

  } catch (err) {
    console.error("Error subiendo avatar:", err);
  } finally {
    setUploadingAvatar(false);
  }
};


const handleCoverChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file = e.target.files?.[0];
  if (!file || !authUser) return;

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  img.src = objectUrl;

  img.onload = async () => {

    try {

      if (img.height < 160) {
        alert("La portada debe tener al menos 160px");
        return;
      }

      setUploadingCover(true);

      const storage = getStorage();

      const coverRef = ref(
        storage,
        `covers/${authUser.uid}/cover.jpg`
      );

      await uploadBytes(coverRef, file);

      const downloadURL = await getDownloadURL(coverRef);

      const userRef = doc(db, "users", authUser.uid);

      await updateDoc(userRef, {
        coverURL: downloadURL
      });

      setUserData(prev =>
        prev ? { ...prev, coverURL: downloadURL } : prev
      );

    } catch (err) {

      console.error("Error subiendo portada:", err);

    } finally {

      setUploadingCover(false);

      URL.revokeObjectURL(objectUrl);
    }
  };
};

const startEditingBio = () => {
  setBioTextValue(userData?.bio || "");
  setEditingBio(true);
};
const saveBio = async () => {

  if (!authUser) return;

  if (bioTextValue.length > 160) {
    alert("Máximo 160 caracteres");
    return;
  }

  const userRef = doc(db, "users", authUser.uid);

  await updateDoc(userRef, {
    bio: bioTextValue
  });

  setUserData(prev =>
    prev ? { ...prev, bio: bioTextValue } : prev
  );

  setEditingBio(false);
};

  /* ===== DATA TO SHOW ===== */
  const questionsToShow = isOwner
    ? activeTab === "pending"
      ? pendingQuestions
      : answeredQuestions
    : answeredQuestions;

/* ===== STATS ===== */

const totalAnswers = answeredQuestions.length;

const totalLikes = answeredQuestions.reduce(
  (acc, q) => acc + (q.likesCount || 0),
  0
);

const totalTop = topQuestions.length;



  /* ===== LOADING ===== */
  if (loading)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Cargando perfil...</p>;

  if (!userData)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Perfil no encontrado.</p>;







  /* ===== UI ===== */
  return (
    <div style={{...layout(isMobile),    background: "#f8fafc",minHeight: "100vh"}}>

      {/* PERFIL */}
      <div style={profileCard}>
          <input
            type="file"
            accept="image/*"
            id="coverInput"
            style={{ display: "none" }}
            onChange={handleCoverChange}
          />
        <div
            style={{
              ...profileCover,
              backgroundImage: userData.coverURL
                ? `url(${userData.coverURL})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: `${coverPos.x}% ${coverPos.y}%`,
              cursor: movingCover ? (dragging ? "grabbing" : "grab") : "default"
            }}

                onTouchStart={() => {
                  if (!movingCover || !isOwner) return;
                  setDragging(true);
                }}

                onTouchMove={(e) => {

                        if (!dragging || !movingCover) return;

                        const touch = e.touches[0];
                        const rect = e.currentTarget.getBoundingClientRect();

                        const x = ((touch.clientX - rect.left) / rect.width) * 100;
                        const y = ((touch.clientY - rect.top) / rect.height) * 100;

                        setCoverPos({
                          x: Math.max(0, Math.min(100, x)),
                          y: Math.max(0, Math.min(100, y))
                        });

                      }}

                      onTouchEnd={() => {
                        setDragging(false);
                      }}


            onMouseDown={() => {
              if (!movingCover || !isOwner) return;
              setDragging(true);
            }}

            onMouseMove={(e) => {

              if (!dragging || !movingCover) return;

              const rect = e.currentTarget.getBoundingClientRect();

              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;

              setCoverPos({
                x: Math.max(0, Math.min(100, x)),
                y: Math.max(0, Math.min(100, y))
              });

            }}

            onMouseUp={async () => {

              if (!dragging || !authUser) return;

              setDragging(false);

              const userRef = doc(db, "users", authUser.uid);

              await updateDoc(userRef, {
                coverX: coverPos.x,
                coverY: coverPos.y
              });

            }}

            onMouseLeave={() => setDragging(false)}
>

          {isOwner && (
          <button
            style={coverButton}
            onClick={() => document.getElementById("coverInput")?.click()}
          >
            {uploadingCover ? "Subiendo..." : "📷"}
          </button>
          )}
              {isOwner && userData.coverURL && (
                <button
                  style={{
                    ...coverButton,
                    top: 45
                  }}
                  onClick={() => setMovingCover(!movingCover)}
                >
                  {movingCover ? "Guardar" : "↕ Ajustar"}
                </button>
              )}
      </div>
                  <div style={avatarWrapper}>
                      {uploadingAvatar ? (
                        <div style={avatarLoader}></div>
                      ) : (
                        <img
                          src={userData.photoURL || "/default-avatar.png"}
                          alt="avatar"
                          style={avatar}
                        />
                      )}
                    </div>
   
            <div style={headerRow}>
  <h1 style={{ margin: 0 }}>{userData.name}</h1>
        {isOwner && (
          <div style={{ position: "relative" }}>
         <button
           id="bell-icon"
           onClick={async () => {
            setShowNotifications(true);


          }}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              transition: "0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: unreadCount > 0 ? "#ff4757" : "#e0e0e0",
              color: unreadCount > 0 ? "white" : "#555",
              boxShadow: unreadCount > 0
                ? "0 0 12px rgba(255,71,87,0.7)"
                : "none",

              /* animación */
              animation: unreadCount > 0 ? "ring 1s ease" : "none"
            }}
         >
          🔔
          </button>

          {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "black",
              color: "white",
              fontSize: 11,
              fontWeight: "bold",
              borderRadius: "50%",
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {unreadCount}
           </span>
          )}
        
          </div>
        )}
</div>


        <p style={{ opacity: 0.85 }}>{userData.email}</p>
{editingBio ? (

  <div style={{ marginTop: 10 }}>

    <textarea
      value={bioTextValue}
      onChange={(e) => setBioTextValue(e.target.value)}
      maxLength={160}
      style={bioInput}
    />

    <div style={bioControls}>
      <span>{bioTextValue.length}/160</span>

      <button onClick={saveBio} style={btnSaveBio}>
        Guardar
      </button>

      <button onClick={() => setEditingBio(false)} style={btnCancelBio}>
        Cancelar
      </button>
    </div>

  </div>

) : (

  <>
    <p style={bioText}>
      ✨ {userData.bio || "Este usuario aún no tiene bio"}
    </p>

    {isOwner && (
      <button onClick={startEditingBio} style={btnEditBio}>
        ✏️ Editar bio
      </button>
    )}
  </>

)}
                                {/* STATS */}
                      <div style={statsRow}>
                        <div style={statItem}>
                          💬 <strong>{totalAnswers}</strong>
                        </div>

                        <div style={statItem}>
                          ❤️ <strong>{totalLikes}</strong>
                        </div>

                        <div style={statItem}>
                          🔥 <strong>{totalTop}</strong>
                        </div>
                      </div>
                 

   
                  {isOwner ? (
            <div style={ownerActions}>

              <input
                type="file"
                accept="image/*"
                id="avatarInput"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />

              {/* Cambiar foto */}
              <button
                style={btnChangePhoto}
                onClick={() => document.getElementById("avatarInput")?.click()}
              >
                📷 Cambiar foto
              </button>

              {/* Copiar enlace */}
              <button
                style={btnCopyLink}
                onClick={() => {
                  if (!userData?.username) return;
                  const link = `${window.location.origin}/u/${userData.username}`;
                  navigator.clipboard.writeText(link);
                  alert("Enlace copiado 🔗");
                }}
              >
                🔗 Copiar mi enlace
              </button>

              {/* Cerrar sesión */}
              <button
                style={btnLogoutModern}
                onClick={handleLogout}
              >
                🚪 Cerrar sesión
              </button>
                  <button
                  onClick={() => navigate("/feed")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    background: "#ff9800",
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "10px"
                  }}
                >
                🔥Respuestas de Todos
                </button>



            </div>
            ) : (
            <button
              style={btnAskModern}
              onClick={() => setQuestionModalOpen(true)}
            >
              💬 Hacer pregunta
            </button>
          )}
          



  

           
      </div>

      {/* QUESTIONS */}
      <div>
        {isOwner && (
          <div style={tabs}>
            <button
              style={tab(activeTab === "pending")}
              onClick={() => setActiveTab("pending")}
            >
              Pendientes ({pendingQuestions.length})
            </button>
            <button
              style={tab(activeTab === "answered")}
              onClick={() => setActiveTab("answered")}
            >
              Respondidas ({answeredQuestions.length})
            </button>
          </div>
        )}

        {questionsToShow.length === 0 && <p>No hay preguntas aún...</p>}

        {questionsToShow.map(q => (
                <div
                  id={q.id}
                  key={q.id}
                style={{
                  ...card,
                  border:
                    highlightedId === q.id
                      ? "2px solid #ff4757"
                      : "none",
                  boxShadow:
                    highlightedId === q.id
                      ? "0 0 15px rgba(255,71,87,0.5)"
                      : card.boxShadow
                   }}
                >
            <p style={questionTitle}>{q.question}</p>

            {q.answered ? (
              <>
                <div style={answerBox}>{q.answer}</div>

                <div style={likeRow}>
                  <button
                    style={heart(q.likedBy?.includes(authUser?.uid ?? "") ?? false)}
                    onClick={() => handleLike(q)}
                  >
                    ❤️ {q.likesCount} Me gusta
                  </button>
                </div>

                {isOwner && (
                  <button style={btnShare} onClick={() => setSharedQuestion(q)}>
                    Compartir
                  </button>
                )}
              </>
            ) : (
              <>
                <div style={pendingBox}>⏳ Pendiente</div>

                {isOwner && (
                  <button style={btnAnswer} onClick={() => setSelectedQuestion(q)}>
                    Responder
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* TOP */}
      <div>
        <h2 style={sectionTitle}>🔥 Destacadas</h2>

        {topQuestions.length === 0 && <p>No hay ranking aún</p>}

        {topQuestions.map((q, i) => (
          <div key={q.id} style={rankCard}>
            <div style={rankNumber}>#{i + 1}</div>
            <div>
              <strong>{q.question}</strong>
              <p style={rankMeta}>❤️ {q.likesCount} · ⭐ {q.score}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      {selectedQuestion && (
        <AnswerModal
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          onAnswered={(updated: Question) => {
            setPendingQuestions(p => p.filter(q => q.id !== updated.id));
            setAnsweredQuestions(a => [updated, ...a]);
            setSharedQuestion(updated);
            setSelectedQuestion(null);
            setActiveTab("answered");
          }}
        />
      )}

      {sharedQuestion && (
        <ShareModal
          isOpen
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
          recipientUsername={userData.username}
          onClose={() => setQuestionModalOpen(false)}
        />
      </QuestionModal>

                {showNotifications && (
<div
  style={notifOverlay}
  onClick={() => setShowNotifications(false)}
>
  <div
    style={notifModal}
    onClick={(e) => e.stopPropagation()}
  >

    <button
      onClick={() => setShowNotifications(false)}
      style={closeNotifBtn}
    >
      ✕
    </button>

    <h3>Notificaciones</h3>
                

                {notifications.length === 0 && <p>No tienes notificaciones</p>}

                  {notifications.map(n => (
                  <div
                          key={n.id}
                          onClick={async () => {
                            setShowNotifications(false);

                            // 🔹 Si la notificación NO está leída
                            // la marcamos como leída en Firebase
                            if (!n.read) {
                              await updateDoc(doc(db, "notifications", n.id), {
                                read: true
                              });
                            }

                            // 🔹 Cambiamos a la pestaña donde está la pregunta
                            setActiveTab("pending");

                            // 🔹 Guardamos el id para resaltarlo
                            setHighlightedId(n.questionId);

                            // 🔹 Hacemos scroll suave hacia la pregunta
                            setTimeout(() => {
                              const element = document.getElementById(n.questionId);
                              element?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }, 300);

                            // 🔹 Quitamos el resaltado después de 4 segundos
                            setTimeout(() => {
                              setHighlightedId(null);
                            }, 4000);
                          }}
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            marginBottom: 10,
                            cursor: "pointer",
                            transition: "0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                              
                            // 🎨 COLOR SEGÚN ESTADO
                            background: n.read
                              ? "#f1f3f5" // gris claro si ya fue leída
                              : "linear-gradient(135deg, #e7f1ff, #d0e4ff)", // azul suave si NO leída

                            border: n.read
                              ? "1px solid #e0e0e0"
                              : "1px solid #0d6efd",

                            fontWeight: n.read ? "normal" : "600" // texto más fuerte si es nueva
                          }}
                        >
                          <span>📩 Nueva pregunta recibida</span>

                          {/* 🔵 Puntito azul solo si NO está leída */}
                          {!n.read && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#0d6efd"
                              }}
                            />
                          )}
                        </div>
                  ))}

              </div>
            </div>
          )}



    </div>
  );
}

/* ===== STYLES ===== */

const tabs: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 16
};

const tab = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  background: active ? "#0d6efd" : "#eee",
  color: active ? "#fff" : "#333"
});

/* --- RESTO DE ESTILOS (SIN CAMBIOS) --- */

const layout = (mobile: boolean): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: mobile ? "1fr" : "320px 2fr 320px",
  gap: 28,
  padding: 28,
  maxWidth: 1400,
  margin: "auto"
});

const profileCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  borderRadius: 20,
  padding: 22,
  color: "#fff",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
};

const avatar: React.CSSProperties = {
  width: 110,
  height: 110,
  objectFit: "cover"

};

const sectionTitle: React.CSSProperties = {
  marginBottom: 14,
  fontWeight: 700
};

const card: React.CSSProperties = {
  background: "#ffffff",
  padding: 20,
  borderRadius: 18,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  marginBottom: 18,
  transition: "all .25s ease"
};

const questionTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
  marginBottom: 8,
  color: "#222"
};

const answerBox: React.CSSProperties = {
  background: "#f1f5f9",
  padding: 12,
  borderRadius: 12,
  color: "#334155",
  marginTop: 8,
  lineHeight: 1.5
};

const pendingBox: React.CSSProperties = {
  background: "#FFF3CD",
  padding: 10,
  borderRadius: 10,
  marginTop: 6,
  color: "#664d03"
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
  background: "#0d6efd",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer"
};



const rankCard: React.CSSProperties = {
  display: "flex",
  gap: 12,
  padding: 16,
  background: "#ffffff",
  borderRadius: 16,
  marginBottom: 12,
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  alignItems: "center"
};

const rankNumber: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
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
  background: active ? "#ffe4e6" : "#f8fafc",
  border: "none",
  fontSize: 14,
  cursor: "pointer",
  fontWeight: "bold",
  color: active ? "#e11d48" : "#64748b",
  padding: "6px 10px",
  borderRadius: 10,
  transition: "all .2s ease"
});

const avatarWrapper: React.CSSProperties = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "4px solid white",
  background: "#f3f4f6",
  margin: "-60px auto 10px auto",
  position: "relative",
  zIndex: 2
};



const avatarLoader: React.CSSProperties = {
  width: 40,
  height: 40,
  border: "4px solid #ddd",
  borderTopColor: "#ffffff",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};


const notifOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const notifModal: React.CSSProperties = {
  width: "90%",
  maxWidth: 400,
  background: "white",
  padding: 20,
  borderRadius: 12,
  maxHeight: "70vh",
  overflowY: "auto",
  position:"relative"
};

const headerRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  marginTop: 12
};

const ownerActions: React.CSSProperties = {
  marginTop: 18,
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const btnChangePhoto: React.CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  border: "2px solid rgba(255,255,255,0.5)",
  padding: "10px 14px",
  borderRadius: 14,
  fontWeight: 600,
  cursor: "pointer",
  color: "#fff",
  backdropFilter: "blur(6px)",
  transition: "all 0.2s ease"
};

const btnCopyLink: React.CSSProperties = {
  background: "#ffffff",
  color: "#5b3df5",
  padding: "12px 14px",
  borderRadius: 14,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  transition: "all 0.2s ease"
};

const btnLogoutModern: React.CSSProperties = {
  background: "linear-gradient(135deg,#ff4d4d,#d90429)",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
  transition: "all 0.2s ease"
};
const btnAskModern: React.CSSProperties = {
  marginTop: 18,
  background: "#ffffff",
  color: "#5b3df5",
  padding: "12px 16px",
  borderRadius: 14,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  transition: "all 0.2s ease"
};

const closeNotifBtn: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 12,
  border: "none",
  background: "none",
  fontSize: 20,
  cursor: "pointer",
  color: "#666",
  fontWeight: "bold"
};

/* ===== PROFILE COVER ===== */

const profileCover: React.CSSProperties = {
  height: 170,
  background: "linear-gradient(135deg,#5b3df5,#7c4dff)",
  borderRadius: "18px 18px 0 0",
  margin: "-22px -22px 10px -22px",
  position: "relative",
  touchAction: "none"
};

/* ===== STATS ===== */

const statsRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 18,
  marginTop: 10,
  marginBottom: 10,
  fontSize: 14,
  fontWeight: 600
};

const statItem: React.CSSProperties = {
  background: "rgba(255,255,255,0.2)",
  padding: "6px 12px",
  borderRadius: 10,
  backdropFilter: "blur(4px)"
};

const coverButton: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "rgba(0,0,0,0.5)",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 14
};

const bioText: React.CSSProperties = {
  fontSize: 14,
  color: "#002347",
  marginTop: 10,
  marginBottom: 12,
  padding: "10px 14px",
  lineHeight: 1.5,
  background: "rgba(255,255,255,0.06)",
  borderRadius: 12,
  maxWidth: 420,
  marginLeft: "auto",
  marginRight: "auto"
};
const btnEditBio: React.CSSProperties = {
  marginTop: 8,
  background: "rgba(255,255,255,0.15)",
  border: "2px solid rgba(255,255,255,0.4)",
  padding: "8px 12px",
  borderRadius: 12,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600
};
const bioInput: React.CSSProperties = {
  width: "100%",
  minHeight: 70,
  borderRadius: 12,
  border: "none",
  padding: 10,
  resize: "none",
  outline: "none",
  fontSize: 14
};
const bioControls: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 6
};
const btnSaveBio: React.CSSProperties = {
  background: "#22c55e",
  border: "none",
  color: "white",
  padding: "6px 10px",
  borderRadius: 8,
  cursor: "pointer"
};
const btnCancelBio: React.CSSProperties = {
  background: "#ef4444",
  border: "none",
  color: "white",
  padding: "6px 10px",
  borderRadius: 8,
  cursor: "pointer"
};
