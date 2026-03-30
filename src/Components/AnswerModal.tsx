import { useState } from "react";
import type { Question } from "../types/QuestionsInterfaz";
import { db } from "../services/firebase";
import {
  serverTimestamp,
  increment,
  doc,
  runTransaction
} from "firebase/firestore";
import { auth } from "../services/firebase";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import imageCompression from "browser-image-compression";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const storage = getStorage();

  // 📸 seleccionar imagen
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validar tipo
    if (!file.type.startsWith("image/")) {
      return alert("Solo se permiten imágenes");
    }

    try {
      // 🔥 compresión
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 720,
        useWebWorker: true
      });

      // 🚫 validación final (extra seguridad)
      if (compressed.size > 500 * 1024) {
        return alert("La imagen es muy pesada (máx 500KB)");
      }

      setImageFile(compressed);
      setPreview(URL.createObjectURL(compressed));

    } catch (error) {
      console.error("Error comprimiendo imagen", error);
      alert("Error al procesar la imagen");
    }
  };

  // ❌ quitar imagen
  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!answer.trim() && !imageFile) {
      return alert("Escribe algo o sube una imagen");
    }

    setSending(true);

    try {
      let imageUrl: string | null = null;

      // 🔥 subir imagen si existe
        if (imageFile) {

          const user = auth.currentUser;

          if (!user) {
            alert("Debes iniciar sesión");
            return;
          }

          // 🔥 FORZAR TOKEN ACTUALIZADO
          await user.getIdToken(true);

                const fileRef = ref(
          storage,
          `answers/${user.uid}/${Date.now()}.jpg`
        );

          await uploadBytes(fileRef, imageFile);
          imageUrl = await getDownloadURL(fileRef);
        }

      const questionRef = doc(db, "questions", question.id);
      const userRef = doc(db, "users", question.ownerId);

      await runTransaction(db, async (transaction) => {
        const qSnap = await transaction.get(questionRef);

        if (!qSnap.exists()) return;

        const data = qSnap.data();

        if (data.answered) {
          throw new Error("Esta pregunta ya fue respondida");
        }

        transaction.update(questionRef, {
          answer: answer || "",
          imageUrl: imageUrl,
          answered: true,
          answeredAt: serverTimestamp(),
        });

        transaction.update(userRef, {
          score: increment(5),
        });
      });

      const updatedQuestion: Question = {
        ...question,
        answer,
        answered: true,
      };

      onAnswered(updatedQuestion);
      onClose();

    } catch (error: any) {
      console.error("🔥 ERROR:", error);
      alert(error.message || "Error al guardar");
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

        {/* 📸 INPUT */}
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleImageChange}
          style={{ marginTop: 10 }}
        />

        {/* 👁️ PREVIEW */}
        {preview && (
          <div style={{ position: "relative", marginTop: 10 }}>
            <img
              src={preview}
              alt="preview"
              style={{
                width: "100%",
                borderRadius: 8,
                maxHeight: 200,
                objectFit: "cover"
              }}
            />

            {/* ❌ botón quitar */}
            <button
              onClick={removeImage}
              style={removeBtn}
            >
              ✕
            </button>
          </div>
        )}

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

const removeBtn = {
  position: "absolute" as const,
  top: 5,
  right: 5,
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 24,
  height: 24,
  cursor: "pointer",
};

const tituloPregunta = {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 8,
  color: "#222",
};