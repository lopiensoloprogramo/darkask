import { useRef } from "react";
import html2canvas from "html2canvas";

export default function Share({ question, answer }: any) {
  const cardRef = useRef<HTMLDivElement>(null);

  const generateImage = async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, {
      scale: 3,     // imagen HD
      backgroundColor: null,
    });

    const img = canvas.toDataURL("image/png");

    // descargar imagen
    const link = document.createElement("a");
    link.download = "respuesta.png";
    link.href = img;
    link.click();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Compartir respuesta</h1>

      {/* ✔ Tarjeta visual */}
      <div
        ref={cardRef}
        id="card"
        style={{
          width: 300,
          padding: 20,
          margin: "20px auto",
          borderRadius: 20,
          background: "linear-gradient(135deg, #ff9966, #ff5e62)",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 15 }}>{question}</h2>
        <p style={{ fontSize: 18 }}>{answer}</p>

        <small style={{ opacity: 0.7 }}>by MiApp</small>
      </div>

      {/* ✔ BOTÓN PARA GENERAR IMAGEN */}
      <button
        onClick={generateImage}
        style={{
          display: "block",
          margin: "0 auto",
          padding: "10px 20px",
          background: "#333",
          color: "white",
          borderRadius: 10,
          border: "none",
        }}
      >
        Descargar Imagen
      </button>
    </div>
  );
}
