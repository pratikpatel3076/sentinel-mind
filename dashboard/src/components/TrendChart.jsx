import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import './TrendChart.css';

function scoreColor(score) {
  if (score > 70) return '#ff4757';
  if (score > 40) return '#f5a623';
  return '#00c896';
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return ts;
  }
}

export default function TrendChart({ history }) {
  const latest = history.length > 0 ? history[0].stress_index : 0;
  const color = scoreColor(latest);

  if (!history || history.length === 0) {
    return (
      <div className="trend-chart">
        <div className="trend-header">STRESS TREND</div>
        <div className="trend-empty">No history available</div>
      </div>
    );
  }

  const data = [...history].reverse().map((h) => ({
    time: formatTime(h.timestamp),
    score: h.stress_index,
  }));

  return (
    <div className="trend-chart">
      <div className="trend-header">STRESS TREND</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
          <XAxis dataKey="time" tick={{ fill: '#8888a8', fontSize: 11 }} axisLine={{ stroke: '#2a2a3d' }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#8888a8', fontSize: 11 }} axisLine={{ stroke: '#2a2a3d' }} />
          <Tooltip
            contentStyle={{
              background: '#1a1a26',
              border: '1px solid #2a2a3d',
              borderRadius: '4px',
              color: '#e8e8f0',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#8888a8' }}
          />
          <ReferenceLine y={40} stroke="#8888a8" strokeDasharray="4 4" label={{ value: 'Moderate', fill: '#8888a8', fontSize: 10 }} />
          <ReferenceLine y={70} stroke="#8888a8" strokeDasharray="4 4" label={{ value: 'Critical', fill: '#8888a8', fontSize: 10 }} />
          <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
