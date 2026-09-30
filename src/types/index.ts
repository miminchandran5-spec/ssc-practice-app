// ============================================================
// PrepMaster — SSC Exam Preparation Platform
// Data Types & Interfaces
// ============================================================

export type ExamType = 'SSC_CGL' | 'SSC_CHSL' | 'SSC_MTS' | 'SSC_CPO' | 'SSC_GD';

export interface ExamConfig {
  id: ExamType;
  name: string;
  fullName: string;
  description: string;
  totalMarks: number;
  totalQuestions: number;
  durationMinutes: number;
  negativeMark: number;
  markPerQuestion: number;
  sections: string[];
  tiers: string[];
}

export type SubjectId = 'quantitative_aptitude' | 'reasoning' | 'english' | 'general_awareness';

export interface Subject {
  id: SubjectId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  subjectId: SubjectId;
  description: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}

export type QuestionType = 'mcq' | 'numerical' | 'multiple_response' | 'assertion_reasoning' | 'reading_comprehension' | 'match_following';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ContentProvenance = 'official_previous_year' | 'sourced_public_domain' | 'original_practice' | 'pattern_inspired';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  exam: ExamType | 'general';
  year?: number;
  tier?: string;
  paper?: string;
  shift?: string;
  subject: SubjectId;
  topic: string;
  subtopic?: string;
  questionText: string;
  questionType: QuestionType;
  options: QuestionOption[];
  correctAnswer: string; // option id
  explanation: string;
  hints: string[];
  difficulty: Difficulty;
  sourceType: ContentProvenance;
  sourceName: string;
  sourceUrl?: string;
  licenseNote?: string;
  isOfficial: boolean;
  isAiGenerated: boolean;
  formula?: string;
  shortcut?: string;
  alternativeMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export type TestType = 'topic' | 'subject' | 'mixed' | 'previous_year' | 'mock' | 'custom' | 'quick_fire' | 'focus' | 'weak_area' | 'speed_challenge' | 'daily_challenge' | 'revision_sprint' | 'mistake_practice';

export interface TestConfig {
  id: string;
  type: TestType;
  name: string;
  description: string;
  subjects?: SubjectId[];
  topics?: string[];
  questionCount: number;
  durationMinutes: number;
  difficulty: Difficulty | 'mixed';
  sourceFilter?: ContentProvenance[];
  showTimer: boolean;
  showFeedback: boolean; // immediate feedback mode
  negativeMark: number;
  markPerQuestion: number;
  allowBookmark: boolean;
  allowMarkForReview: boolean;
  allowHints: boolean;
}

export type AnswerStatus = 'unanswered' | 'answered' | 'marked_for_review' | 'answered_and_marked';

export interface TestAnswer {
  questionId: string;
  selectedOptionId: string | null;
  status: AnswerStatus;
  timeSpent: number; // seconds
  hintsUsed: number;
  bookmarked: boolean;
  flagged: boolean;
}

export interface TestAttempt {
  id: string;
  testConfig: TestConfig;
  questions: Question[];
  answers: Map<string, TestAnswer> | Record<string, TestAnswer>;
  startTime: string;
  endTime?: string;
  currentQuestionIndex: number;
  isCompleted: boolean;
  isPaused: boolean;
  timeRemaining: number; // seconds
}

export interface TestResult {
  id: string;
  attemptId: string;
  testConfig: TestConfig;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  maxScore: number;
  accuracy: number;
  averageTimePerQuestion: number;
  totalTimeTaken: number;
  subjectWise: Record<string, SubjectResult>;
  topicWise: Record<string, TopicResult>;
  difficultyWise: Record<Difficulty, DifficultyResult>;
  questionResults: QuestionResult[];
  completedAt: string;
  recommendations: string[];
}

export interface SubjectResult {
  subject: SubjectId;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  avgTime: number;
}

export interface TopicResult {
  topic: string;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  avgTime: number;
}

export interface DifficultyResult {
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface QuestionResult {
  questionId: string;
  question: Question;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  isSkipped: boolean;
  timeSpent: number;
  hintsUsed: number;
}

export interface UserProgress {
  totalQuestionsSolved: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalTests: number;
  studyStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  totalStudyTime: number; // minutes
  subjectProgress: Record<SubjectId, SubjectProgress>;
  topicProgress: Record<string, TopicProgress>;
  dailyActivity: DailyActivity[];
  achievements: Achievement[];
  weeklyGoal: number;
  weeklyCompleted: number;
}

export interface SubjectProgress {
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number;
  avgTimePerQuestion: number;
  lastPracticed: string;
  topicsCompleted: number;
  totalTopics: number;
}

export interface TopicProgress {
  topicId: string;
  topicName: string;
  subjectId: SubjectId;
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number;
  avgTime: number;
  mastery: 'not_started' | 'beginner' | 'learning' | 'proficient' | 'mastered';
  lastPracticed?: string;
  mistakeCount: number;
}

export interface DailyActivity {
  date: string;
  questionsSolved: number;
  testsCompleted: number;
  timeSpent: number; // minutes
  accuracy: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: number; // 0-100
  requirement: number;
  current: number;
  category: 'practice' | 'test' | 'streak' | 'accuracy' | 'speed' | 'mastery';
}

export interface Bookmark {
  questionId: string;
  question: Question;
  addedAt: string;
  notes?: string;
}

export interface Mistake {
  questionId: string;
  question: Question;
  selectedOptionId: string;
  correctOptionId: string;
  attemptCount: number;
  lastAttempted: string;
  resolved: boolean;
}

export interface DailyPlan {
  date: string;
  tasks: PlanTask[];
  estimatedMinutes: number;
  completed: boolean;
}

export interface PlanTask {
  id: string;
  type: 'practice' | 'test' | 'review' | 'challenge';
  subject?: SubjectId;
  topic?: string;
  questionCount: number;
  estimatedMinutes: number;
  completed: boolean;
  description: string;
}

export interface UserProfile {
  name: string;
  targetExam: ExamType;
  targetDate?: string;
  dailyGoalMinutes: number;
  dailyGoalQuestions: number;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface StudyRecommendation {
  type: 'practice' | 'review' | 'test' | 'revision';
  priority: 'high' | 'medium' | 'low';
  subject: SubjectId;
  topic?: string;
  reason: string;
  action: string;
  questionCount?: number;
}

// Scratchpad for math workspace
export interface ScratchpadEntry {
  id: string;
  questionId: string;
  content: string;
  createdAt: string;
}
