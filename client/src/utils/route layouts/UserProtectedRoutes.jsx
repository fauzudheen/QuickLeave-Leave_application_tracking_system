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
    console.log("Refresh Token:", refreshToken);

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

  useEffect(() => {
    console.log('isAuthenticated check:', isAuthenticated);
    if (isAuthenticated) {
      console.log('User authenticated, updating token.');
      updateToken();
    } else {
      console.log('User not authenticated, navigating to /signin');
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      console.log('Setting up token refresh interval.');
      interval = setInterval(updateToken, 110 * 60 * 1000); // 110 minutes
    }

    return () => {
      if (interval) {
        console.log('Clearing token refresh interval.');
        clearInterval(interval);
      }
    };
  }, [isAuthenticated, updateToken]);

  return isAuthenticated ? <Outlet /> : null;
};

export default UserProtectedRoutes;
