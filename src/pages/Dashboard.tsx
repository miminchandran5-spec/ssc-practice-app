import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, getProgress, getStudyRecommendations, getDailyPlan, generateDailyPlan, completePlanTask } from '../store';
import { SUBJECTS } from '../data/config';
import { ALL_QUESTIONS } from '../data/questions';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const profile = getProfile();
  const [progress, setProgress] = useState(getProgress());
  const [plan, setPlan] = useState(getDailyPlan() || generateDailyPlan());
  const recommendations = getStudyRecommendations();

  useEffect(() => {
    setProgress(getProgress());
    setPlan(getDailyPlan() || generateDailyPlan());
  }, []);

  const handleQuickAction = (type: string) => {
    switch (type) {
      case 'practice': navigate('/subjects'); break;
      case 'test': navigate('/test-center'); break;
      case 'mistakes': navigate('/mistakes'); break;
      case 'bookmarks': navigate('/bookmarks'); break;
      default: navigate('/subjects');
    }
  };

  const handleCompletePlanTask = (taskId: string) => {
    completePlanTask(taskId);
    setPlan(getDailyPlan() || generateDailyPlan());
  };

  const isFirstTime = progress.totalQuestionsSolved === 0;

  return (
    <div className="container animate-fade-in">
      {/* Greeting */}
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {getGreeting()}, {profile?.name || 'there'} 👋
        </h1>
        <p>
          {isFirstTime
            ? 'Ready to start your SSC preparation journey?'
            : `You've solved ${progress.totalQuestionsSolved} questions so far. Keep going!`
          }
        </p>
      </div>

      {/* First-time guide */}
      {isFirstTime && (
        <div className="card card-elevated" style={{
          marginBottom: 'var(--space-6)',
          background: 'linear-gradient(135deg, var(--primary-50), #f5f3ff)',
          border: '1px solid var(--primary-200)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ fontSize: '2.5rem' }}>🎯</div>
            <div style={{ flex: 1 }}>
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-1)' }}>Your first mission</h3>
              <p className="body-small">
                Start with 10 mixed questions — takes about 8 minutes. Let's see where you stand!
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/practice', { state: { mode: 'quick', count: 10 } })}
            >
              Start Practice
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <span className="stat-value">{progress.totalQuestionsSolved}</span>
          <span className="stat-label">Questions Solved</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">
            {progress.totalQuestionsSolved > 0
              ? Math.round((progress.totalCorrect / progress.totalQuestionsSolved) * 100) + '%'
              : '—'
            }
          </span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <span className="stat-value">{progress.totalTests}</span>
          <span className="stat-label">Tests Taken</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{progress.studyStreak}</span>
          <span className="stat-label">Day Streak</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }} className="grid-2">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Today's Plan */}
          <div className="card card-elevated">
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-1)' }}>
              📅 Today's Mission
            </h3>
            <p className="body-small" style={{ marginBottom: 'var(--space-4)' }}>
              ~{plan.estimatedMinutes} minutes • {plan.tasks.filter(t => t.completed).length}/{plan.tasks.length} completed
            </p>

            <div className="progress-bar" style={{ marginBottom: 'var(--space-4)' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${plan.tasks.length > 0 ? (plan.tasks.filter(t => t.completed).length / plan.tasks.length * 100) : 0}%`,
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {plan.tasks.map(task => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                  background: task.completed ? 'var(--accent-green-light)' : 'var(--bg-secondary)',
                  opacity: task.completed ? 0.7 : 1,
                }}>
                  <button
                    onClick={() => handleCompletePlanTask(task.id)}
                    style={{
                      width: 20, height: 20, borderRadius: 'var(--radius-full)',
                      border: `2px solid ${task.completed ? 'var(--accent-green)' : 'var(--border-default)'}`,
                      background: task.completed ? 'var(--accent-green)' : 'transparent',
                      cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '10px',
                    }}
                    aria-label={task.completed ? 'Task completed' : 'Mark task complete'}
                  >
                    {task.completed ? '✓' : ''}
                  </button>
                  <span style={{
                    fontSize: 'var(--text-sm)', color: 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    flex: 1,
                  }}>
                    {task.description}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                    ~{task.estimatedMinutes}m
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card card-elevated">
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>⚡ Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              {[
                { key: 'practice', icon: '📝', label: 'Practice', desc: 'Topic-wise questions' },
                { key: 'test', icon: '⏱️', label: 'Quick Test', desc: '15-min mixed test' },
                { key: 'mistakes', icon: '🔄', label: 'Mistakes', desc: 'Review wrong answers' },
                { key: 'bookmarks', icon: '🔖', label: 'Bookmarks', desc: 'Saved questions' },
              ].map(action => (
                <button
                  key={action.key}
                  className="card card-compact card-interactive"
                  style={{ border: '1px solid var(--border-light)', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => handleQuickAction(action.key)}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>{action.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {action.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="card card-elevated">
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>💡 Recommendations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {recommendations.slice(0, 3).map((rec, i) => (
                  <div key={i} style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: rec.priority === 'high' ? 'var(--accent-red-light)' : 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `3px solid ${rec.priority === 'high' ? 'var(--accent-red)' : 'var(--primary-400)'}`,
                  }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                      {rec.reason}
                    </p>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        if (rec.topic) {
                          navigate(`/topic/${rec.topic}`);
                        } else if (rec.type === 'review') {
                          navigate('/mistakes');
                        } else {
                          navigate('/subjects');
                        }
                      }}
                    >
                      {rec.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject Progress */}
          <div className="card card-elevated">
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>📊 Subject Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {SUBJECTS.map(subject => {
                const sp = progress.subjectProgress[subject.id];
                return (
                  <Link
                    key={subject.id}
                    to={`/subjects/${subject.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: '1.3rem' }}>{subject.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          marginBottom: 4,
                        }}>
                          <span style={{
                            fontSize: 'var(--text-sm)', fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}>
                            {subject.shortName}
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            {sp?.totalAttempted || 0} questions • {sp?.accuracy || 0}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-bar-fill ${(sp?.accuracy || 0) >= 80 ? 'success' : (sp?.accuracy || 0) >= 50 ? 'warning' : ''}`}
                            style={{ width: `${sp?.accuracy || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Achievements Preview */}
          <div className="card card-elevated">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 className="heading-4">🏅 Achievements</h3>
              <Link to="/progress" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {progress.achievements.slice(0, 6).map(ach => (
                <div key={ach.id} style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: ach.isUnlocked ? 'var(--accent-amber-light)' : 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4,
                  opacity: ach.isUnlocked ? 1 : 0.5,
                }}>
                  <span>{ach.icon}</span>
                  <span>{ach.name}</span>
                  {!ach.isUnlocked && (
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      {ach.progress}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
