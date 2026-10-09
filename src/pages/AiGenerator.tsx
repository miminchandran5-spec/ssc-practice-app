import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBJECTS } from '../data/config';
import { Question } from '../types';

const OPENROUTER_MODEL = 'openrouter/free'; // Auto-routes to the best available free model on OpenRouter
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

export default function AiGenerator() {
  const navigate = useNavigate();
  
  const [subjectId, setSubjectId] = useState(SUBJECTS[0].id);
  const [topicId, setTopicId] = useState(SUBJECTS[0].topics[0].id);
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  // Update topics when subject changes
  useEffect(() => {
    const sub = SUBJECTS.find(s => s.id === subjectId);
    if (sub && sub.topics.length > 0) {
      setTopicId(sub.topics[0].id);
    }
  }, [subjectId]);

  const currentSubject = SUBJECTS.find(s => s.id === subjectId);
  const currentTopic = currentSubject?.topics.find(t => t.id === topicId);

  const extractJSON = (text: string) => {
    try {
      // First try to parse directly
      return JSON.parse(text);
    } catch {
      // Fallback: try to extract JSON array using regex
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGeneratedQuestions([]);

    const prompt = `You are an expert SSC (Staff Selection Commission) exam content creator in India.
Generate exactly ${count} multiple-choice questions for the subject "${currentSubject?.name}" and topic "${currentTopic?.name}".
The difficulty level should be "${difficulty}".

Output MUST be a valid JSON array containing exactly ${count} objects following this interface:
{
  "id": "ai_unique_id",
  "subject": "${subjectId}",
  "topic": "${topicId}",
  "difficulty": "${difficulty}",
  "questionText": "The actual question...",
  "options": [
    { "id": "a", "text": "Option A text" },
    { "id": "b", "text": "Option B text" },
    { "id": "c", "text": "Option C text" },
    { "id": "d", "text": "Option D text" }
  ],
  "correctAnswer": "a",
  "explanation": "Detailed explanation of why the answer is correct.",
  "sourceType": "ai_generated",
  "sourceName": "AI Assistant"
}

Do NOT wrap the output in markdown code blocks like \`\`\`json. Return ONLY the raw JSON array.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.href, // Optional but recommended by OpenRouter
          'X-Title': 'PrepMaster SSC App' // Optional but recommended by OpenRouter
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: 'You are an expert educator that strictly outputs valid JSON arrays.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error (${response.status}): ${err}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      const parsed = extractJSON(content);
      if (!parsed || !Array.isArray(parsed)) {
        console.error("Raw AI Output:", content);
        throw new Error('Failed to parse AI response into valid questions. The model might have returned invalid JSON.');
      }

      // Ensure all objects have required fields
      const validQuestions = parsed.map((q, idx) => ({
        id: q.id || `ai_gen_${Date.now()}_${idx}`,
        subject: q.subject || subjectId,
        topic: q.topic || topicId,
        difficulty: q.difficulty || difficulty,
        questionText: q.questionText || 'Failed to generate question text',
        options: q.options || [
          { id: 'a', text: 'Option A' }, { id: 'b', text: 'Option B' }, { id: 'c', text: 'Option C' }, { id: 'd', text: 'Option D' }
        ],
        correctAnswer: q.correctAnswer || 'a',
        explanation: q.explanation || 'No explanation provided.',
        sourceType: 'ai_generated',
        sourceName: 'AI Gen'
      })) as Question[];

      setGeneratedQuestions(validQuestions);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeGenerated = () => {
    if (generatedQuestions.length === 0) return;
    
    // We pass the generated questions directly to Practice via state
    // But Practice.tsx currently fetches from the data store.
    // Let's adapt Practice to accept questions directly in state, or we can just navigate to a custom test session.
    // For now, passing them via state is best.
    navigate('/practice', {
      state: {
        mode: 'ai_custom',
        customQuestions: generatedQuestions
      }
    });
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: 'var(--space-12)' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>✨</span> AI Question Generator
          </h1>
          <p>Instantly generate unlimited practice questions tailored to your needs.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-6)' }}>
          <span>❌</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>Generation Failed</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* Configuration Panel */}
        <div className="card">
          <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>Configure Generation</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label className="input-label">Subject</label>
              <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Topic</label>
              <select className="input" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
                {currentSubject?.topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-2">
              <div>
                <label className="input-label">Difficulty</label>
                <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="input-label">Number of Questions</label>
                <select className="input" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{ marginTop: 'var(--space-2)' }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                  Generating with AI...
                </>
              ) : '✨ Generate Questions'}
            </button>
            
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {generatedQuestions.length > 0 ? (
            <div className="card card-elevated animate-slide-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 className="heading-4">Generated Preview</h3>
                <span className="badge badge-success">{generatedQuestions.length} Questions</span>
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {generatedQuestions.map((q, i) => (
                  <div key={q.id} style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: i < generatedQuestions.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Q{i+1}. {q.questionText}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {q.options.map(opt => (
                        <div key={opt.id} style={{ padding: '6px', background: q.correctAnswer === opt.id ? 'var(--accent-green-light)' : 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', color: q.correctAnswer === opt.id ? 'var(--accent-green)' : 'inherit', fontWeight: q.correctAnswer === opt.id ? 600 : 400 }}>
                          {opt.id.toUpperCase()}. {opt.text} {q.correctAnswer === opt.id && '✅'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePracticeGenerated}>
                🚀 Practice These Questions Now
              </button>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}>🤖</div>
              <h4 className="heading-4" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Ready to Generate</h4>
              <p style={{ maxWidth: '300px' }}>Select your preferences and click Generate to create fresh, unique SSC questions using AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
