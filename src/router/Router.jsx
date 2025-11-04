// src/router/Router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { isAuthenticated } from '../hooks/useAuth.js';

/* ---------- AUTH ---------- */
import Login from '../views/pages/login/Login.jsx';
import Logout from '../views/pages/logout/Logout.jsx';
import Dashboard from '../views/pages/dashboard/Dashboard.jsx';

/* ---------- VIEWS PRINCIPALES ---------- */
import Inicio from '../views/inicio/Inicio.jsx';
import Perfil from '../views/perfil/Profile.jsx';

/* INVENTARIO */
import InventarioGeneral from '../views/Inventario/InventarioGeneral.jsx';
import InventarioEnProceso from '../views/Inventario/InventarioEnProceso.jsx';
import InventarioMateriaPrima from '../views/Inventario/InventarioMateriaPrima.jsx';

/* COMPRAS */
import ProveedoresMaestroDetalle from '../views/Compras/ProveedoresMaestroDetalle.jsx';
import CuentasPorPagar from '../views/Compras/CuentasPorPagar.jsx';

/* VENTAS */
import RegistroClientes from '../views/EntradaVentas/RegistroClientes.jsx';
import RegistroVenta from '../views/EntradaVentas/RegistroVenta.jsx';
import RegistroFactura from '../views/EntradaVentas/RegistroFactura.jsx';

/* GESTIÓN DE LIBROS  (VISTAS COMPLETAS) */
import Libros from '../views/GestionLibros/Libros.jsx';
import Autores from '../views/GestionLibros/Autores.jsx';
import CategoriasTemas from '../views/GestionLibros/CategoriasTemas.jsx';
import ControlBusqueda from '../views/GestionLibros/ControlBusqueda.jsx';

/* INFORMES */
import ReporteCompras from '../views/Informes/ReporteCompras.jsx';
import ReporteVentas from '../views/Informes/ReporteVentas.jsx';

/* ADMINISTRACIÓN */
import GestionUsuarios from '../views/Usuarios/GestionUsuarios.jsx';

/* PARÁMETROS */
import ParametrosGeneral from '../views/parametros/ParametrosGeneral.jsx';
import ParametrosUsuariosRoles from '../views/parametros/ParametrosUsuariosRoles.jsx';
import ParametrosRespaldo from '../views/parametros/ParametrosRespaldo.jsx';

/* ---------- COMPONENTE PROTEGIDO ---------- */
const Protected = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/" replace />;

/* ---------- DEFINICIÓN DEL ROUTER ---------- */
export const router = createBrowserRouter([
  // Rutas públicas
  { path: '/', element: <Login /> },
  { path: '/logout', element: <Logout /> },

  // Rutas protegidas bajo Dashboard (layout con sidebar)
  {
    path: '/dashboard',
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
    children: [
      // Redirección por defecto
      { index: true, element: <Navigate to="inicio" /> },

      // Principales
      { path: 'inicio', element: <Inicio /> },
      { path: 'perfil', element: <Perfil /> },

      // Inventario
      { path: 'inventario/general', element: <InventarioGeneral /> },
      { path: 'inventario/proceso', element: <InventarioEnProceso /> },
      { path: 'inventario/materia-prima', element: <InventarioMateriaPrima /> },

      // Compras
      { path: 'compras/proveedores', element: <ProveedoresMaestroDetalle /> },
      { path: 'compras/cuentas-por-pagar', element: <CuentasPorPagar /> },

      // Ventas
      { path: 'ventas/registro-clientes', element: <RegistroClientes /> },
      { path: 'ventas/registro-ventas', element: <RegistroVenta /> },
      { path: 'ventas/registro-factura', element: <RegistroFactura /> },

      // Gestión de Libros
      {
        path: 'libros',
        children: [
          { index: true, element: <Libros /> },           // vista tabla libros
          { path: 'autores', element: <Autores /> },      // vista tabla autores
          { path: 'categorias-temas', element: <CategoriasTemas /> },
          { path: 'control-busqueda', element: <ControlBusqueda /> },
        ],
      },

      // Informes
      { path: 'informes/compras', element: <ReporteCompras /> },
      { path: 'informes/ventas', element: <ReporteVentas /> },

      // Administración
      { path: 'administracion/usuarios', element: <GestionUsuarios /> },

      // Parámetros
      { path: 'parametros/general', element: <ParametrosGeneral /> },
      { path: 'parametros/usuarios-roles', element: <ParametrosUsuariosRoles /> },
      { path: 'parametros/respaldo', element: <ParametrosRespaldo /> },
    ],
  },

  // Cualquier otra ruta -> redirigir a login
  { path: '*', element: <Navigate to="/" /> },
]);