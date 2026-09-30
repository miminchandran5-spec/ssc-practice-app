import { Question, SubjectId } from '../types';
import { quantQuestions } from './questions-quant';
import { reasoningQuestions } from './questions-reasoning';
import { englishQuestions } from './questions-english';
import { gaQuestions } from './questions-ga';

// ============================================================
// Combined Question Bank
// ============================================================
export const ALL_QUESTIONS: Question[] = [
  ...quantQuestions,
  ...reasoningQuestions,
  ...englishQuestions,
  ...gaQuestions,
];

// ============================================================
// Query helpers
// ============================================================
export function getQuestionsBySubject(subject: SubjectId): Question[] {
  return ALL_QUESTIONS.filter(q => q.subject === subject);
}

export function getQuestionsByTopic(topicId: string): Question[] {
  return ALL_QUESTIONS.filter(q => q.topic === topicId);
}

export function getQuestionsByDifficulty(difficulty: string): Question[] {
  return ALL_QUESTIONS.filter(q => q.difficulty === difficulty);
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find(q => q.id === id);
}

export function getRandomQuestions(
  count: number,
  filters?: {
    subject?: SubjectId;
    topic?: string;
    difficulty?: string;
    excludeIds?: string[];
  }
): Question[] {
  let pool = [...ALL_QUESTIONS];
  
  if (filters?.subject) {
    pool = pool.filter(q => q.subject === filters.subject);
  }
  if (filters?.topic) {
    pool = pool.filter(q => q.topic === filters.topic);
  }
  if (filters?.difficulty && filters.difficulty !== 'mixed') {
    pool = pool.filter(q => q.difficulty === filters.difficulty);
  }
  if (filters?.excludeIds) {
    pool = pool.filter(q => !filters.excludeIds!.includes(q.id));
  }
  
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  
  return pool.slice(0, Math.min(count, pool.length));
}

export function validateQuestionBank(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set<string>();
  
  for (const q of ALL_QUESTIONS) {
    // Check for duplicate IDs
    if (ids.has(q.id)) {
      errors.push(`Duplicate question ID: ${q.id}`);
    }
    ids.add(q.id);
    
    // Check required fields
    if (!q.questionText) errors.push(`${q.id}: Missing question text`);
    if (!q.correctAnswer) errors.push(`${q.id}: Missing correct answer`);
    if (!q.explanation) errors.push(`${q.id}: Missing explanation`);
    if (!q.subject) errors.push(`${q.id}: Missing subject`);
    if (!q.topic) errors.push(`${q.id}: Missing topic`);
    if (!q.difficulty) errors.push(`${q.id}: Missing difficulty`);
    if (!q.sourceType) errors.push(`${q.id}: Missing source type`);
    
    // Check correct answer matches an option
    if (q.options && q.options.length > 0) {
      const optionIds = q.options.map(o => o.id);
      if (!optionIds.includes(q.correctAnswer)) {
        errors.push(`${q.id}: Correct answer "${q.correctAnswer}" doesn't match any option`);
      }
    }
    
    // Check minimum options
    if (!q.options || q.options.length < 2) {
      errors.push(`${q.id}: Less than 2 options`);
    }
    
    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
      errors.push(`${q.id}: Invalid difficulty "${q.difficulty}"`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Run validation on import in development
if (import.meta.env.DEV) {
  const validation = validateQuestionBank();
  if (!validation.valid) {
    console.warn('Question bank validation errors:', validation.errors);
  } else {
    console.log(`✓ Question bank validated: ${ALL_QUESTIONS.length} questions OK`);
  }
}
