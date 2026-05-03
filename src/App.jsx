import React, { useState, useCallback, useRef } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function App() {
  const ruanganData = [
    { nama: 'Lab Komputer', daya: 6000, warna: '#3B82F6' },
    { nama: 'Lab IPA', daya: 4500, warna: '#10B981' },
    { nama: 'Ruang TAS', daya: 3500, warna: '#F59E0B' },
    { nama: 'Ruang Studio', daya: 2800, warna: '#EF4444' },
    { nama: 'Ruang Admin', daya: 2000, warna: '#8B5CF6' },
    { nama: 'Ruang Guru', daya: 1800, warna: '#06B6D4' },
    { nama: 'Kantin', daya: 3200, warna: '#F97316' },
  ];

  const [jamPakai, setJamPakai] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const inputRefs = useRef({});

  const handleInputChange = useCallback((nama, value) => {
    const numValue = parseInt(value) || 0;
    setJamPakai(prev => ({
      ...prev,
      [nama]: Math.max(0, Math.min(24, numValue))
    }));
  }, []);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = (index + 1) % ruanganData.length;
      const nextNama = ruanganData[nextIndex].nama;
      inputRefs.current[nextNama]?.focus();
    }
  }, [ruanganData]);

  const handleWheel = (e) => {
    e.target.blur(); // Mencegah perubahan nilai saat scroll mouse
  };

  const tarifPerKwh = 1500;
  const hariPerMinggu = 5;
  const mingguPerBulan = 4;

  const kalkulasiTotal = () => {
    let totalKwhHari = 0;
    ruanganData.forEach(({ nama, daya }) => {
      const jam = jamPakai[nama] || 0;
      totalKwhHari += (daya * jam) / 1000;
    });

    return {
      hari: totalKwhHari,
      minggu: totalKwhHari * hariPerMinggu,
      bulan: totalKwhHari * hariPerMinggu * mingguPerBulan,
      biayaHari: totalKwhHari * tarifPerKwh,
      biayaMinggu: totalKwhHari * hariPerMinggu * tarifPerKwh,
      biayaBulan: totalKwhHari * hariPerMinggu * mingguPerBulan * tarifPerKwh
    };
  };

  const total = kalkulasiTotal();

  const chartData = ruanganData.map(({ nama, daya, warna }) => {
    const jam = jamPakai[nama] || 0;
    const kwh = (daya * jam) / 1000;
    return { nama, kwh, jam, daya, warna };
  });

  const dataBar = {
    labels: chartData.map(item => item.nama),
    datasets: [{
      label: 'Konsumsi (kWh)',
      data: chartData.map(item => item.kwh),
      backgroundColor: chartData.map(item => item.warna + '40'),
      borderColor: chartData.map(item => item.warna),
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const dataDoughnut = {
    labels: ['Hari', 'Minggu', 'Bulan'],
    datasets: [{
      data: [total.hari, total.minggu, total.bulan],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
      hoverOffset: 15,
      borderWidth: 0,
    }],
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="logo">⚡ <span>SMA Muhammadiyah 4 Depok</span></div>
        <h1 className="title">Lab Maya Konsumsi Listrik</h1>
        <p className="subtitle">Monitoring Energi & Estimasi Biaya Operasional</p>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <div className="container">
        {/* INPUT SECTION */}
        <section className="card">
          <div className="card-header">
            <h2 className="h2">📝 Durasi Penggunaan</h2>
            <span className="text-muted">Gunakan ENTER untuk navigasi cepat</span>
          </div>
          <div className="input-grid">
            {ruanganData.map((ruangan, index) => (
              <div key={ruangan.nama} className="input-item">
                <label className="input-label">{ruangan.nama} ({ruangan.daya}W)</label>
                <div className="input-wrapper">
                  <input
                    ref={el => { inputRefs.current[ruangan.nama] = el; }}
                    type="number"
                    value={jamPakai[ruangan.nama] || ''}
                    onChange={(e) => handleInputChange(ruangan.nama, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onWheel={handleWheel}
                    placeholder="0"
                  />
                  <span>Jam</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VISUALIZATION SECTION */}
        <div className="charts-grid">
          <div className="chart-container">
            <div style={{ height: '400px' }}>
              <Bar 
                data={dataBar} 
                options={{ 
                  maintainAspectRatio: false, 
                  plugins: { title: { display: true, text: 'Beban kWh per Ruangan' } } 
                }} 
              />
            </div>
          </div>
          <div className="chart-container">
            <div style={{ height: '400px' }}>
              <Doughnut 
                data={dataDoughnut} 
                options={{ 
                  maintainAspectRatio: false, 
                  cutout: '70%',
                  plugins: { title: { display: true, text: 'Proporsi Akumulasi' } } 
                }} 
              />
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <section className="card">
          <div className="card-header"><h2 className="h2">📋 Rincian Teknis</h2></div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ruangan</th>
                  <th>Daya Alat</th>
                  <th>Durasi</th>
                  <th>Energi (kWh)</th>
                  <th>Biaya (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item) => (
                  <tr key={item.nama}>
                    <td><strong>{item.nama}</strong></td>
                    <td>{item.daya.toLocaleString()} Watt</td>
                    <td>{item.jam} Jam</td>
                    <td style={{color: '#3B82F6'}}>{item.kwh.toFixed(2)} kWh</td>
                    <td style={{color: '#10B981', fontWeight: 'bold'}}>
                      Rp {(item.kwh * tarifPerKwh).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SUMMARY SECTION */}
        <section className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Estimasi Harian</div>
            <div className="summary-value">{total.hari.toFixed(2)} kWh</div>
            <div className="summary-price">Rp {total.biayaHari.toLocaleString('id-ID')}</div>
          </div>
          <div className="summary-card" style={{borderLeft: '4px solid #10B981'}}>
            <div className="summary-label">Estimasi Mingguan</div>
            <div className="summary-value">{total.minggu.toFixed(2)} kWh</div>
            <div className="summary-price">Rp {total.biayaMinggu.toLocaleString('id-ID')}</div>
          </div>
          <div className="summary-card" style={{borderLeft: '4px solid #F59E0B'}}>
            <div className="summary-label">Estimasi Bulanan</div>
            <div className="summary-value">{total.bulan.toFixed(2)} kWh</div>
            <div className="summary-price">Rp {total.biayaBulan.toLocaleString('id-ID')}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;