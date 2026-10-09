import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Question, Difficulty, SubjectId } from '../types';
import { getRandomQuestions, getQuestionsByTopic } from '../data/questions';
import { recordQuestionAttempt, addBookmark, removeBookmark, isBookmarked, addMistake, resolveMistake, getProgress } from '../store';
import { getSubject, getTopic } from '../data/config';

interface PracticeState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, { selected: string | null; isRevealed: boolean; timeSpent: number; hintsUsed: number }>;
  startTime: number;
  isComplete: boolean;
  mode: 'standard' | 'timed' | 'quick_fire' | 'focus';
  questionStartTime: number;
}

export default function Practice() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state as {
    subjects?: SubjectId[];
    topics?: string[];
    count?: number;
    difficulty?: Difficulty | 'mixed';
    timed?: boolean;
    mode?: string;
    customQuestions?: Question[];
  } | null;

  const [state, setState] = useState<PracticeState | null>(null);
  const [showHints, setShowHints] = useState(0); // 0 = no hints, 1-3 = hint level
  const [scratchpad, setScratchpad] = useState('');
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [timer, setTimer] = useState(0);
  const [encouragement, setEncouragement] = useState('');
  const timerRef = useRef<number | null>(null);

  // Swipe gesture refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!state) return;
    const swipeDistance = touchEndX.current - touchStartX.current;
    if (swipeDistance > 75) {
      // Swipe Right -> Previous
      handlePrev();
    } else if (swipeDistance < -75) {
      // Swipe Left -> Next
      // Only allow swipe to next if current question is revealed (checked)
      const q = state.questions[state.currentIndex];
      const isRevealed = state.answers[q.id]?.isRevealed;
      if (isRevealed) {
        handleNext();
      }
    }
  };

  // Initialize practice session
  useEffect(() => {
    const count = config?.count || 10;
    const topic = config?.topics?.[0];
    const subject = config?.subjects?.[0];

    let questions: Question[];
    if (config?.customQuestions && config.customQuestions.length > 0) {
      questions = config.customQuestions;
    } else if (topic) {
      const topicQuestions = getQuestionsByTopic(topic);
      // Shuffle
      const shuffled = [...topicQuestions].sort(() => Math.random() - 0.5);
      questions = shuffled.slice(0, Math.min(count, shuffled.length));
    } else {
      questions = getRandomQuestions(count, {
        subject,
        difficulty: config?.difficulty !== 'mixed' ? config?.difficulty : undefined,
      });
    }

    if (questions.length === 0) {
      return;
    }

    setState({
      questions,
      currentIndex: 0,
      answers: {},
      startTime: Date.now(),
      isComplete: false,
      mode: (config?.mode as any) || (config?.timed ? 'timed' : 'standard'),
      questionStartTime: Date.now(),
    });

    // Timer for timed mode
    if (config?.timed) {
      setTimer(count * 60); // 1 minute per question
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (config?.timed && timer > 0 && state && !state.isComplete) {
      timerRef.current = window.setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            // Time's up - auto finish
            if (timerRef.current) clearInterval(timerRef.current);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [state?.isComplete, config?.timed]);

  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    if (!state) return;
    const answer = state.answers[questionId];
    if (answer?.isRevealed) return; // Already revealed

    // Mobile haptic feedback for option select
    if (navigator.vibrate) {
      navigator.vibrate(30); // light tap
    }

    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: {
            selected: optionId,
            isRevealed: false,
            timeSpent: (Date.now() - prev.questionStartTime) / 1000,
            hintsUsed: showHints,
          },
        },
      };
    });
  }, [state, showHints]);

  const handleCheckAnswer = useCallback(() => {
    if (!state) return;
    const q = state.questions[state.currentIndex];
    const answer = state.answers[q.id];
    if (!answer?.selected) return;

    const timeSpent = (Date.now() - state.questionStartTime) / 1000;
    const isCorrect = answer.selected === q.correctAnswer;

    // Record attempt
    recordQuestionAttempt(q.id, q.subject, q.topic, isCorrect, timeSpent);

    // Haptic feedback for result
    if (navigator.vibrate) {
      navigator.vibrate(isCorrect ? [30, 50, 30] : [80, 50, 80]);
    }

    // Track mistakes
    if (!isCorrect) {
      addMistake({
        questionId: q.id,
        question: q,
        selectedOptionId: answer.selected,
        correctOptionId: q.correctAnswer,
        attemptCount: 1,
        lastAttempted: new Date().toISOString(),
        resolved: false,
      });
    } else {
      resolveMistake(q.id);
    }

    // Show encouragement
    if (isCorrect) {
      const msgs = ['Nice work! 🎉', 'Correct! ✅', 'Well done! 💪', 'You got it! 🌟', 'Keep it up! 🔥'];
      setEncouragement(msgs[Math.floor(Math.random() * msgs.length)]);
    } else {
      setEncouragement('');
    }

    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [q.id]: {
            ...prev.answers[q.id],
            isRevealed: true,
            timeSpent,
            hintsUsed: showHints,
          },
        },
      };
    });
    setShowHints(0);
  }, [state, showHints]);

  const handleNext = useCallback(() => {
    if (!state) return;
    if (state.currentIndex < state.questions.length - 1) {
      setState(prev => prev ? {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        questionStartTime: Date.now(),
      } : prev);
      setShowHints(0);
      setScratchpad('');
      setEncouragement('');
    }
  }, [state]);

  const handlePrev = useCallback(() => {
    if (!state) return;
    if (state.currentIndex > 0) {
      setState(prev => prev ? {
        ...prev,
        currentIndex: prev.currentIndex - 1,
        questionStartTime: Date.now(),
      } : prev);
      setShowHints(0);
      setEncouragement('');
    }
  }, [state]);

  const handleFinish = useCallback(() => {
    if (!state) return;

    // Auto-check any unanswered questions
    setState(prev => prev ? { ...prev, isComplete: true } : prev);

    if (timerRef.current) clearInterval(timerRef.current);
  }, [state]);

  const handleToggleBookmark = useCallback((q: Question) => {
    if (isBookmarked(q.id)) {
      removeBookmark(q.id);
    } else {
      addBookmark({
        questionId: q.id,
        question: q,
        addedAt: new Date().toISOString(),
      });
    }
    // Force re-render
    setState(prev => prev ? { ...prev } : prev);
  }, []);

  if (!state) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No questions available</h3>
          <p>There aren't enough questions matching your criteria. Try a different topic or difficulty.</p>
          <button className="btn btn-primary" onClick={() => navigate('/subjects')} style={{ marginTop: 'var(--space-4)' }}>
            Browse Subjects
          </button>
        </div>
      </div>
    );
  }

  // Completion screen
  if (state.isComplete) {
    const totalQ = state.questions.length;
    const answered = Object.values(state.answers).filter(a => a.isRevealed).length;
    const correct = state.questions.filter(q => {
      const a = state.answers[q.id];
      return a?.isRevealed && a.selected === q.correctAnswer;
    }).length;
    const incorrect = answered - correct;
    const skipped = totalQ - answered;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const totalTime = Math.round((Date.now() - state.startTime) / 1000);

    return (
      <div className="container animate-fade-in">
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 'var(--space-8) 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>
            {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '👍' : '💪'}
          </div>
          <h2 className="heading-2" style={{ marginBottom: 'var(--space-2)' }}>
            {accuracy >= 80 ? 'Excellent work!' : accuracy >= 60 ? 'Good job!' : 'Keep practicing!'}
          </h2>
          <p className="body-large" style={{ marginBottom: 'var(--space-6)' }}>
            {accuracy >= 80 ? 'You\'re doing great. Keep this momentum going.' :
             accuracy >= 60 ? 'Solid performance. A bit more practice will sharpen your skills.' :
             'Every attempt makes you stronger. Review the explanations and try again.'}
          </p>

          <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <span className="stat-value" style={{ color: 'var(--accent-green)' }}>{correct}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <span className="stat-value" style={{ color: 'var(--accent-red)' }}>{incorrect}</span>
              <span className="stat-label">Incorrect</span>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <span className="stat-value">{accuracy}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <span className="stat-value">{Math.floor(totalTime / 60)}:{String(totalTime % 60).padStart(2, '0')}</span>
              <span className="stat-label">Time Taken</span>
            </div>
          </div>

          {/* Review questions */}
          <div className="card card-elevated" style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>📋 Review</h3>
            {state.questions.map((q, i) => {
              const a = state.answers[q.id];
              const wasCorrect = a?.isRevealed && a.selected === q.correctAnswer;
              const wasSkipped = !a?.isRevealed;

              return (
                <div key={q.id} style={{
                  padding: 'var(--space-3)',
                  borderBottom: i < state.questions.length - 1 ? '1px solid var(--border-light)' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 'var(--radius-full)',
                    background: wasSkipped ? 'var(--bg-quaternary)' : wasCorrect ? 'var(--accent-green)' : 'var(--accent-red)',
                    color: wasSkipped ? 'var(--text-tertiary)' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, flexShrink: 0,
                  }}>
                    {wasSkipped ? '—' : wasCorrect ? '✓' : '✗'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 4 }}>
                      Q{i + 1}. {q.questionText.substring(0, 80)}...
                    </p>
                    {a?.isRevealed && !wasCorrect && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        Correct: {q.options.find(o => o.id === q.correctAnswer)?.text}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {a?.timeSpent ? `${Math.round(a.timeSpent)}s` : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/subjects')}>
              Practice More
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Current question
  const currentQ = state.questions[state.currentIndex];
  const currentAnswer = state.answers[currentQ.id];
  const isRevealed = currentAnswer?.isRevealed;
  const isCorrect = isRevealed && currentAnswer?.selected === currentQ.correctAnswer;
  const bookmarked = isBookmarked(currentQ.id);

  const answeredCount = Object.values(state.answers).filter(a => a.isRevealed).length;
  const correctCount = state.questions.filter(q => {
    const a = state.answers[q.id];
    return a?.isRevealed && a.selected === q.correctAnswer;
  }).length;

  return (
    <div className="container animate-fade-in">
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)',
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginRight: 'var(--space-2)' }}>
            {getTopic(currentQ.topic)?.name || currentQ.topic}
          </span>
          <span className={`badge badge-${currentQ.difficulty === 'easy' ? 'success' : currentQ.difficulty === 'medium' ? 'warning' : 'danger'}`}>
            {currentQ.difficulty}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {config?.timed && (
            <div className={`timer ${timer > 60 ? 'timer-normal' : timer > 30 ? 'timer-warning' : 'timer-danger'}`}>
              ⏱️ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
            </div>
          )}
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {state.currentIndex + 1} / {state.questions.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 'var(--space-6)' }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${((state.currentIndex + 1) / state.questions.length) * 100}%` }}
        />
      </div>

      <div 
        className="question-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Encouragement */}
        {encouragement && isCorrect && (
          <div style={{
            textAlign: 'center', padding: 'var(--space-3)',
            background: 'var(--accent-green-light)', borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)', fontWeight: 600, color: '#065f46',
            animation: 'slideDown 200ms ease',
          }}>
            {encouragement}
          </div>
        )}

        {/* Question text */}
        <div className="question-text">
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 'var(--space-2)' }}>
            Q{state.currentIndex + 1}.
          </span>
          {currentQ.questionText}
        </div>

        {/* Source info */}
        <div style={{
          fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
          marginBottom: 'var(--space-4)',
        }}>
          {currentQ.sourceType === 'original_practice' ? '📝 Practice Question' :
           currentQ.sourceType === 'pattern_inspired' ? '📋 SSC Pattern-Based' :
           currentQ.sourceType === 'official_previous_year' ? '📜 Previous Year' :
           '📝 Practice Question'
          }
          {' • '}{currentQ.sourceName}
        </div>

        {/* Options */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          {currentQ.options.map(option => {
            let className = 'option-item';
            if (isRevealed) {
              className += ' option-disabled';
              if (option.id === currentQ.correctAnswer) className += ' option-correct';
              else if (option.id === currentAnswer?.selected) className += ' option-incorrect';
            } else if (currentAnswer?.selected === option.id) {
              className += ' option-selected';
            }

            return (
              <div
                key={option.id}
                className={className}
                onClick={() => !isRevealed && handleSelectOption(currentQ.id, option.id)}
                role="radio"
                aria-checked={currentAnswer?.selected === option.id}
                aria-label={`Option ${option.id.toUpperCase()}: ${option.text}`}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && !isRevealed && handleSelectOption(currentQ.id, option.id)}
              >
                <span className="option-label">{option.id.toUpperCase()}</span>
                <span className="option-text">{option.text}</span>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)',
        }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className={`btn btn-sm ${bookmarked ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleToggleBookmark(currentQ)}
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {bookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setShowScratchpad(!showScratchpad)}
            >
              ✏️ Scratchpad
            </button>
            {!isRevealed && currentQ.hints && currentQ.hints.length > 0 && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowHints(prev => Math.min(prev + 1, currentQ.hints.length))}
                disabled={showHints >= currentQ.hints.length}
              >
                💡 Hint {showHints > 0 ? `(${showHints}/${currentQ.hints.length})` : ''}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {!isRevealed ? (
              <button
                className="btn btn-primary"
                onClick={handleCheckAnswer}
                disabled={!currentAnswer?.selected}
              >
                Check Answer
              </button>
            ) : (
              <>
                {state.currentIndex < state.questions.length - 1 ? (
                  <button className="btn btn-primary" onClick={handleNext}>
                    Next →
                  </button>
                ) : (
                  <button className="btn btn-success" onClick={handleFinish}>
                    Finish ✓
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handlePrev}
            disabled={state.currentIndex === 0}
          >
            ← Previous
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleNext}
            disabled={state.currentIndex === state.questions.length - 1}
          >
            Next →
          </button>
        </div>

        {/* Hints */}
        {showHints > 0 && currentQ.hints && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            {currentQ.hints.slice(0, showHints).map((hint, i) => (
              <div key={i} className="hint-box" style={{ marginBottom: 'var(--space-2)' }}>
                <strong>Hint {i + 1}:</strong> {hint}
              </div>
            ))}
          </div>
        )}

        {/* Scratchpad */}
        {showScratchpad && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="input-label">Scratchpad — use for rough calculations</label>
            <textarea
              className="scratchpad"
              value={scratchpad}
              onChange={e => setScratchpad(e.target.value)}
              placeholder="Type your working here... e.g., 25% of 400 = 100"
              rows={6}
              aria-label="Calculation scratchpad"
            />
          </div>
        )}

        {/* Explanation (shown after answer reveal) */}
        {isRevealed && (
          <div className="explanation-box animate-slide-up">
            <h4>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              {!isCorrect && (
                <span style={{ fontWeight: 400, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  {' '}— Correct answer: {currentQ.options.find(o => o.id === currentQ.correctAnswer)?.text}
                </span>
              )}
            </h4>
            <p style={{ marginTop: 'var(--space-2)' }}>{currentQ.explanation}</p>
            {currentQ.formula && (
              <div className="formula" style={{ marginTop: 'var(--space-3)' }}>
                📐 Formula: {currentQ.formula}
              </div>
            )}
            {currentQ.shortcut && (
              <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--accent-purple)' }}>
                ⚡ Shortcut: {currentQ.shortcut}
              </div>
            )}
            {currentQ.alternativeMethod && (
              <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                🔄 Alternative: {currentQ.alternativeMethod}
              </div>
            )}
          </div>
        )}

        {/* Question navigation grid */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Questions
          </p>
          <div className="question-nav-grid">
            {state.questions.map((q, i) => {
              const a = state.answers[q.id];
              let cls = 'question-nav-btn';
              if (i === state.currentIndex) cls += ' nav-current';
              else if (a?.isRevealed && a.selected === q.correctAnswer) cls += ' nav-answered';
              else if (a?.isRevealed) cls += ' nav-marked'; // incorrect = purple

              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => {
                    setState(prev => prev ? { ...prev, currentIndex: i, questionStartTime: Date.now() } : prev);
                    setShowHints(0);
                    setEncouragement('');
                  }}
                  aria-label={`Go to question ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent-green)', display: 'inline-block' }} /> Correct
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent-purple)', display: 'inline-block' }} /> Incorrect
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, border: '2px solid var(--border-light)', display: 'inline-block' }} /> Not attempted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
