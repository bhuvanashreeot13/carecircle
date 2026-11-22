import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function ProtectedRoute({ children, requireCircle = true }) {
  const { user, membership, loading } = useAuth();

  if (loading) {
    return <p className="p-6 text-slate-600">Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireCircle && !membership) {
    return <Navigate to="/setup" replace />;
  }
  return children;
}