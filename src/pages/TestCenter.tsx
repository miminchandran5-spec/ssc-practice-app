import { useNavigate } from 'react-router-dom';
import { SUBJECTS } from '../data/config';
import { ALL_QUESTIONS, getRandomQuestions } from '../data/questions';
import { getProgress, getMistakes } from '../store';
import { useState } from 'react';
import { SubjectId, Difficulty } from '../types';

export default function TestCenter() {
  const navigate = useNavigate();
  const progress = getProgress();
  const mistakes = getMistakes().filter(m => !m.resolved);
  const [customSubject, setCustomSubject] = useState<SubjectId | 'mixed'>('mixed');
  const [customCount, setCustomCount] = useState(20);
  const [customDifficulty, setCustomDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [customTime, setCustomTime] = useState(30);

  const startTest = (config: {
    type: string;
    name: string;
    count: number;
    subjects?: SubjectId[];
    topics?: string[];
    timed: boolean;
    difficulty?: Difficulty | 'mixed';
    mode?: string;
    timeMinutes?: number;
  }) => {
    navigate('/practice', { state: config });
  };

  const testModes = [
    {
      icon: '⚡', name: 'Quick Fire', desc: '10 rapid questions, immediate feedback',
      action: () => startTest({ type: 'quick_fire', name: 'Quick Fire', count: 10, timed: true, mode: 'quick_fire', timeMinutes: 5 }),
    },
    {
      icon: '🎯', name: 'Focus Mode', desc: '15 questions, distraction-free',
      action: () => startTest({ type: 'focus', name: 'Focus Mode', count: 15, timed: false, mode: 'focus' }),
    },
    {
      icon: '🔄', name: 'Weak Area Challenge', desc: `${mistakes.length} mistakes to fix`,
      action: () => startTest({ type: 'weak_area', name: 'Weak Area Challenge', count: Math.min(10, mistakes.length), timed: false, mode: 'weak_area' }),
      disabled: mistakes.length === 0,
    },
    {
      icon: '💪', name: 'Mistake Vault Practice', desc: 'Retry previously wrong answers',
      action: () => navigate('/mistakes'),
      disabled: mistakes.length === 0,
    },
    {
      icon: '🏃', name: 'Speed Challenge', desc: '20 questions in 10 minutes',
      action: () => startTest({ type: 'speed', name: 'Speed Challenge', count: 20, timed: true, mode: 'standard', timeMinutes: 10 }),
    },
    {
      icon: '📅', name: 'Daily Challenge', desc: 'Today\'s set of questions',
      action: () => startTest({ type: 'daily', name: 'Daily Challenge', count: 15, timed: true, mode: 'standard', timeMinutes: 15 }),
    },
  ];

  return (
    <div className="container animate-fade-in">
      <div className="page-header">
        <h1>Test Center</h1>
        <p>Take tests, challenge yourself, and track your growth</p>
      </div>

      {/* Quick test modes */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>🎮 Practice Modes</h3>
        <div className="grid grid-3">
          {testModes.map(mode => (
            <button
              key={mode.name}
              className="card card-compact card-interactive"
              style={{
                textAlign: 'left', cursor: mode.disabled ? 'not-allowed' : 'pointer',
                opacity: mode.disabled ? 0.5 : 1,
                border: '1px solid var(--border-light)',
              }}
              onClick={mode.disabled ? undefined : mode.action}
              disabled={mode.disabled}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-2)' }}>{mode.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: 2 }}>
                {mode.name}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {mode.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Tests */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>📚 Subject Tests</h3>
        <div className="grid grid-4">
          {SUBJECTS.map(subject => (
            <button
              key={subject.id}
              className="card card-compact card-interactive"
              style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-light)' }}
              onClick={() => startTest({
                type: 'subject',
                name: `${subject.shortName} Test`,
                count: 15,
                subjects: [subject.id],
                timed: true,
                mode: 'standard',
                timeMinutes: 15,
              })}
            >
              <span style={{ fontSize: '1.5rem' }}>{subject.icon}</span>
              <div style={{ fontWeight: 600, marginTop: 'var(--space-2)' }}>{subject.shortName} Test</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>15 questions • 15 min</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mock Test */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>📋 Full Mock Test</h3>
        <div className="card card-elevated" style={{
          background: 'linear-gradient(135deg, var(--primary-50), #f5f3ff)',
          border: '1px solid var(--primary-200)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h4 className="heading-4" style={{ marginBottom: 'var(--space-1)' }}>
                SSC Mock Examination
              </h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Full-length test simulating the real SSC exam experience. Questions from all subjects, timed, with negative marking.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                <span>📝 {Math.min(ALL_QUESTIONS.length, 50)} questions</span>
                <span>⏱️ 50 minutes</span>
                <span>📊 All subjects</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => startTest({
                type: 'mock',
                name: 'SSC Mock Test',
                count: Math.min(ALL_QUESTIONS.length, 50),
                timed: true,
                mode: 'standard',
                timeMinutes: 50,
              })}
            >
              Start Mock Test
            </button>
          </div>
        </div>
      </div>

      {/* Custom Test */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>🔧 Custom Test</h3>
        <div className="card card-elevated">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-5)' }} className="grid-2">
            <div>
              <label className="input-label">Subject</label>
              <select
                className="input"
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value as SubjectId | 'mixed')}
              >
                <option value="mixed">All Subjects (Mixed)</option>
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Number of Questions</label>
              <select className="input" value={customCount} onChange={e => setCustomCount(Number(e.target.value))}>
                {[5, 10, 15, 20, 25, 30].map(n => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Difficulty</label>
              <select className="input" value={customDifficulty} onChange={e => setCustomDifficulty(e.target.value as Difficulty | 'mixed')}>
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="input-label">Time Limit (minutes)</label>
              <select className="input" value={customTime} onChange={e => setCustomTime(Number(e.target.value))}>
                {[10, 15, 20, 30, 45, 60].map(n => (
                  <option key={n} value={n}>{n} minutes</option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: 'var(--space-5)' }}
            onClick={() => startTest({
              type: 'custom',
              name: 'Custom Test',
              count: customCount,
              subjects: customSubject !== 'mixed' ? [customSubject] : undefined,
              timed: true,
              difficulty: customDifficulty,
              mode: 'standard',
              timeMinutes: customTime,
            })}
          >
            Start Custom Test
          </button>
        </div>
      </div>
    </div>
  );
}
