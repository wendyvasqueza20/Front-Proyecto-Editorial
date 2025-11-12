import { useState } from 'react';
import { toast } from 'react-toastify';
import './ParametrosGenerales.css';

export default function ParametrosGeneral() {
  const [iva, setIva] = useState(15);
  const [moneda, setMoneda] = useState('HNL');
  const [fechaCierre, setFechaCierre] = useState('2025-12-31');

  const handleGuardar = () => {
    toast.success('Parámetros generales actualizados');
  };

  return (
    <div className="parametros-container">
      <h2 className="parametros-title">Parámetros Generales</h2>
      <p className="parametros-desc">
        Configure los valores globales que utilizará el sistema.
      </p>

      <div className="parametros-card">
        <div className="parametros-group">
          <label>% IVA</label>
          <input
            type="number"
            min="0"
            max="100"
            value={iva}
            onChange={(e) => setIva(e.target.value)}
          />
        </div>

        <div className="parametros-group">
          <label>Moneda predeterminada</label>
          <select value={moneda} onChange={(e) => setMoneda(e.target.value)}>
            <option value="HNL">Lempira (HNL)</option>
            <option value="USD">Dólar (USD)</option>
          </select>
        </div>

        <div className="parametros-group">
          <label>Fecha de cierre anual</label>
          <input
            type="date"
            value={fechaCierre}
            onChange={(e) => setFechaCierre(e.target.value)}
          />
        </div>

        <button className="parametros-btn" onClick={handleGuardar}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}