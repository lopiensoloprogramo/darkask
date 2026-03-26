
export interface Question {
    id: string;
    question: string;
    answered: boolean;
    answeredAt?:any;
    timestamp?: any;   // ⭐ opcional
    answer?: string;
    ownerId: string;
    likesCount: number;
    score?: number;
    likedBy: string[];
    ownerUsername?: string;
    isAuto?: boolean;
  type?: "text" | "options";

  options?: {
    text: string;
    votes: number;
  }[];
  }
  