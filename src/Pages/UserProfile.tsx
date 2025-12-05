import { useParams } from "react-router-dom";
import { useState } from "react";
import { db } from "../services/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function UserProfile() {
  const { username } = useParams();
  const [text, setText] = useState("");

  const send = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "questions"), {
      text,
      userId: username,
      createdAt: new Date(),
      answered: false,
    });

    setText("");
    alert("Pregunta enviada!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Preguntas para {username}</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe tu pregunta anónima..."
        style={{ width: "100%", height: 100, marginBottom: 10 }}
      />

      <button onClick={send}>Enviar</button>
    </div>
  );
}
