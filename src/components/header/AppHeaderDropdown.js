
// src/components/header/AppHeaderDropdown.js
import React from 'react';
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../utils/auth'; // ✅ Asegúrate de que esta ruta sea correcta
import { toast } from 'react-toastify';

const AppHeaderDropdown = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpia localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Muestra notificación
    toast.info('Sesión cerrada correctamente', { position: 'top-right' });

    // Redirige
    navigate('/login', { replace: true });
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CAvatar
          size="md"
          src={user.avatar || undefined}
          name={user.nombre || user.username || 'U'}
          style={{ backgroundColor: '#AD3A3A', color: 'white' }}
        />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">
          {user.nombre || user.username || 'Usuario'}
        </CDropdownHeader>
        <CDropdownItem onClick={handleLogout}>
          <svg className="icon me-2">
            <use xlinkHref="/vendors/@coreui/icons/svg/free.svg#cil-account-logout" />
          </svg>
          Cerrar sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;