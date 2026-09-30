import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamType } from '../types';
import { EXAM_CONFIGS } from '../data/config';
import { saveProfile } from '../store';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedExam, setSelectedExam] = useState<ExamType>('SSC_CGL');
  const [targetDate, setTargetDate] = useState('');
  const [dailyGoal, setDailyGoal] = useState(30);

  const handleComplete = () => {
    saveProfile({
      name: 'Kavya',
      targetExam: selectedExam,
      targetDate: targetDate || undefined,
      dailyGoalMinutes: dailyGoal,
      dailyGoalQuestions: Math.round(dailyGoal * 1.5),
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    });
    navigate('/dashboard', { replace: true });
  };

  const examOptions = Object.values(EXAM_CONFIGS);

  return (
    <div className="welcome-screen">
      <div className="welcome-card" style={{ maxWidth: 560 }}>
        {step === 0 && (
          <div className="animate-fade-in">
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🎯</div>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-2)' }}>
              Which exam are you preparing for?
            </h2>
            <p className="body-large" style={{ marginBottom: 'var(--space-6)' }}>
              We'll customize your experience based on your target exam.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', textAlign: 'left' }}>
              {examOptions.map(exam => (
                <button
                  key={exam.id}
                  onClick={() => setSelectedExam(exam.id)}
                  style={{
                    padding: 'var(--space-4)',
                    background: selectedExam === exam.id ? 'var(--primary-50)' : 'var(--bg-primary)',
                    border: `2px solid ${selectedExam === exam.id ? 'var(--primary-500)' : 'var(--border-light)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {exam.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {exam.fullName}
                  </div>
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 'var(--space-6)' }}
              onClick={() => setStep(1)}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>📅</div>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-2)' }}>
              When's your exam?
            </h2>
            <p className="body-large" style={{ marginBottom: 'var(--space-6)' }}>
              Optional — helps us plan your study schedule.
            </p>

            <div style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
              <label className="input-label" htmlFor="targetDate">Target exam date</label>
              <input
                id="targetDate"
                type="date"
                className="input"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
              <label className="input-label">Daily study goal</label>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {[15, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDailyGoal(mins)}
                    className={`btn ${dailyGoal === mins ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary btn-lg" onClick={() => setStep(0)} style={{ flex: 1 }}>
                ← Back
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleComplete} style={{ flex: 2 }}>
                Let's Go! 🚀
              </button>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8,
          marginTop: 'var(--space-6)',
        }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8,
              borderRadius: 'var(--radius-full)',
              background: i === step ? 'var(--primary-500)' : 'var(--bg-quaternary)',
              transition: 'all 200ms ease',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
