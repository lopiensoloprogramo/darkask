import type { Question } from "../types/QuestionsInterfaz";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  username?: string;
}

export default function ShareModal({ isOpen, onClose, question,username }: ShareModalProps) {
  if (!isOpen || !question) return null;

const profileUrl =
  typeof window !== "undefined" && username
    ? `${window.location.origin}/u/${username}`
    : "";

const downloadImage = async () => {
  const element = document.getElementById("share-image");
  if (!element) return;

  // 🔥 esperar que imágenes carguen
  const images = element.getElementsByTagName("img");
  await Promise.all(
    Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => {
        img.onload = res;
        img.onerror = res;
      });
    })
  );

  const { toPng } = await import("html-to-image");

  const dataUrl = await toPng(element, { cacheBust: true });

  const link = document.createElement("a");
  link.download = "darkask-respuesta.png";
  link.href = dataUrl;
  link.click();
};

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      alert("Enlace copiado 🔥");
    } catch {
      alert("No se pudo copiar el enlace");
    }
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
            {question.imageUrl && (
                <img
                  src={question.imageUrl}
                  style={shareImageStyle}
                />
              )}
            
          </div>

          {/* CTA Viral */}
          <div style={cta}>
            👀 Hazme una pregunta anónima
          </div>
        </div>

        <div style={buttonContainer}>
          <button onClick={onClose} style={closeBtn}>
            Cerrar
          </button>

          <button onClick={copyLink} style={copyBtn}>
            Copiar enlace
          </button>

          <button onClick={downloadImage} style={downloadBtn}>
            Descargar imagen
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
  borderRadius: 18,
  maxWidth: 420,
  width: "92%",
  textAlign: "center" as const,
  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
   maxHeight: 500,
   overflow: "hidden",
};

const title = {
  color: "white",
  marginBottom: 15,
};

const card = {
  background: "linear-gradient(135deg, #141e30, #243b55)",
  padding: 20, // antes 30
  borderRadius: 18,
  color: "white",
  textAlign: "center" as const,
  boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
};

const brand = {
  fontSize: 13,
  opacity: 0.6,
  marginBottom: 20,
};

const questionContainer = {
  marginBottom: 15,
};

const questionLabel = {
  fontSize: 14,
  opacity: 0.8,
  marginBottom: 6,
};

const questionText = {
  fontSize: 17, // antes 20
  fontWeight: 700,
  lineHeight: 1.3,
};

const answerContainer = {
 
  padding: 14,
  borderRadius: 14,
  marginTop: 10,  
};

const answerLabel = {
  fontSize: 14,
  opacity: 0.8,
  marginBottom: 6,
};

const answerText = {
  fontSize: 15, // antes 18
  fontWeight: 600,
};

const cta = {
  marginTop: 15,
  fontSize: 14,
  fontWeight: 700,
  color: "#00ffcc",
};

const buttonContainer = {
  marginTop: 20,
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
};

const closeBtn = {
  background: "#444",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
};

const copyBtn = {
  background: "#6f42c1",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
};

const downloadBtn = {
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
};
const shareImageStyle: React.CSSProperties = {
  width: "100%",
  maxHeight: 200,
  objectFit: "contain",
  borderRadius: 12,
  marginTop: 10,
  boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
};