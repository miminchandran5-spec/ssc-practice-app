import { Navigate } from 'react-router-dom';

// TestResult — the results are shown inline in the Practice page completion screen
export default function TestResult() {
  return <Navigate to="/dashboard" replace />;
}
