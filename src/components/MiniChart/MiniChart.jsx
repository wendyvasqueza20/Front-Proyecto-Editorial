// src/components/MiniChart/MiniChart.jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export default function MiniChart() {
  const data = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Ventas',
        data: [1200, 1900, 1500, 2100, 2300, 1800, 2500],
        borderColor: '#8a2c31',
        backgroundColor: 'rgba(138, 44, 49, 0.08)',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#8a2c31',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div style={{ height: 120 }}>
      <Line data={data} options={options} />
    </div>
  );
}