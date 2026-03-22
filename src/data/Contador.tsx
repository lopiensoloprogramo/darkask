import { db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const Contador = async () => {
  const q = query(
    collection(db, "questions"),
    where("isAuto", "==", true)
  );

  const snap = await getDocs(q);
  return snap.size;
};

export default Contador