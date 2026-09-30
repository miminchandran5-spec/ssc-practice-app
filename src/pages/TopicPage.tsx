import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopic, getSubjectForTopic } from '../data/config';
import { getQuestionsByTopic } from '../data/questions';
import { getProgress } from '../store';
import { Difficulty } from '../types';

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const topic = topicId ? getTopic(topicId) : null;
  const subject = topicId ? getSubjectForTopic(topicId) : null;
  const questions = topicId ? getQuestionsByTopic(topicId) : [];
  const progress = getProgress();
  const tp = topicId ? progress.topicProgress[topicId] : null;

  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed');

  if (!topic || !subject) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>Topic not found</h3>
          <p>This topic doesn't exist or has been moved.</p>
          <button className="btn btn-primary" onClick={() => navigate('/subjects')} style={{ marginTop: 'var(--space-4)' }}>
            Browse Subjects
          </button>
        </div>
      </div>
    );
  }

  const startPractice = (mode: string = 'standard') => {
    const testConfig = {
      type: mode === 'timed' ? 'topic' : 'topic',
      subjects: [subject.id],
      topics: [topic.id],
      count: Math.min(questionCount, questions.length),
      difficulty,
      timed: mode === 'timed',
      mode,
    };
    navigate('/practice', { state: testConfig });
  };

  const difficultyDist = {
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  };

  return (
    <div className="container animate-fade-in">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/subjects/${subject.id}`)} style={{ marginBottom: 'var(--space-3)' }}>
          ← Back to {subject.shortName}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '2rem' }}>{subject.icon}</span>
          <div>
            <h1>{topic.name}</h1>
            <p>{topic.description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <span className="stat-value">{questions.length}</span>
          <span className="stat-label">Questions Available</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{tp?.totalAttempted || 0}</span>
          <span className="stat-label">Attempted</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{tp?.accuracy || 0}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{tp?.avgTime ? `${tp.avgTime}s` : '—'}</span>
          <span className="stat-label">Avg Time</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }} className="grid-2">
        {/* Practice Setup */}
        <div className="card card-elevated">
          <h3 className="heading-4" style={{ marginBottom: 'var(--space-5)' }}>Start Practice</h3>

          {/* Question count */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label className="input-label">Number of Questions</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {[5, 10, 15, 20].map(n => (
                <button
                  key={n}
                  className={`btn btn-sm ${questionCount === n ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setQuestionCount(n)}
                  disabled={n > questions.length}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label className="input-label">Difficulty</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {(['mixed', 'easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  className={`btn btn-sm ${difficulty === d ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Start buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => startPractice('standard')} disabled={questions.length === 0}>
              📝 Start Practice
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => startPractice('timed')} disabled={questions.length === 0}>
              ⏱️ Timed Practice
            </button>
          </div>

          {questions.length === 0 && (
            <div className="alert alert-info" style={{ marginTop: 'var(--space-4)' }}>
              No questions available for this topic yet. More questions will be added soon!
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Mastery */}
          <div className="card card-elevated">
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Mastery Level
            </h4>
            <div style={{ textAlign: 'center', padding: 'var(--space-3)' }}>
              <span className={`mastery-badge mastery-${tp?.mastery || 'not_started'}`} style={{
                fontSize: 'var(--text-base)', padding: '6px 16px',
              }}>
                {tp?.mastery === 'mastered' ? '★ Mastered' :
                 tp?.mastery === 'proficient' ? 'Proficient' :
                 tp?.mastery === 'learning' ? 'Learning' :
                 tp?.mastery === 'beginner' ? 'Beginner' : 'Not Started'}
              </span>
            </div>
            {tp?.totalAttempted === 0 && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
                Practice questions to build mastery
              </p>
            )}
          </div>

          {/* Difficulty distribution */}
          <div className="card card-elevated">
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Difficulty Distribution
            </h4>
            {Object.entries(difficultyDist).map(([level, count]) => (
              <div key={level} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--space-2)',
              }}>
                <span className={`badge badge-${level === 'easy' ? 'success' : level === 'medium' ? 'warning' : 'danger'}`}>
                  {level}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  {count} questions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
