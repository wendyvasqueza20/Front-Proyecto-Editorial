import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h5>{title}</h5>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>
            Sí, cerrar sesión
          </button>
          <button className="btn btn-secondary btn-sm ms-2" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}