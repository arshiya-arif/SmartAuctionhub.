import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userJson = localStorage.getItem('user');
        if (!userJson) {
          setIsAuthenticated(false);
          return;
        }

        const user = JSON.parse(userJson);
        setIsAuthenticated(!!user.token && user.role === 'admin');
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkAuth();

    // Add event listener for storage changes
    const handleStorageChange = () => {
      console.log('Storage event detected - checking auth');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin/dashboard" replace />;
};






export default AdminProtectedRoute;