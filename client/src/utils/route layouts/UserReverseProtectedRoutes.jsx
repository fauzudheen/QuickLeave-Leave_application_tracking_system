import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

const UserReverseProtectedRoutes = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Checking isAuthenticated in UserReverseProtectedRoutes:", isAuthenticated);
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to /');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return !isAuthenticated ? <Outlet /> : null;
}; 

export default UserReverseProtectedRoutes;
