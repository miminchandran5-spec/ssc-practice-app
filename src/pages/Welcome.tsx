import { useNavigate } from 'react-router-dom';
import { isOnboardingComplete } from '../store';
import { useEffect } from 'react';

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOnboardingComplete()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>✨</div>
        <h1 className="greeting">Hey Kavya 👋</h1>
        <p className="from-text">
          This is a little gift from <strong>Mimin</strong>.<br />
          Here's your first app — built to help you prepare smarter for your next SSC exam.
        </p>

        <div className="features-list">
          <div className="feature-item">
            <span>📝</span>
            <span>Practice previous-year style questions across all subjects</span>
          </div>
          <div className="feature-item">
            <span>📊</span>
            <span>Track your accuracy, speed, and progress over time</span>
          </div>
          <div className="feature-item">
            <span>🎯</span>
            <span>Take timed tests and full-length mock exams</span>
          </div>
          <div className="feature-item">
            <span>💡</span>
            <span>Get smart recommendations on what to study next</span>
          </div>
          <div className="feature-item">
            <span>🔄</span>
            <span>Review mistakes and revisit weak areas</span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 'var(--space-4)', fontSize: 'var(--text-md)' }}
          onClick={() => navigate('/onboarding')}
        >
          Start Preparing →
        </button>

        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          marginTop: 'var(--space-4)',
        }}>
          Your journey to cracking SSC begins here 🚀
        </p>
      </div>
    </div>
  );
}
