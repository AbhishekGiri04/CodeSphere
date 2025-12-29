import { useAuth } from '@/contexts/AuthContext';
import GoogleAuth from '@/components/GoogleAuth';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen onComplete={() => {}} />;
  }

  if (!currentUser) {
    return <GoogleAuth />;
  }

  return <>{children}</>;
}