import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

export function useStudentAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axiosInstance.get('/api/student/profile');
      if (response.status === 200) {
        setIsLoggedIn(true);
        setStudent(response.data);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/api/student/login', {
        username,
        password
      });
      if (response.status === 200) {
        await checkAuth();
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/student/logout');
      setIsLoggedIn(false);
      setStudent(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    isLoggedIn,
    student,
    loading,
    login,
    logout,
    checkAuth
  };
}

