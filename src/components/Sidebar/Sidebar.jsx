
// src/components/Sidebar/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  ShoppingCart,
  DollarSign,
  Book,
  BarChart3,
  Settings,
  BookOpen,
} from 'lucide-react';
import { FaChevronDown } from 'react-icons/fa';
import './Sidebar.css';

const menu = [
  { label: 'Inicio', path: '/dashboard/inicio', icon: <Home size={18} /> },
  {
    label: 'Gestión de Inventario',
    icon: <Package size={18} />,
    sub: [
      { label: 'Inventario General', path: '/dashboard/inventario/general' },
      { label: 'Inventario en Proceso', path: '/dashboard/inventario/proceso' },
      { label: 'Inventario Materia Prima', path: '/dashboard/inventario/materia-prima' },
    ],
  },
  {
    label: 'Compras',
    icon: <ShoppingCart size={18} />,
    sub: [
      { label: 'Proveedores y Artículos', path: '/dashboard/compras/proveedores' },
      { label: 'Cuentas por Pagar', path: '/dashboard/compras/cuentas-por-pagar' },
    ],
  },
  {
    label: 'Entrada de Ventas',
    icon: <DollarSign size={18} />,
    sub: [
      { label: 'Gestión Clientes', path: '/dashboard/ventas/registro-clientes' },
      { label: 'Gestión Ventas', path: '/dashboard/ventas/registro-ventas' },
      { label: 'Gestión Facturas', path: '/dashboard/ventas/registro-factura' },
    ],
  },
  {
    label: 'Gestión de Libros',
    icon: <Book size={18} />,
    sub: [
      { label: 'Libros', path: '/dashboard/libros' },
      { label: 'Autores', path: '/dashboard/libros/autores' },
      { label: 'Categorías y Temas', path: '/dashboard/libros/categorias-temas' },
      { label: 'Control y Búsqueda', path: '/dashboard/libros/control-busqueda' },
    ],
  },
  {
    label: 'Administración',
    icon: <Settings size={18} />,
    sub: [
      { label: 'Gestión de Usuarios', path: '/dashboard/administracion/usuarios' },
      { label: 'Bitácora', path: '/dashboard/administracion/bitacora' },
    ],
  },
  {
    label: 'Informes',
    icon: <BarChart3 size={18} />,
    sub: [
      { label: 'Reporte de Compras', path: '/dashboard/informes/compras' },
      { label: 'Reporte de Ventas', path: '/dashboard/informes/ventas' },
    ],
  },
  {
    label: 'Parámetros',
    icon: <Settings size={18} />,
    sub: [
      { label: 'General', path: '/dashboard/parametros/general' },
      { label: 'Usuarios y Roles', path: '/dashboard/parametros/usuarios-roles' },
      { label: 'Respaldo', path: '/dashboard/parametros/respaldo' },
    ],
  },
];

export default function Sidebar({ collapsed = false }) {
  const [openGroups, setOpenGroups] = useState({});
  const navigate = useNavigate();

  const toggleGroup = (label) =>
    setOpenGroups((prev) => {
      const newState = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = key === label ? !prev[key] : false;
      });
      return { ...newState, [label]: !prev[label] };
    });

  const handleInicioClick = () => {
    navigate('/dashboard/inicio');
    setTimeout(() => {
      const graficos = document.getElementById('dashboard-graficos');
      if (graficos) graficos.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header - Solo visible cuando no está colapsado */}
      {!collapsed && (
        <div className="sidebar-header">
          <img
            src="/src/assets/logo_editorial-removebg-preview.png"
            alt="Logo"
            className="sidebar-logo-img"
          />
          <div className="sidebar-brand-text">
            <BookOpen size={18} />
            <span>Editorial Guaymuras</span>
          </div>
        </div>
      )}

      <div className="sidebar-nav">
        {menu.map((item) =>
          !item.sub ? (
            <button
              key={item.label}
              className="sidebar-link"
              onClick={item.label === 'Inicio' ? handleInicioClick : () => navigate(item.path)}
              title={collapsed ? item.label : ''} // Tooltip cuando está colapsado
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ) : (
            <div key={item.label} className="sidebar-group">
              <button
                className="sidebar-parent"
                onClick={() => toggleGroup(item.label)}
                aria-expanded={!!openGroups[item.label]}
                title={collapsed ? item.label : ''} // Tooltip cuando está colapsado
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    <FaChevronDown
                      className={'sidebar-arrow ' + (openGroups[item.label] ? 'open' : '')}
                    />
                  </>
                )}
              </button>

              {/* Submenús - Solo visibles cuando no está colapsado */}
              {!collapsed && (
                <div
                  className="sidebar-sub"
                  style={{ maxHeight: openGroups[item.label] ? 200 : 0 }}
                >
                  {item.sub.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) => (isActive ? 'active' : '')}
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </nav>
  );
}