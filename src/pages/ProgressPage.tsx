import { useState } from 'react';
import { getProgress, getTestResults, getProfile } from '../store';
import { SUBJECTS } from '../data/config';

export default function ProgressPage() {
  const progress = getProgress();
  const testResults = getTestResults();
  const profile = getProfile();
  const [activeTab, setActiveTab] = useState('overview');

  const overallAccuracy = progress.totalQuestionsSolved > 0
    ? Math.round((progress.totalCorrect / progress.totalQuestionsSolved) * 100)
    : 0;

  // Calculate weekly activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyData = last7Days.map(date => {
    const activity = progress.dailyActivity.find(a => a.date === date);
    return {
      date,
      label: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      questions: activity?.questionsSolved || 0,
    };
  });

  const maxQuestions = Math.max(...weeklyData.map(d => d.questions), 1);

  // Topic mastery data
  const topicData = Object.values(progress.topicProgress)
    .filter(tp => tp.totalAttempted > 0)
    .sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="container animate-fade-in">
      <div className="page-header">
        <h1>📊 Your Progress</h1>
        <p>Track your preparation journey and identify areas for improvement</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'subjects', label: 'Subjects' },
          { id: 'achievements', label: 'Achievements' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          {/* Overall Stats */}
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card">
              <span className="stat-icon">📝</span>
              <span className="stat-value">{progress.totalQuestionsSolved}</span>
              <span className="stat-label">Total Solved</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">{overallAccuracy}%</span>
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
              <span className="stat-label">Day Streak (Best: {progress.longestStreak})</span>
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="card card-elevated" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>📅 This Week's Activity</h3>
            {progress.totalQuestionsSolved === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <p>Complete your first practice to see activity data here.</p>
              </div>
            ) : (
              <div className="bar-chart">
                {weeklyData.map(day => (
                  <div key={day.date} className="bar-chart-item">
                    <div
                      className="bar-chart-bar"
                      style={{
                        height: `${(day.questions / maxQuestions) * 100}%`,
                        background: day.date === new Date().toISOString().split('T')[0]
                          ? 'var(--primary-500)' : 'var(--primary-200)',
                      }}
                      title={`${day.questions} questions`}
                    />
                    <span className="bar-chart-label">{day.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Correct/Incorrect breakdown */}
          <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card card-elevated">
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Answer Distribution</h4>
              {progress.totalQuestionsSolved > 0 ? (
                <div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent-green)' }}>
                        {progress.totalCorrect}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Correct</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent-red)' }}>
                        {progress.totalIncorrect}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Incorrect</div>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div className="progress-bar-fill success" style={{
                      width: `${(progress.totalCorrect / progress.totalQuestionsSolved) * 100}%`,
                    }} />
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>No data yet</p>
              )}
            </div>

            <div className="card card-elevated">
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Study Info</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Target Exam</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{profile?.targetExam || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Daily Goal</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{profile?.dailyGoalMinutes || 30} min</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Joined</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Topic mastery */}
          {topicData.length > 0 && (
            <div className="card card-elevated">
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>🎓 Topic Mastery</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {topicData.map(tp => (
                  <div key={tp.topicId} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid var(--border-light)',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{tp.topicName}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {tp.totalAttempted} questions • avg {tp.avgTime}s
                      </div>
                    </div>
                    <div style={{ width: 120 }}>
                      <div className="progress-bar" style={{ height: 4, marginBottom: 2 }}>
                        <div className={`progress-bar-fill ${tp.accuracy >= 80 ? 'success' : tp.accuracy >= 50 ? 'warning' : 'danger'}`}
                          style={{ width: `${tp.accuracy}%` }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, width: 40, textAlign: 'right' }}>
                      {tp.accuracy}%
                    </span>
                    <span className={`mastery-badge mastery-${tp.mastery}`} style={{ minWidth: 70, textAlign: 'center' }}>
                      {tp.mastery === 'mastered' ? '★ Mastered' :
                       tp.mastery === 'proficient' ? 'Proficient' :
                       tp.mastery === 'learning' ? 'Learning' : 'Beginner'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="animate-fade-in">
          {SUBJECTS.map(subject => {
            const sp = progress.subjectProgress[subject.id];
            const topics = Object.values(progress.topicProgress)
              .filter(tp => tp.subjectId === subject.id && tp.totalAttempted > 0);

            return (
              <div key={subject.id} className="card card-elevated" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{subject.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3 className="heading-4">{subject.name}</h3>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {sp?.totalAttempted || 0} questions attempted • {sp?.accuracy || 0}% accuracy
                    </div>
                  </div>
                </div>

                {sp?.totalAttempted === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                    Start practicing {subject.shortName} to see your progress here.
                  </div>
                ) : (
                  <div>
                    <div className="progress-bar" style={{ marginBottom: 'var(--space-3)' }}>
                      <div className="progress-bar-fill" style={{
                        width: `${sp?.accuracy || 0}%`,
                        background: subject.color,
                      }} />
                    </div>
                    {topics.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {topics.map(tp => (
                          <span key={tp.topicId} className={`badge badge-${tp.accuracy >= 80 ? 'success' : tp.accuracy >= 50 ? 'warning' : 'danger'}`}>
                            {tp.topicName}: {tp.accuracy}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="animate-fade-in">
          <div className="grid grid-3">
            {progress.achievements.map(ach => (
              <div key={ach.id} className="card card-elevated" style={{
                textAlign: 'center',
                opacity: ach.isUnlocked ? 1 : 0.6,
                background: ach.isUnlocked ? 'linear-gradient(135deg, #fef3c7, #fffbeb)' : 'var(--surface-card)',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{ach.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: 2 }}>{ach.name}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                  {ach.description}
                </div>
                <div className="progress-bar" style={{ marginBottom: 'var(--space-2)' }}>
                  <div className={`progress-bar-fill ${ach.isUnlocked ? 'success' : ''}`} style={{ width: `${ach.progress}%` }} />
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {ach.isUnlocked
                    ? `Unlocked ${ach.unlockedAt ? new Date(ach.unlockedAt).toLocaleDateString() : ''}`
                    : `${ach.current}/${ach.requirement}`
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
