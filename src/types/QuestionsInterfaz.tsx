
export interface Question {
    id: string;
    question: string;
    answered: boolean;
    assweredAt?:any;
    timestamp?: any;   // ⭐ opcional
    answer?: string;
    ownerId: string;
    likes: number;
    score?: number;
    likedBy: string[];
    ownerUsername?: string;
    
  }
  