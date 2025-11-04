import { useEffect } from 'react';
import { logout } from '../../../hooks/useAuth.js';

export default function Logout() {
  useEffect(() => {
    logout();
    window.location.href = '/';
  }, []);

  return <p>Cerrando sesión…</p>;
}