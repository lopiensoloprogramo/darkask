import { QRCodeCanvas } from "qrcode.react";
import type { Question } from "../types/QuestionsInterfaz";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
}

export default function ShareModal({ isOpen, onClose, question }: ShareModalProps) {
  // ✅ Protección si no hay pregunta o modal está cerrado
  if (!isOpen || !question) return null;

  // ✅ URL del perfil
  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/${question.ownerId}`
    : "";

  // ✅ Descargar imagen
  const downloadImage = () => {
    const element = document.getElementById("share-image");
    if (!element) return;

    import("html-to-image").then(({ toPng }) => {
      toPng(element).then(dataUrl => {
        const link = document.createElement("a");
        link.download = "respuesta.png";
        link.href = dataUrl;
        link.click();
      });
    });
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ textAlign: "center" }}>COMPARTELO EN TUS REDES ✅</h2>

        {/* AREA EXPORTABLE */}
        <div id="share-image" style={card}>
          <h4>Pregunta:</h4>
          <p>{question.question}</p>

          <h4>Respuesta:</h4>
          <p>{question.answer}</p>

          <QRCodeCanvas value={profileUrl} size={140} />

          <p style={{ fontSize: 11 }}>Escanea para ver el perfil</p>
        </div>

        <div style={{ marginTop: 15, display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose} style={closeBtn}>Cerrar</button>

          <button onClick={downloadImage} style={downloadBtn}>
            Descargar imagen
          </button>
        </div>

      </div>
    </div>
  );
}

// ✅ ESTILOS
const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  maxWidth: 400,
  width: "90%",
  textAlign: "center" as const,
};

const card = {
  background: "#f8f9fa",
  padding: 15,
  borderRadius: 10,
  marginTop: 10,
};

const closeBtn = {
  background: "#6c757d",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer",
};

const downloadBtn = {
  background: "#198754",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer",
};
