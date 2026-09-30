import { Navigate } from 'react-router-dom';

// TestSession redirects to Practice — we use a unified practice component
export default function TestSession() {
  return <Navigate to="/practice" replace />;
}
