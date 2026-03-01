import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  isLoading: boolean;
  userId: string | null;
  children: ReactNode;
}

export default function ProtectedRoute({ isLoading, userId, children }: ProtectedRouteProps) {
  if (isLoading) return <p>Cargando sesión...</p>;
  if (!userId) return <Navigate to="/" replace />;
  return <>{children}</>;
}
