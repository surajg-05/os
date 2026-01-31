import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, AlertTriangle, Activity, Database } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchData = async () => {
    try {
      const statsRes = await fetch(`${API_BASE}/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      const historyRes = await fetch(`${API_BASE}/history`);
      const historyData = await historyRes.json();
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 1000); // Poll every 1s
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="dashboard-container">Loading Neural Interface...</div>;

  const isCritical = stats.status === 'CRITICAL';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={32} color={isCritical ? '#ff003c' : '#00ff9f'} />
          <div>
            <div className="title">SENTINEL OVERWATCH</div>
            <div style={{ fontSize: '0.8rem', color: '#88a' }}>SYSTEM INTEGRITY MONITOR</div>
          </div>
        </div>

        <div className={`status-badge ${isCritical ? 'status-critical' : 'status-safe'}`}>
          {isCritical ? 'THREAT DETECTED' : 'SYSTEM SECURE'}
        </div>
      </header>

      <div className="grid">
        {/* Left Column: Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div className="panel">
            <h2>THREAT PROBABILITY</h2>
            <div className="gauge-container">
              <div className="gauge-circle">
                <div
                  className="gauge-fill"
                  style={{
                    transform: `rotate(${stats.probability * 360}deg)`,
                    borderTopColor: isCritical ? '#ff003c' : '#00f0ff'
                  }}
                />
                <div className="gauge-text" style={{ color: isCritical ? '#ff003c' : '#00f0ff' }}>
                  {(stats.probability * 100).toFixed(1)}%
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#88a' }}>CONFIDENCE SCORE</div>
            </div>
          </div>

          <div className="panel">
            <h2>METRICS LATEST</h2>
            <div className="stats-grid">
              <div>
                <div className="stat-value">{stats.syscall_rate}</div>
                <div className="stat-label">Syscalls/Sec</div>
              </div>
              <div>
                <div className="stat-value" style={{ color: stats.churn_rate > 50 ? '#ff003c' : '#e0e0e0' }}>
                  {stats.churn_rate}
                </div>
                <div className="stat-label">File Churn</div>
              </div>
              <div>
                <div className="stat-value">{stats.total_anomalies}</div>
                <div className="stat-label">Total Threats</div>
              </div>
              <div>
                <div className="stat-value">{stats.total_events}</div>
                <div className="stat-label">Events Scanned</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Graphs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div className="panel" style={{ flex: 1 }}>
            <h2>SYSCALL ACTIVITY & THREAT LEVEL</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff003c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff003c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="timestamp" tick={false} />
                  <YAxis yAxisId="left" stroke="#88a" label={{ value: 'Syscalls', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ff003c" domain={[0, 1]} label={{ value: 'Prob', angle: 90, position: 'insideRight' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#13131f', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="syscall_rate" stroke="#00f0ff" fill="url(#colorSys)" strokeWidth={2} />
                  <Area yAxisId="right" type="monotone" dataKey="probability" stroke="#ff003c" fill="url(#colorProb)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel" style={{ height: '250px' }}>
            <h2>EVENT LOG</h2>
            <div className="feed-list">
              {history.slice(0, 20).map((event, i) => (
                <div key={i} className={`feed-item ${event.status === 'CRITICAL' ? 'critical' : ''}`}>
                  <span className="feed-time">{event.timestamp.split(' ')[1]}</span>
                  <span>{event.status} (Prob: {event.probability.toFixed(3)})</span>
                  <span>Churn: {event.churn_rate} | Sys: {event.syscall_rate}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
