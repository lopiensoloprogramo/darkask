import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Question } from "../types/QuestionsInterfaz";

function PendingQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(collection(db, "questions"), where("answered", "==", false));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching pending questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div>
      <h2>Pending Questions</h2>
      
    </div>
  );
}

export default PendingQuestions;
