import React, { useRef, useState, useCallback, useEffect } from 'react';
import { analyzeStudent } from '../api/client';
import './LiveMonitor.css';

export default function LiveMonitor({ selectedStudent, onAnalysisComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [monitoring, setMonitoring] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const [camReady, setCamReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCamReady(true);
      setError(null);
    } catch (err) {
      setError('Camera/mic access denied. Please grant permissions.');
      setCamReady(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCamReady(false);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 200, 150);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    });
  }, []);

  const recordAudio = useCallback(() => {
    return new Promise((resolve) => {
      const stream = streamRef.current;
      if (!stream) return resolve(null);
      const audioStream = new MediaStream(stream.getAudioTracks());
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : {});
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onerror = () => resolve(null);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        resolve(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, 3000);
    });
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!selectedStudent) return;
    try {
      const [frameBlob, audioBlob] = await Promise.all([captureFrame(), recordAudio()]);
      if (!frameBlob) return;
      if (!audioBlob) {
        setLastResult({ error: 'Audio recording failed' });
        return;
      }
      const result = await analyzeStudent(selectedStudent, frameBlob, audioBlob);
      setLastResult(result);
      if (onAnalysisComplete) onAnalysisComplete();
    } catch (err) {
      const msg = err.response ? `API error (${err.response.status})` : err.message;
      setLastResult({ error: msg });
    }
  }, [selectedStudent, captureFrame, recordAudio, onAnalysisComplete]);

  const startMonitoring = useCallback(async () => {
    setError(null);
    setLastResult(null);
    if (!streamRef.current) {
      await startCamera();
    }
    if (!camReady && !streamRef.current) {
      setError('Camera unavailable');
      return;
    }
    await runAnalysis();
    intervalRef.current = setInterval(runAnalysis, 10000);
    setMonitoring(true);
  }, [startCamera, runAnalysis, camReady]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopCamera();
    setMonitoring(false);
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="live-monitor">
      <div className="monitor-header">LIVE MONITOR</div>
      <div className="monitor-body">
        <div className="monitor-preview">
          <video ref={videoRef} autoPlay muted playsInline className="monitor-video" />
          <canvas ref={canvasRef} className="monitor-canvas" />
          {!camReady && !error && (
            <div className="monitor-placeholder">
              <span>Camera preview</span>
            </div>
          )}
          {error && <div className="monitor-error-msg">{error}</div>}
        </div>
        <div className="monitor-controls">
          <button
            className="monitor-btn start"
            onClick={startMonitoring}
            disabled={monitoring || !selectedStudent}
          >
            {monitoring ? 'Monitoring...' : 'Start Monitoring'}
          </button>
          <button
            className="monitor-btn stop"
            onClick={stopMonitoring}
            disabled={!monitoring}
          >
            Stop
          </button>
          {!selectedStudent && (
            <div className="monitor-hint">Select a student first</div>
          )}
        </div>
        {lastResult && (
          <div className="monitor-result">
            {lastResult.error ? (
              <span className="monitor-result-error">Error: {lastResult.error}</span>
            ) : (
              <>
                <span className="monitor-result-score" style={{ color: lastResult.stress_index > 70 ? 'var(--red)' : lastResult.stress_index > 40 ? 'var(--yellow)' : 'var(--green)' }}>
                  Score: {lastResult.stress_index}
                </span>
                {lastResult.alert && <span className="monitor-result-alert">ALERT</span>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
