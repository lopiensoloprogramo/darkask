import { useState } from "react";
import type { Question } from "../types/QuestionsInterfaz";
import { db } from "../services/firebase";
import { serverTimestamp,increment,doc,runTransaction} from "firebase/firestore";

interface AnswerModalProps {
  question: Question;
  onAnswered: (updatedQuestion: Question) => void;
  onClose: () => void;
}

export default function AnswerModal({
  question,
  onAnswered,
  onClose
}: AnswerModalProps) {

  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);

const handleSubmit = async () => {
  if (!answer.trim()) return alert("Escribe una respuesta");
  setSending(true);

  try {
    const questionRef = doc(db, "questions", question.id);
    const userRef = doc(db, "users", question.ownerId);

    await runTransaction(db, async (transaction) => {
      const qSnap = await transaction.get(questionRef);

      if (!qSnap.exists()) return;

      const data = qSnap.data();

      // 🔥 Evita duplicar puntos
      if (data.answered) {
        throw new Error("Esta pregunta ya fue respondida");
      }

      // 🔥 Guardar respuesta
      transaction.update(questionRef, {
        answer: answer,
        answered: true,
        answeredAt: serverTimestamp(),
      });

      // 🔥 SUMAR +5 AL USUARIO
      transaction.update(userRef, {
        score: increment(5),
      });
    });

    const updatedQuestion: Question = {
      ...question,
      answer,
      answered: true,
    };

    console.log("✅ RESPUESTA GUARDADA → ABRIENDO SHARE MODAL");

    onAnswered(updatedQuestion);
    onClose();

  } catch (error: any) {
    console.error("🔥 ERROR GUARDANDO RESPUESTA:", error);
    alert(error.message || "No se pudo guardar la respuesta");
  } finally {
    setSending(false);
  }
};

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
      
        <p style={tituloPregunta}>{question.question}</p>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escribe tu respuesta..."
          style={textareaStyle}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={cancelBtn}>
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={sending}
            style={sendBtn}
          >
            {sending ? "Guardando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ESTILOS */

const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const boxStyle = {
  background: "#fff",
  padding: 25,
  borderRadius: 12,
  width: "90%",
  maxWidth: 420,
  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
};

const textareaStyle = {
  width: "100%",
  height: 100,
  padding: 10,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 14,
};

const cancelBtn = {
  padding: "8px 14px",
  border: "none",
  background: "#ddd",
  borderRadius: 6,
  cursor: "pointer",
};

const sendBtn = {
  padding: "8px 14px",
  border: "none",
  background: "#007bff",
  color: "white",
  borderRadius: 6,
  cursor: "pointer",
};
const tituloPregunta={

    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
}