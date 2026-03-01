import { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Lottie from "lottie-react";
import checkAnim from "../assets/check.json"; // <-- TU ANIMACIÓN REAL

interface QuestionFormProps {
  recipientUid: string;
  onClose: () => void;
}

export default function Ask({ recipientUid, onClose }: QuestionFormProps) {
  const auth = getAuth();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false); // controla animación

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return alert("Escribe algo");

    setLoading(true);

    try {
      await addDoc(collection(db, "questions"), {
        question,
        answer: "",
        answered: false,
        timestamp: serverTimestamp(),
        ownerId: recipientUid,
        creatorId: auth.currentUser?.uid || null,
      });

      setSent(true); // mostrar animación

      // cerrar el modal después de 1.5s
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Error creando pregunta:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* ANIMACIÓN */}
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <Lottie animationData={checkAnim} loop={false} style={{ height: 150 }} />
            <p>Pregunta enviada</p>
          </div>
        ) : (
          <>
            <h3>Haz una pregunta anónima</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                style={styles.textarea}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Escribe tu pregunta..."
              />
              <div style={styles.buttons}>
                <button type="button" onClick={onClose} style={styles.cancel}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={styles.send}>
                  {loading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}


const styles: any = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    width: "90%",
    maxWidth: "450px",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    borderRadius: "8px",
    padding: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
    resize: "vertical",
  },
  buttons: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  cancel: {
    background: "#ccc",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  send: {
    background: "#007bff",
    border: "none",
    padding: "8px 15px",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
