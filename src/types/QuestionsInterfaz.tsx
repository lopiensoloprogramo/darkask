
export interface Question {
    id: string;
    question: string;
    answered: boolean;
    timestamp?: any;   // ⭐ opcional
    answer?: string;
    ownerId: string;
    likes: number;
    score?: number;
    likedBy: string[];
    
  }
  