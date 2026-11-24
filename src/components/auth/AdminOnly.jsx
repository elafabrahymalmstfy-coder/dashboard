import { useAuth } from '../../context/AuthContext';

export default function AdminOnly({ children, fallback = null }) {
  const { isAdmin, loading } = useAuth();

  if (loading || !isAdmin) {
    return fallback;
  }

  return children;
}
