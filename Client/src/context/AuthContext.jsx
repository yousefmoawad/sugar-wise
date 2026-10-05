import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext();

const getApiOrigin = () => {
  const baseUrl =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    '';

  return baseUrl.replace(/\/api\/?$/, '');
};

const normalizeLinkedId = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value._id || value.id || fallback;
  return fallback;
};

const normalizeSessionUser = (nextUser, previousUser = null) => {
  if (!nextUser) return nextUser;
  return {
    ...nextUser,
    patient: normalizeLinkedId(nextUser.patient, previousUser?.patient || null),
    doctor: normalizeLinkedId(nextUser.doctor, previousUser?.doctor || null),
    admin: normalizeLinkedId(nextUser.admin, previousUser?.admin || null),
    superAdmin: normalizeLinkedId(nextUser.superAdmin, previousUser?.superAdmin || null),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const rehydrateFromStorage = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(normalizeSessionUser(JSON.parse(storedUser)));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    rehydrateFromStorage();
    setLoading(false);
  }, [rehydrateFromStorage]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const ping = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        await fetch(`${getApiOrigin()}/api/presence/ping`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch {
        // ignore
      }
    };

    ping();
    const id = setInterval(ping, 30000);

    const onFocus = () => ping();
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated]);

  const login = async (email, password) => {
    try {
      const response = await userAPI.login({ email, password });
      const { data } = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(normalizeSessionUser(data.user));
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await userAPI.register(userData);
      const { data } = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(normalizeSessionUser(data.user));
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { success: false, message: errorMessage };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        return { success: false, message: 'User ID is missing. Please re-login.' };
      }

      let response;
      try {
        response = await userAPI.updateUser(userId, userData);
      } catch (primaryError) {
        const token = localStorage.getItem('token');
        const fallbackResponse = await fetch(`${getApiOrigin()}/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(userData),
        });

        if (!fallbackResponse.ok) {
          const fallbackBody = await fallbackResponse.json().catch(() => ({}));
          const fallbackError = new Error(
            fallbackBody.message ||
              fallbackBody.error ||
              primaryError.response?.data?.message ||
              primaryError.message ||
              'Update failed'
          );
          fallbackError.response = { data: fallbackBody };
          throw fallbackError;
        }

        const fallbackBody = await fallbackResponse.json();
        response = { data: fallbackBody };
      }

      const updatedUser = normalizeSessionUser(response.data.data || response.data, user);

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      return { success: false, message: errorMessage };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        return { success: false, message: 'User session expired.' };
      }

      const response = await userAPI.changePassword(userId, { oldPassword, newPassword });
      return { success: true, message: response.data.message || 'Password updated successfully' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      return { success: false, message: errorMessage };
    }
  };

  const deleteAccount = async (confirmationPassword) => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        return { success: false, message: 'User ID is missing.' };
      }

      await userAPI.deleteUser(userId, { password: confirmationPassword });

      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i += 1) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Account deletion failed';
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await userAPI.logout();
    } catch (error) {
      // Best effort logout; continue clearing local session.
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        updateProfile,
        changePassword,
        deleteAccount,
        logout,
        rehydrateFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
