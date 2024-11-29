import { useRouter } from 'next/router';
import useAuth from '@/hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  return isAuthenticated ? children : <p> Login Required </p>;
}