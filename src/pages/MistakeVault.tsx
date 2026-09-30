import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMistakes, resolveMistake } from '../store';
import { getTopic, getSubject } from '../data/config';

export default function MistakeVault() {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState(getMistakes());
  const [showResolved, setShowResolved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unresolvedMistakes = mistakes.filter(m => !m.resolved);
  const resolvedMistakes = mistakes.filter(m => m.resolved);
  const displayMistakes = showResolved ? resolvedMistakes : unresolvedMistakes;

  const handleResolve = (questionId: string) => {
    resolveMistake(questionId);
    setMistakes(getMistakes());
  };

  if (mistakes.length === 0) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>🔄 Mistake Vault</h1>
          <p>Track and learn from your mistakes</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <h3>No mistakes recorded</h3>
          <p>Mistakes will appear here when you answer questions incorrectly during practice. Use them to identify and strengthen your weak areas.</p>
          <button className="btn btn-primary" onClick={() => navigate('/subjects')} style={{ marginTop: 'var(--space-4)' }}>
            Start Practicing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="page-header">
        <h1>🔄 Mistake Vault</h1>
        <p>
          {unresolvedMistakes.length} unresolved mistake{unresolvedMistakes.length !== 1 ? 's' : ''}
          {resolvedMistakes.length > 0 && ` • ${resolvedMistakes.length} resolved`}
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button
          className={`tab ${!showResolved ? 'tab-active' : ''}`}
          onClick={() => setShowResolved(false)}
        >
          Unresolved ({unresolvedMistakes.length})
        </button>
        <button
          className={`tab ${showResolved ? 'tab-active' : ''}`}
          onClick={() => setShowResolved(true)}
        >
          Resolved ({resolvedMistakes.length})
        </button>
      </div>

      {/* Practice mistakes button */}
      {unresolvedMistakes.length > 0 && !showResolved && (
        <div className="card" style={{
          marginBottom: 'var(--space-6)',
          background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
          border: '1px solid #fecaca',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h4 className="heading-4">Let's fix your mistakes</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Practice questions you previously got wrong
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/practice', { state: { mode: 'mistakes', count: Math.min(10, unresolvedMistakes.length) } })}
            >
              Practice Mistakes ({Math.min(10, unresolvedMistakes.length)})
            </button>
          </div>
        </div>
      )}

      {/* Mistakes list */}
      {displayMistakes.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
          <h3>{showResolved ? 'No resolved mistakes yet' : 'All mistakes resolved! 🎉'}</h3>
          <p>{showResolved
            ? 'Resolve mistakes by answering them correctly during practice.'
            : 'Great job! Keep practicing to maintain your accuracy.'
          }</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {displayMistakes.map(mistake => {
            const topic = getTopic(mistake.question.topic);
            const subject = getSubject(mistake.question.subject);
            const isExpanded = expandedId === mistake.questionId;

            return (
              <div key={mistake.questionId} className="card card-elevated">
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    gap: 'var(--space-3)', cursor: 'pointer',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : mistake.questionId)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary">{subject?.shortName}</span>
                      <span className="badge badge-neutral">{topic?.name}</span>
                      {mistake.attemptCount > 1 && (
                        <span className="badge badge-danger">
                          {mistake.attemptCount}x wrong
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                      {mistake.question.questionText}
                    </p>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                      Last attempted: {new Date(mistake.lastAttempted).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '1.2rem', transform: isExpanded ? 'rotate(90deg)' : '', transition: 'transform 200ms' }}>
                    ›
                  </span>
                </div>

                {isExpanded && (
                  <div className="animate-slide-down" style={{ marginTop: 'var(--space-4)' }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)',
                      marginBottom: 'var(--space-3)',
                    }}>
                      <div style={{
                        padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-red-light)', border: '1px solid #fca5a5',
                      }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: '#991b1b', fontWeight: 600, marginBottom: 2 }}>Your Answer</div>
                        <div style={{ fontSize: 'var(--text-sm)' }}>
                          {mistake.question.options.find(o => o.id === mistake.selectedOptionId)?.text || '—'}
                        </div>
                      </div>
                      <div style={{
                        padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-green-light)', border: '1px solid #6ee7b7',
                      }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: '#065f46', fontWeight: 600, marginBottom: 2 }}>Correct Answer</div>
                        <div style={{ fontSize: 'var(--text-sm)' }}>
                          {mistake.question.options.find(o => o.id === mistake.correctOptionId)?.text || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="explanation-box">
                      <h4>📝 Explanation</h4>
                      <p>{mistake.question.explanation}</p>
                      {mistake.question.formula && (
                        <div className="formula">{mistake.question.formula}</div>
                      )}
                    </div>

                    {!mistake.resolved && (
                      <button
                        className="btn btn-sm btn-success"
                        style={{ marginTop: 'var(--space-3)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(mistake.questionId);
                        }}
                      >
                        ✓ Mark as Resolved
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
