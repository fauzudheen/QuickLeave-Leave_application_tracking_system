import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

const UserReverseProtectedRoutes = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return !isAuthenticated ? <Outlet /> : null;
}; 

export default UserReverseProtectedRoutes;
