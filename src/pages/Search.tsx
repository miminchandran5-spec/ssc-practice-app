import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_QUESTIONS } from '../data/questions';
import { SUBJECTS, getTopic, getSubject } from '../data/config';
import { getBookmarks, getMistakes } from '../store';

interface SearchResult {
  type: 'subject' | 'topic' | 'question' | 'bookmark' | 'mistake';
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const bookmarks = getBookmarks();
  const mistakes = getMistakes();

  const results = useMemo((): SearchResult[] => {
    if (!query.trim() || query.length < 2) return [];

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search subjects
    for (const subject of SUBJECTS) {
      if (subject.name.toLowerCase().includes(q) || subject.shortName.toLowerCase().includes(q)) {
        results.push({
          type: 'subject',
          title: subject.name,
          subtitle: `${subject.topics.length} topics`,
          icon: subject.icon,
          action: () => navigate(`/subjects/${subject.id}`),
        });
      }

      // Search topics
      for (const topic of subject.topics) {
        if (topic.name.toLowerCase().includes(q) || topic.description.toLowerCase().includes(q)) {
          results.push({
            type: 'topic',
            title: topic.name,
            subtitle: `${subject.shortName} • ${topic.description}`,
            icon: '📋',
            action: () => navigate(`/topic/${topic.id}`),
          });
        }
      }
    }

    // Search questions
    const matchingQuestions = ALL_QUESTIONS.filter(qu =>
      qu.questionText.toLowerCase().includes(q) ||
      qu.explanation.toLowerCase().includes(q)
    );

    for (const qu of matchingQuestions.slice(0, 10)) {
      const topic = getTopic(qu.topic);
      const subject = getSubject(qu.subject);
      results.push({
        type: 'question',
        title: qu.questionText.substring(0, 80) + (qu.questionText.length > 80 ? '...' : ''),
        subtitle: `${subject?.shortName} • ${topic?.name} • ${qu.difficulty}`,
        icon: '❓',
        action: () => navigate(`/topic/${qu.topic}`),
      });
    }

    // Search bookmarks
    for (const bm of bookmarks) {
      if (bm.question.questionText.toLowerCase().includes(q)) {
        results.push({
          type: 'bookmark',
          title: bm.question.questionText.substring(0, 80) + '...',
          subtitle: 'Bookmarked question',
          icon: '🔖',
          action: () => navigate('/bookmarks'),
        });
      }
    }

    return results.slice(0, 20);
  }, [query, navigate, bookmarks]);

  return (
    <div className="container animate-fade-in">
      <div className="page-header">
        <h1>🔍 Search</h1>
        <p>Find subjects, topics, questions, and more</p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="search-container" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="input search-input"
            placeholder="Search subjects, topics, questions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            aria-label="Search"
          />
        </div>

        {query.length >= 2 && results.length === 0 && (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try searching for a subject like "Percentage" or "History"</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="card card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
            {results.map((result, i) => (
              <div
                key={i}
                className="search-result-item"
                onClick={result.action}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && result.action()}
              >
                <span style={{ fontSize: '1.2rem' }}>{result.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'var(--text-base)', fontWeight: 500,
                    color: 'var(--text-primary)', marginBottom: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {result.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {result.subtitle}
                  </div>
                </div>
                <span className={`badge badge-${
                  result.type === 'subject' ? 'primary' :
                  result.type === 'topic' ? 'success' :
                  result.type === 'bookmark' ? 'warning' : 'neutral'
                }`}>
                  {result.type}
                </span>
              </div>
            ))}
          </div>
        )}

        {query.length < 2 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}>🔍</div>
            <p>Start typing to search across subjects, topics, and questions</p>

            <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
              {['Percentage', 'History', 'Algebra', 'Idioms', 'Polity', 'Series'].map(term => (
                <button
                  key={term}
                  className="btn btn-sm btn-secondary"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
