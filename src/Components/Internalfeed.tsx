import { useEffect, useState } from "react";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

interface Question {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerPhoto?: string;
  question: string;
  answer: string;
  timestamp: any;
  likes?: number;
}

export default function Internalfeed() {

  const [questions, setQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {

      const q = query(
        collection(db, "questions"),
        where("answered", "==", true),
        orderBy("timestamp", "desc")
      );

      const snap = await getDocs(q);

      setQuestions(
        snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any)
        }))
      );
    };

    fetchQuestions();
  }, []);

  return (
    <div style={{maxWidth:900, margin:"auto", padding:20}}>

      <h2>🔥 Respuestas recientes</h2>

      {questions.map(q => (

        <div key={q.id} style={{
          background:"#fff",
          padding:18,
          borderRadius:12,
          marginBottom:14,
          boxShadow:"0 5px 15px rgba(0,0,0,0.08)"
        }}>

          {/* usuario */}
          <div
            style={{
              display:"flex",
              alignItems:"center",
              gap:10,
              marginBottom:10,
              cursor:"pointer"
            }}
            onClick={() => navigate(`/profile/${q.ownerId}`)}
          >

            <img
              src={q.ownerPhoto || "/default-avatar.png"}
              style={{
                width:36,
                height:36,
                borderRadius:"50%"
              }}
            />

            <strong>{q.ownerName}</strong>

          </div>

          <p style={{fontWeight:600}}>
            {q.question}
          </p>

          <div
            style={{
              background:"#ecfdf5",
              padding:12,
              borderRadius:10,
              marginTop:8
            }}
          >
            {q.answer}
          </div>

        </div>

      ))}

    </div>
  );
}