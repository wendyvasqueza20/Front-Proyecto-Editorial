// src/pages/Dashboard/Dashboard.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../../../components/Sidebar/Sidebar.jsx';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, []);

  const handleConfirmLogout = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token && user.id_usuario) {
      try {
        await fetch('http://localhost:5000/api/v1/bitacora/cierre-sesion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_usuario: user.id_usuario,
            accion: 'CIERRE_SESION',
            descripcion: `El usuario ${user.usuario} cerró sesión`,
          }),
        });
      } catch (e) {
        console.warn('No se pudo registrar en bitácora:', e);
      }
    }
    ['token', 'access_token', 'refresh_token', 'user'].forEach((k) => localStorage.removeItem(k));
    toast.success('Sesión cerrada correctamente');
    navigate('/');
  };

  return (
    <div className="dashboard-overlay">
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
          <X />
        </button>
        <Sidebar />
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>
          </div>

          <div className="topbar-center">
            <img
              src="/src/assets/logo_editorial-removebg-preview.png"
              alt="Logo"
              className="logo-img"
            />
            <span className="brand-text">Editorial Guaymuras</span>
          </div>

          <div className="topbar-right">
            <button className="topbar-btn" onClick={() => navigate('/dashboard/perfil')}>
              <User size={18} />
              <span>Perfil</span>
            </button>
            <button className="topbar-btn" onClick={() => setShowModal(true)}>
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Sin fondo oscuro, sin bordes, sin bienvenida */}
        <section className="dashboard-content-clean">
          <Outlet />
        </section>
      </main>

      <ConfirmModal
        show={showModal}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        onConfirm={() => {
          setShowModal(false);
          handleConfirmLogout();
        }}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}