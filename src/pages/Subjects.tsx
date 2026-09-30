import { useNavigate, useParams } from 'react-router-dom';
import { SUBJECTS } from '../data/config';
import { getProgress } from '../store';
import { getQuestionsBySubject, getQuestionsByTopic } from '../data/questions';

export default function Subjects() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const progress = getProgress();

  const selectedSubject = subjectId ? SUBJECTS.find(s => s.id === subjectId) : null;

  if (selectedSubject) {
    // Show topics for this subject
    return (
      <div className="container animate-fade-in">
        <div className="page-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subjects')} style={{ marginBottom: 'var(--space-3)' }}>
            ← Back to Subjects
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '2rem' }}>{selectedSubject.icon}</span>
            <div>
              <h1>{selectedSubject.name}</h1>
              <p>{selectedSubject.description}</p>
            </div>
          </div>
        </div>

        {/* Subject stats */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="stat-card">
            <span className="stat-value">{selectedSubject.topics.length}</span>
            <span className="stat-label">Topics</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{getQuestionsBySubject(selectedSubject.id).length}</span>
            <span className="stat-label">Questions Available</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{progress.subjectProgress[selectedSubject.id]?.totalAttempted || 0}</span>
            <span className="stat-label">Attempted</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{progress.subjectProgress[selectedSubject.id]?.accuracy || 0}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>

        {/* Topics list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {selectedSubject.topics.map(topic => {
            const tp = progress.topicProgress[topic.id];
            const qCount = getQuestionsByTopic(topic.id).length;

            return (
              <div
                key={topic.id}
                className="topic-item"
                onClick={() => navigate(`/topic/${topic.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/topic/${topic.id}`)}
              >
                <div>
                  <div className="topic-name">{topic.name}</div>
                  <div className="topic-desc">
                    {qCount} questions • {topic.description}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {tp && tp.totalAttempted > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {tp.accuracy}%
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {tp.totalAttempted} done
                      </div>
                    </div>
                  )}
                  <span className={`mastery-badge mastery-${tp?.mastery || 'not_started'}`}>
                    {tp?.mastery === 'mastered' ? '★ Mastered' :
                     tp?.mastery === 'proficient' ? 'Proficient' :
                     tp?.mastery === 'learning' ? 'Learning' :
                     tp?.mastery === 'beginner' ? 'Beginner' : 'New'}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '1.2rem' }}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Subject list view
  return (
    <div className="container animate-fade-in">
      <div className="page-header">
        <h1>Subjects</h1>
        <p>Choose a subject to start practicing</p>
      </div>

      <div className="grid grid-2">
        {SUBJECTS.map(subject => {
          const sp = progress.subjectProgress[subject.id];
          const totalQ = getQuestionsBySubject(subject.id).length;

          return (
            <div
              key={subject.id}
              className="subject-card"
              style={{ '--subject-color': subject.color } as React.CSSProperties}
              onClick={() => navigate(`/subjects/${subject.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/subjects/${subject.id}`)}
            >
              <div className="subject-icon">{subject.icon}</div>
              <div className="subject-name">{subject.name}</div>
              <div className="subject-desc">{subject.description}</div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${sp?.accuracy || 0}%`,
                      background: subject.color,
                    }}
                  />
                </div>
              </div>

              <div className="subject-meta">
                <span>{subject.topics.length} topics • {totalQ} questions</span>
                <span style={{ fontWeight: 600 }}>
                  {sp?.totalAttempted || 0} solved
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
