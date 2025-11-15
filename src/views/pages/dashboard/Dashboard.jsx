
// src/views/pages/dashboard/Dashboard.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from '../../../components/Sidebar/Sidebar.jsx';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarHidden(!sidebarHidden);
  };

  return (
    <div className="dashboard-overlay">
      {/* Sidebar - Solo para PC, se oculta completamente */}
      <aside className={`dashboard-sidebar ${sidebarHidden ? 'hidden' : ''}`}>
        <Sidebar />
      </aside>

      {/* Contenido Principal */}
      <main className={`dashboard-main ${sidebarHidden ? 'sidebar-hidden' : ''}`}>
        <header className="dashboard-topbar">
          <div className="topbar-left">
            {/* Botón para ocultar/mostrar sidebar - Solo en PC */}
            <button 
              className="sidebar-control-btn" 
              onClick={toggleSidebar}
              title={sidebarHidden ? "Mostrar menú" : "Ocultar menú"}
            >
              {sidebarHidden ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
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
              <User size={16} />
              <span>Perfil</span>
            </button>
            <button className="topbar-btn" onClick={() => setShowModal(true)}>
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Contenido Centrado */}
        <section className="dashboard-content">
          <div className="dashboard-page-content">
            <Outlet />
          </div>
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