import React from 'react';
import { useStudentHistory } from '../hooks/useStudentHistory';
import StressGauge from './StressGauge';
import TrendChart from './TrendChart';
import LiveMonitor from './LiveMonitor';
import './DetailPanel.css';

function formatTimestamp(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return '-';
  }
}

export default function DetailPanel({ studentId, onAnalysisComplete }) {
  const { history, loading, error } = useStudentHistory(studentId);
  const latestScore = history.length > 0 ? history[0].stress_index : 0;
  const latestTimestamp = history.length > 0 ? history[0].timestamp : null;

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h2 className="detail-title">{studentId}</h2>
        <div className="detail-subtitle">
          {latestTimestamp ? `Last updated: ${formatTimestamp(latestTimestamp)}` : 'No data yet'}
        </div>
      </div>
      <div className="detail-body">
        <div className="detail-left">
          <StressGauge score={latestScore} />
        </div>
        <div className="detail-right">
          {loading && <div className="detail-loading">Loading history...</div>}
          {error && <div className="detail-error">{error}</div>}
          {!loading && !error && <TrendChart history={history} />}
        </div>
      </div>
      <LiveMonitor selectedStudent={studentId} onAnalysisComplete={onAnalysisComplete} />
    </div>
  );
}
