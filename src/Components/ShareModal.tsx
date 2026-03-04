import { QRCodeCanvas } from "qrcode.react";
import type { Question } from "../types/QuestionsInterfaz";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
}

export default function ShareModal({ isOpen, onClose, question }: ShareModalProps) {
  if (!isOpen || !question) return null;

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/${question.ownerId}`
      : "";

  const downloadImage = () => {
    const element = document.getElementById("share-image");
    if (!element) return;

    import("html-to-image").then(({ toPng }) => {
      toPng(element, { cacheBust: true }).then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "darkask-respuesta.png";
        link.href = dataUrl;
        link.click();
      });
    });
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={title}>🔥 Comparte en tus redes</h2>

        {/* AREA EXPORTABLE */}
        <div id="share-image" style={card}>
          {/* Marca */}
          <div style={brand}>darkask.vercel.app</div>

          {/* Pregunta */}
          <div style={questionContainer}>
            <p style={questionLabel}>💬 Me preguntaron:</p>
            <p style={questionText}>"{question.question}"</p>
          </div>

          {/* Respuesta */}
          <div style={answerContainer}>
            <p style={answerLabel}>Mi respuesta:</p>
            <p style={answerText}>{question.answer}</p>
          </div>

          {/* QR */}
          <div style={{ marginTop: 20 }}>
            <QRCodeCanvas value={profileUrl} size={120} bgColor="#ffffff" />
            <p style={qrText}>Escanea y hazme una pregunta anónima 👀</p>
          </div>

          {/* Gatillo psicológico */}
          <div style={cta}>
            🔥 ¿Te atreves a preguntarme algo?
          </div>
        </div>

        <div style={buttonContainer}>
          <button onClick={onClose} style={closeBtn}>
            Cerrar
          </button>

          <button onClick={downloadImage} style={downloadBtn}>
            Descargar imagen
          </button>
          <button onClick={() => navigator.clipboard.writeText(profileUrl)}>
            Copiar enlace
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================= */
/* ESTILOS */
/* ========================= */

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  background: "#111",
  padding: 25,
  borderRadius: 16,
  maxWidth: 420,
  width: "92%",
  textAlign: "center" as const,
  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
};

const title = {
  color: "white",
  marginBottom: 15,
};

const card = {
  background: "linear-gradient(135deg, #141e30, #243b55)",
  padding: 25,
  borderRadius: 20,
  marginTop: 10,
  color: "white",
  textAlign: "center" as const,
  boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
};

const brand = {
  fontSize: 12,
  opacity: 0.6,
  marginBottom: 15,
};

const questionContainer = {
  marginBottom: 20,
};

const questionLabel = {
  fontSize: 13,
  opacity: 0.8,
  marginBottom: 5,
};

const questionText = {
  fontSize: 18,
  fontWeight: 600,
  lineHeight: 1.4,
};

const answerContainer = {
  background: "rgba(255,255,255,0.08)",
  padding: 15,
  borderRadius: 15,
  marginTop: 10,
};

const answerLabel = {
  fontSize: 13,
  opacity: 0.8,
  marginBottom: 5,
};

const answerText = {
  fontSize: 17,
  fontWeight: 500,
};

const qrText = {
  fontSize: 12,
  marginTop: 8,
  opacity: 0.8,
};

const cta = {
  marginTop: 20,
  fontSize: 14,
  fontWeight: 600,
  color: "#00ffcc",
};

const buttonContainer = {
  marginTop: 20,
  display: "flex",
  justifyContent: "space-between",
};

const closeBtn = {
  background: "#444",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
};

const downloadBtn = {
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
};