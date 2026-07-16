import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/PageLoader";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
