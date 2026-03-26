import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  authUser: any;
  answeredQuestions: any[];
}

export default function EditProfileModal({
  isOpen,
  onClose,
  userData,
  authUser,
  answeredQuestions
}: Props) {
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedFact, setSelectedFact] = useState("");

  // 🔥 cargar datos actuales
  useEffect(() => {
    if (isOpen && userData) {
      setSelectedMood(userData.mood || "");
      setSelectedQuestion(userData.fixedQuestion || "");
      setSelectedFact(userData.funFact || "");
    }
  }, [isOpen, userData]);

  const saveProfileExtras = async () => {
    if (!authUser) return;

    try {
      const userRef = doc(db, "users", authUser.uid);

      await updateDoc(userRef, {
        mood: selectedMood,
        fixedQuestion: selectedQuestion,
        funFact: selectedFact
      });

      onClose();
    } catch (err) {
      console.error("Error guardando perfil:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        
        <h2 style={{ marginBottom: 12 }}>⚙️ Editar perfil</h2>

        {/* MOOD */}
        <label style={label}>Estado (Mood)</label>
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          style={input}
        >
          <option value="">Selecciona tu mood</option>
          <option>🔥 Motivado</option>
          <option>😴 Cansado</option>
          <option>💸 Sin dinero</option>
          <option>🧠 Pensando mucho</option>
          <option>🎮 Viciando</option>
        </select>

        {/* PREGUNTA FIJA */}
        <label style={label}>Pregunta destacada</label>
        <select
          value={selectedQuestion}
          onChange={(e) => setSelectedQuestion(e.target.value)}
          style={input}
        >
          <option value="">Selecciona una pregunta</option>

          {answeredQuestions.map((q) => (
            <option key={q.id} value={q.question}>
              {q.question}
            </option>
          ))}
        </select>

        {/* DATO CURIOSO */}
        <label style={label}>Dato curioso</label>
        <textarea
          value={selectedFact}
          onChange={(e) => setSelectedFact(e.target.value)}
          maxLength={120}
          placeholder="Algo interesante sobre ti..."
          style={{ ...input, minHeight: 80, resize: "none" }}
        />

        <div style={actions}>
          <button style={btnCancel} onClick={onClose}>
            Cancelar
          </button>

          <button style={btnSave} onClick={saveProfileExtras}>
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const modal: React.CSSProperties = {
  width: "90%",
  maxWidth: 400,
  background: "white",
  padding: 20,
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10
};

const label: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 14
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
  fontSize: 14
};

const actions: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10
};

const btnSave: React.CSSProperties = {
  background: "#22c55e",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600
};

const btnCancel: React.CSSProperties = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600
};