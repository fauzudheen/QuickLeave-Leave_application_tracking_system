import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { backendUrl } from '../const';
import axios from 'axios';
import { setUserSignIn, setUserSignOut } from '../redux/authSlice';

const UserProtectedRoutes = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const refreshToken = useSelector(state => state.auth.refreshToken);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const updateToken = useCallback(async () => {
    console.log("updateToken triggered");

    try {
      const response = await axios.post(`${backendUrl}/token/refresh/`, { refresh: refreshToken });
      if (response.status === 200) {
        console.log('Token refreshed successfully:', response.data);
        dispatch(setUserSignIn(response.data));
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      dispatch(setUserSignOut());
      navigate('/signin');
    }
  }, [refreshToken, dispatch, navigate]);

  const verifyToken = async () => {
    try {
      const response = await axios.post(`${backendUrl}/token/verify/`, { token: refreshToken });
      if (response.status === 200) {
        return
      } else {
        console.error('Failed to verify token:', response.data);
        updateToken();
      }
    } catch (error) {
      console.error('Failed to verify token:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      verifyToken();
    } else {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      interval = setInterval(updateToken, 110 * 60 * 1000); // 110 minutes
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated, updateToken]);

  return isAuthenticated ? <Outlet /> : null;
};

export default UserProtectedRoutes;
