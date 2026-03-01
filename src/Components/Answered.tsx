import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export default function QuestionsList() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = collection(db, "questions");

        const q = query(
          questionsRef,
          where("answered", "==", true),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);

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

  // LOADING
  if (loading) return <p>Cargando preguntas...</p>;

  // SIN RESULTADOS
  if (!loading && questions.length === 0)
    return <p>No hay preguntas respondidas todavía.</p>;

  // LISTA
  return (
    <ul>
      {questions.map((q) => (
        <li key={q.id} className="question-card">
          <div className="question-text">{q.question}</div>
          <div className="respuesta-text">{q.answer}</div>
          <div className="question-date">
            {String(q.timestamp?.toDate?.() || q.timestamp)}
          </div>
        </li>
      ))}
    </ul>
  );
}
