import React from 'react';
import './StressGauge.css';

function scoreColor(score) {
  if (score > 70) return '#ff4757';
  if (score > 40) return '#f5a623';
  return '#00c896';
}

export default function StressGauge({ score }) {
  const normalized = Math.max(0, Math.min(100, score));
  const angle = (normalized / 100) * 180;
  const color = scoreColor(normalized);
  const radius = 70;
  const strokeWidth = 12;
  const cx = 100;
  const cy = 100;
  const arcLength = Math.PI * radius;
  const offset = arcLength * (1 - normalized / 100);

  return (
    <div className="stress-gauge">
      <svg width="200" height="140" viewBox="0 0 200 140">
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#2a2a3d"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="gauge-score" style={{ color }}>{normalized}</div>
      <div className="gauge-label">STRESS INDEX</div>
    </div>
  );
}
