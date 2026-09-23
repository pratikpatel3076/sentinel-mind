import React, { useState, useEffect, useCallback } from 'react';
import StudentList from './components/StudentList';
import DetailPanel from './components/DetailPanel';
import { useStudents } from './hooks/useStudents';
import './App.css';

function App() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { students, loading, error } = useStudents(refreshTrigger);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTrigger((t) => t + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedStudent(id);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  return (
    <div className="app">
      <header className="app-topbar">
        <div className="app-logo">SentinelMind</div>
        <div className="app-subtitle">Stress Detection System</div>
      </header>
      <div className="app-body">
        <div className="app-sidebar">
          <StudentList
            students={students}
            loading={loading}
            error={error}
            selectedStudent={selectedStudent}
            onSelect={handleSelect}
            onRefresh={handleRefresh}
          />
        </div>
        <main className="app-main">
          {selectedStudent ? (
            <DetailPanel studentId={selectedStudent} onAnalysisComplete={handleAnalysisComplete} />
          ) : (
            <div className="app-empty">Select a student to view details</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
