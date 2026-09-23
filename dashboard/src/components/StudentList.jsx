import React from 'react';
import './StudentList.css';

function scoreColor(score) {
  if (score > 70) return 'var(--red)';
  if (score > 40) return 'var(--yellow)';
  return 'var(--green)';
}

function SkeletonRow() {
  return (
    <div className="student-row skeleton">
      <div className="skeleton-line" style={{ width: '60%' }} />
      <div className="skeleton-line" style={{ width: '30%' }} />
    </div>
  );
}

export default function StudentList({ students, loading, error, selectedStudent, onSelect, onRefresh }) {
  return (
    <div className="student-list">
      <div className="student-list-header">STUDENTS</div>
      <div className="student-list-body">
        {loading && !students.length && (
          <>
            <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
          </>
        )}
        {error && (
          <div className="student-list-error">
            <span>{error}</span>
            <button onClick={onRefresh}>Retry</button>
          </div>
        )}
        {!loading && !error && students.length === 0 && (
          <div className="student-list-empty">No students found</div>
        )}
        {students.map((s) => (
          <div
            key={s.student_id}
            className={`student-row ${selectedStudent === s.student_id ? 'selected' : ''}`}
            style={{ borderLeftColor: scoreColor(s.latest_score) }}
            onClick={() => onSelect(s.student_id)}
          >
            <div className="student-row-info">
              <span className="student-id">{s.name || s.student_id}</span>
              <span className="student-sub">{s.student_id}</span>
            </div>
            <div className="student-row-right">
              <span className="score-badge" style={{ color: scoreColor(s.latest_score) }}>
                {s.latest_score}
              </span>
              {s.alert && <span className="alert-pill">ALERT</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
