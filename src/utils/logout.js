// src/utils/logout.js
import axiosInstance from './axiosInstance';
import { toast } from 'react-toastify';

export const handleLogout = async () => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch (e) {
    // Ignorar error
  }
  localStorage.removeItem('session_token');
  localStorage.removeItem('user');
  toast.info('Sesión cerrada correctamente');
  setTimeout(() => window.location.href = '/#/login', 1000);
};