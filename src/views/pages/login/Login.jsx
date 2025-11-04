// src/views/pages/login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { loginSchema } from '../../../utils/schemas';
import './Login.css';

const frases = [
  'Un libro abierto es un cerebro que habla. – Gustavo Adolfo Bécquer',
  'Escribir es una forma de hablar sin ser interrumpido. – Jules Renard',
  'Los libros son espejos: sólo se ve en ellos lo que uno ya lleva dentro. – Carlos Fuentes',
  'Leer no es decir las palabras, sino entenderlas. – Walt Disney',
  'Un escritor es un mundo atrapado en un hombre. – Victor Hugo',
  'La lectura es para la mente lo que el ejercicio para el cuerpo. – Joseph Addison',
  'Los libros no cambian al mundo, pero a las personas que lo cambiarán. – Gabriel García Márquez',
  'Escribir es dejar pasar la vida y volverla inmortal. – Mario Vargas Llosa',
];

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 10,
  duration: Math.random() * 20 + 10,
}));

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [frase, setFrase] = useState('');

  useEffect(() => {
    setFrase(frases[Math.floor(Math.random() * frases.length)]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const res = loginSchema.safeParse(formData);
    if (!res.success) {
      const fld = {};
      res.error.issues.forEach((i) => (fld[i.path[0]] = i.message));
      setErrors(fld);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: formData.username, contraseña: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Credenciales inválidas');

      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch {
      toast.error('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            '--size': `${p.size}px`,
            '--left': `${p.left}%`,
            '--top': `${p.top}%`,
            '--delay': `${p.delay}s`,
            '--duration': `${p.duration}s`,
          }}
        />
      ))}

      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-left">
          <img src="../../../../public/logo_editorial-removebg-preview.png" alt="Guaymuras" className="side-logo" />
          <blockquote>“{frase}”</blockquote>
        </div>

        <div className="login-right">
          <div className="login-header">
            <div className="avatar">
              <User size={32} />
            </div>
            <h2>Iniciar sesión</h2>
            <p>Editorial Guaymuras</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <div className={`input-wrapper ${errors.username ? 'error' : ''}`}>
                <User className="input-icon" />
                <input
                  name="username"
                  type="text"
                  placeholder="Usuario"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              {errors.username && <small>{errors.username}</small>}
            </div>

            <div className="input-group">
              <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                <Lock className="input-icon" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <small>{errors.password}</small>}
            </div>

            {/* BOTÓN PEQUEÑO Y DINÁMICO */}
            <button type="submit" className="submit-btn-sm" disabled={loading}>
              {loading ? (
                <div className="spinner-sm" />
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight size={18} className="btn-icon" />
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <button
              type="button"
              className="link-btn"
              onClick={() => toast.info('Función en desarrollo')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;