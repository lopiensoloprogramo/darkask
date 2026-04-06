import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const sendLikeNotification = async ({
  toUserId,
  fromUserId,
  questionId
}: {
  toUserId: string;
  fromUserId: string;
  questionId: string;
}) => {
  try {
    // evitar auto-like
    if (toUserId === fromUserId) return;

    await addDoc(collection(db, "notifications"), {
      ownerId: toUserId,
      fromUserId,
      type: "like",
      questionId,
      createdAt: serverTimestamp(),
      read: false
    });

  } catch (error) {
    console.error("Error creando notificación:", error);
  }
};