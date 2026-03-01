import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Questions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questions"));

        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });

        setQuestions(list);
      } catch (error) {
        console.error("Error leyendo preguntas:", error);
      }

      setLoading(false);
    };

    fetchQuestions();
  }, []);

  if (loading) return <p>Cargando preguntas...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Preguntas recibidas</h1>

      {questions.length === 0 && <p>No hay preguntas todavía.</p>}

      <ul>
        {questions.map((q) => (
          <li key={q.id} style={{ marginBottom: 10 }}>
            <strong>{q.text}</strong>
            <br />
            <small>{String(q.createdAt?.toDate?.() || q.createdAt)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
