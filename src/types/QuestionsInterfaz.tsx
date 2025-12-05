import { useState } from "react";
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
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);