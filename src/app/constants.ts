export const API_BASE_URL = typeof window !== 'undefined' 
  ? `http://${window.location.hostname}:3001` 
  : 'http://localhost:3001';
