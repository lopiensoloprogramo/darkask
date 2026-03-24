import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../services/firebase";

const Registroglobalvisitas = async () => {
  const today = new Date().toISOString().split("T")[0];

  const ref = doc(db, "stats", today);

  await setDoc(
    ref,
    { visits: increment(1) },
    { merge: true }
  );
};

export default Registroglobalvisitas