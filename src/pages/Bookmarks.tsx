import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarks, removeBookmark } from '../store';
import { getTopic, getSubject } from '../data/config';

export default function Bookmarks() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState(getBookmarks());
  const [filter, setFilter] = useState('all');

  const handleRemove = (questionId: string) => {
    removeBookmark(questionId);
    setBookmarks(getBookmarks());
  };

  const subjects = [...new Set(bookmarks.map(b => b.question.subject))];
  const filtered = filter === 'all'
    ? bookmarks
    : bookmarks.filter(b => b.question.subject === filter);

  if (bookmarks.length === 0) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>🔖 Bookmarks</h1>
          <p>Save questions for later review</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🔖</div>
          <h3>No bookmarks yet</h3>
          <p>Bookmark questions while practicing to review them later. Look for the 🔖 button during practice.</p>
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
        <h1>🔖 Bookmarks</h1>
        <p>{bookmarks.length} question{bookmarks.length !== 1 ? 's' : ''} saved</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('all')}
        >
          All ({bookmarks.length})
        </button>
        {subjects.map(subId => {
          const subject = getSubject(subId);
          const count = bookmarks.filter(b => b.question.subject === subId).length;
          return (
            <button
              key={subId}
              className={`btn btn-sm ${filter === subId ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(subId)}
            >
              {subject?.icon} {subject?.shortName} ({count})
            </button>
          );
        })}
      </div>

      {/* Bookmarked questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtered.map(bookmark => {
          const topic = getTopic(bookmark.question.topic);
          const subject = getSubject(bookmark.question.subject);

          return (
            <div key={bookmark.questionId} className="card card-elevated">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">{subject?.shortName}</span>
                    <span className="badge badge-neutral">{topic?.name}</span>
                    <span className={`badge badge-${bookmark.question.difficulty === 'easy' ? 'success' : bookmark.question.difficulty === 'medium' ? 'warning' : 'danger'}`}>
                      {bookmark.question.difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 'var(--leading-relaxed)' }}>
                    {bookmark.question.questionText}
                  </p>
                  <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    Bookmarked {new Date(bookmark.addedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleRemove(bookmark.questionId)}
                    aria-label="Remove bookmark"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Show answer */}
              <details style={{ marginTop: 'var(--space-3)' }}>
                <summary style={{
                  cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--primary-600)',
                  fontWeight: 500,
                }}>
                  Show Answer & Explanation
                </summary>
                <div className="explanation-box" style={{ marginTop: 'var(--space-2)' }}>
                  <p><strong>Answer:</strong> {bookmark.question.options.find(o => o.id === bookmark.question.correctAnswer)?.text}</p>
                  <p style={{ marginTop: 'var(--space-2)' }}>{bookmark.question.explanation}</p>
                  {bookmark.question.formula && (
                    <div className="formula">{bookmark.question.formula}</div>
                  )}
                </div>
              </details>
            </div>
          );
        })}
      </div>

      {/* Practice bookmarked */}
      {filtered.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/practice', { state: { mode: 'bookmarked', count: Math.min(10, filtered.length) } })}
          >
            Practice Bookmarked Questions
          </button>
        </div>
      )}
    </div>
  );
}
