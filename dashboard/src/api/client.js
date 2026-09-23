import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
});

export async function getStudents() {
  const res = await api.get('/students');
  if (res.status !== 200) throw new Error('Failed to fetch students');
  return res.data;
}

export async function getHistory(studentId) {
  const res = await api.get(`/history/${studentId}`);
  if (res.status !== 200) throw new Error('Failed to fetch history');
  return res.data;
}

export async function analyzeStudent(studentId, frameBlob, audioBlob) {
  const form = new FormData();
  form.append('frame', frameBlob, 'frame.jpg');
  form.append('audio', audioBlob, 'audio.wav');
  const res = await api.post(`/analyze/${studentId}`, form);
  if (res.status !== 200) throw new Error('Analysis failed');
  return res.data;
}
