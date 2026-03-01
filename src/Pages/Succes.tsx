import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnim from "../assets/check.json";

export default function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate("/"); // volver a Inicio
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      background: "white"
    }}>
      <Lottie animationData={successAnim} style={{ width: 200 }} />
      <h1 style={{ marginTop: 20 }}>¡Pregunta enviada!</h1>
    </div>
  );
}
