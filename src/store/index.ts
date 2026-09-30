import {
  UserProfile, UserProgress, SubjectId, Bookmark, Mistake,
  TestResult, DailyActivity, Achievement, TopicProgress,
  SubjectProgress, TestAttempt, TestAnswer, DailyPlan, PlanTask,
} from '../types';
import { SUBJECTS } from '../data/config';
import { ALL_QUESTIONS } from '../data/questions';

// ============================================================
// LocalStorage Keys
// ============================================================
const KEYS = {
  PROFILE: 'pm_profile',
  PROGRESS: 'pm_progress',
  BOOKMARKS: 'pm_bookmarks',
  MISTAKES: 'pm_mistakes',
  TEST_RESULTS: 'pm_test_results',
  CURRENT_TEST: 'pm_current_test',
  DAILY_PLAN: 'pm_daily_plan',
  ACHIEVEMENTS: 'pm_achievements',
};

// ============================================================
// Helper
// ============================================================
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// ============================================================
// PROFILE
// ============================================================
export function getProfile(): UserProfile | null {
  return load<UserProfile | null>(KEYS.PROFILE, null);
}

export function saveProfile(profile: UserProfile): void {
  save(KEYS.PROFILE, profile);
}

export function isOnboardingComplete(): boolean {
  const profile = getProfile();
  return !!profile?.onboardingCompleted;
}

// ============================================================
// PROGRESS
// ============================================================
function getDefaultProgress(): UserProgress {
  const subjectProgress: Record<string, SubjectProgress> = {};
  for (const s of SUBJECTS) {
    subjectProgress[s.id] = {
      totalAttempted: 0,
      totalCorrect: 0,
      accuracy: 0,
      avgTimePerQuestion: 0,
      lastPracticed: '',
      topicsCompleted: 0,
      totalTopics: s.topics.length,
    };
  }

  const topicProgress: Record<string, TopicProgress> = {};
  for (const s of SUBJECTS) {
    for (const t of s.topics) {
      topicProgress[t.id] = {
        topicId: t.id,
        topicName: t.name,
        subjectId: s.id as SubjectId,
        totalAttempted: 0,
        totalCorrect: 0,
        accuracy: 0,
        avgTime: 0,
        mastery: 'not_started',
        mistakeCount: 0,
      };
    }
  }

  return {
    totalQuestionsSolved: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalTests: 0,
    studyStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    totalStudyTime: 0,
    subjectProgress: subjectProgress as Record<SubjectId, SubjectProgress>,
    topicProgress,
    dailyActivity: [],
    achievements: getDefaultAchievements(),
    weeklyGoal: 100,
    weeklyCompleted: 0,
  };
}

export function getProgress(): UserProgress {
  return load<UserProgress>(KEYS.PROGRESS, getDefaultProgress());
}

export function saveProgress(progress: UserProgress): void {
  save(KEYS.PROGRESS, progress);
}

export function updateStreakOnActivity(): void {
  const progress = getProgress();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (progress.lastStudyDate === today) {
    // Already active today
    return;
  }

  if (progress.lastStudyDate === yesterday) {
    progress.studyStreak += 1;
  } else if (progress.lastStudyDate !== today) {
    progress.studyStreak = 1;
  }

  if (progress.studyStreak > progress.longestStreak) {
    progress.longestStreak = progress.studyStreak;
  }

  progress.lastStudyDate = today;
  saveProgress(progress);
}

export function recordQuestionAttempt(
  questionId: string,
  subject: SubjectId,
  topic: string,
  isCorrect: boolean,
  timeSpent: number
): void {
  const progress = getProgress();
  const today = new Date().toISOString().split('T')[0];

  // Overall
  progress.totalQuestionsSolved += 1;
  if (isCorrect) progress.totalCorrect += 1;
  else progress.totalIncorrect += 1;

  // Subject
  const sp = progress.subjectProgress[subject];
  if (sp) {
    sp.totalAttempted += 1;
    if (isCorrect) sp.totalCorrect += 1;
    sp.accuracy = sp.totalAttempted > 0 ? Math.round((sp.totalCorrect / sp.totalAttempted) * 100) : 0;
    sp.avgTimePerQuestion = sp.totalAttempted > 0
      ? Math.round(((sp.avgTimePerQuestion * (sp.totalAttempted - 1)) + timeSpent) / sp.totalAttempted)
      : timeSpent;
    sp.lastPracticed = today;
  }

  // Topic
  const tp = progress.topicProgress[topic];
  if (tp) {
    tp.totalAttempted += 1;
    if (isCorrect) tp.totalCorrect += 1;
    else tp.mistakeCount += 1;
    tp.accuracy = tp.totalAttempted > 0 ? Math.round((tp.totalCorrect / tp.totalAttempted) * 100) : 0;
    tp.avgTime = tp.totalAttempted > 0
      ? Math.round(((tp.avgTime * (tp.totalAttempted - 1)) + timeSpent) / tp.totalAttempted)
      : timeSpent;
    tp.lastPracticed = today;

    // Mastery
    if (tp.totalAttempted === 0) tp.mastery = 'not_started';
    else if (tp.totalAttempted < 5) tp.mastery = 'beginner';
    else if (tp.accuracy < 60) tp.mastery = 'learning';
    else if (tp.accuracy < 85) tp.mastery = 'proficient';
    else tp.mastery = 'mastered';
  }

  // Daily activity
  let dailyEntry = progress.dailyActivity.find(d => d.date === today);
  if (!dailyEntry) {
    dailyEntry = { date: today, questionsSolved: 0, testsCompleted: 0, timeSpent: 0, accuracy: 0 };
    progress.dailyActivity.push(dailyEntry);
  }
  dailyEntry.questionsSolved += 1;
  dailyEntry.timeSpent += Math.round(timeSpent / 60);

  // Keep only last 90 days of activity
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
  progress.dailyActivity = progress.dailyActivity.filter(d => d.date >= ninetyDaysAgo);

  updateStreakOnActivity();
  checkAchievements(progress);
  saveProgress(progress);
}

// ============================================================
// BOOKMARKS
// ============================================================
export function getBookmarks(): Bookmark[] {
  return load<Bookmark[]>(KEYS.BOOKMARKS, []);
}

export function addBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  if (!bookmarks.find(b => b.questionId === bookmark.questionId)) {
    bookmarks.push(bookmark);
    save(KEYS.BOOKMARKS, bookmarks);
  }
}

export function removeBookmark(questionId: string): void {
  const bookmarks = getBookmarks().filter(b => b.questionId !== questionId);
  save(KEYS.BOOKMARKS, bookmarks);
}

export function isBookmarked(questionId: string): boolean {
  return getBookmarks().some(b => b.questionId === questionId);
}

// ============================================================
// MISTAKES
// ============================================================
export function getMistakes(): Mistake[] {
  return load<Mistake[]>(KEYS.MISTAKES, []);
}

export function addMistake(mistake: Mistake): void {
  const mistakes = getMistakes();
  const existing = mistakes.find(m => m.questionId === mistake.questionId);
  if (existing) {
    existing.attemptCount += 1;
    existing.lastAttempted = mistake.lastAttempted;
    existing.selectedOptionId = mistake.selectedOptionId;
    existing.resolved = false;
  } else {
    mistakes.push(mistake);
  }
  save(KEYS.MISTAKES, mistakes);
}

export function resolveMistake(questionId: string): void {
  const mistakes = getMistakes();
  const mistake = mistakes.find(m => m.questionId === questionId);
  if (mistake) {
    mistake.resolved = true;
    save(KEYS.MISTAKES, mistakes);
  }
}

// ============================================================
// TEST RESULTS
// ============================================================
export function getTestResults(): TestResult[] {
  return load<TestResult[]>(KEYS.TEST_RESULTS, []);
}

export function saveTestResult(result: TestResult): void {
  const results = getTestResults();
  results.push(result);
  save(KEYS.TEST_RESULTS, results);

  // Update progress
  const progress = getProgress();
  progress.totalTests += 1;
  const today = new Date().toISOString().split('T')[0];
  const dailyEntry = progress.dailyActivity.find(d => d.date === today);
  if (dailyEntry) {
    dailyEntry.testsCompleted += 1;
  }
  saveProgress(progress);
}

// ============================================================
// CURRENT TEST (for persistence/resume)
// ============================================================
export function getCurrentTest(): TestAttempt | null {
  const raw = load<any>(KEYS.CURRENT_TEST, null);
  if (!raw) return null;
  // Convert answers back to a plain object
  return raw as TestAttempt;
}

export function saveCurrentTest(attempt: TestAttempt): void {
  // Convert Map to plain object for JSON
  const serializable = {
    ...attempt,
    answers: attempt.answers instanceof Map
      ? Object.fromEntries(attempt.answers)
      : attempt.answers,
  };
  save(KEYS.CURRENT_TEST, serializable);
}

export function clearCurrentTest(): void {
  localStorage.removeItem(KEYS.CURRENT_TEST);
}

// ============================================================
// DAILY PLAN
// ============================================================
export function getDailyPlan(): DailyPlan | null {
  const plan = load<DailyPlan | null>(KEYS.DAILY_PLAN, null);
  if (!plan) return null;
  const today = new Date().toISOString().split('T')[0];
  if (plan.date !== today) return null; // expired plan
  return plan;
}

export function generateDailyPlan(): DailyPlan {
  const progress = getProgress();
  const today = new Date().toISOString().split('T')[0];

  // Find weak topics
  const weakTopics = Object.values(progress.topicProgress)
    .filter(tp => tp.totalAttempted > 0 && tp.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy);

  // Find untouched topics
  const untouched = Object.values(progress.topicProgress)
    .filter(tp => tp.totalAttempted === 0);

  const tasks: PlanTask[] = [];
  let totalMinutes = 0;

  // Add weak topic practice
  if (weakTopics.length > 0) {
    const weak = weakTopics[0];
    tasks.push({
      id: `plan_${Date.now()}_1`,
      type: 'practice',
      subject: weak.subjectId,
      topic: weak.topicId,
      questionCount: 10,
      estimatedMinutes: 10,
      completed: false,
      description: `Practice ${weak.topicName} (${weak.accuracy}% accuracy — needs improvement)`,
    });
    totalMinutes += 10;
  }

  // Add some from each subject
  const subjectOrder: SubjectId[] = ['quantitative_aptitude', 'reasoning', 'english', 'general_awareness'];
  for (const subId of subjectOrder) {
    const subjectQuestionCount = subId === 'quantitative_aptitude' ? 10 : 8;
    tasks.push({
      id: `plan_${Date.now()}_${subId}`,
      type: 'practice',
      subject: subId,
      questionCount: subjectQuestionCount,
      estimatedMinutes: subId === 'quantitative_aptitude' ? 12 : 8,
      completed: false,
      description: `${SUBJECTS.find(s => s.id === subId)?.shortName} — ${subjectQuestionCount} questions`,
    });
    totalMinutes += subId === 'quantitative_aptitude' ? 12 : 8;
  }

  // Add a mini test
  tasks.push({
    id: `plan_${Date.now()}_test`,
    type: 'test',
    questionCount: 10,
    estimatedMinutes: 10,
    completed: false,
    description: 'Quick mixed test — 10 questions',
  });
  totalMinutes += 10;

  const plan: DailyPlan = {
    date: today,
    tasks,
    estimatedMinutes: totalMinutes,
    completed: false,
  };

  save(KEYS.DAILY_PLAN, plan);
  return plan;
}

export function completePlanTask(taskId: string): void {
  const plan = getDailyPlan();
  if (!plan) return;
  const task = plan.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    plan.completed = plan.tasks.every(t => t.completed);
    save(KEYS.DAILY_PLAN, plan);
  }
}

// ============================================================
// ACHIEVEMENTS
// ============================================================
function getDefaultAchievements(): Achievement[] {
  return [
    { id: 'first_test', name: 'First Steps', description: 'Complete your first test', icon: '🎯', isUnlocked: false, progress: 0, requirement: 1, current: 0, category: 'test' },
    { id: 'q_100', name: 'Century', description: 'Solve 100 questions', icon: '💯', isUnlocked: false, progress: 0, requirement: 100, current: 0, category: 'practice' },
    { id: 'q_500', name: 'Scholar', description: 'Solve 500 questions', icon: '📚', isUnlocked: false, progress: 0, requirement: 500, current: 0, category: 'practice' },
    { id: 'streak_7', name: 'Weekly Warrior', description: 'Maintain a 7-day study streak', icon: '🔥', isUnlocked: false, progress: 0, requirement: 7, current: 0, category: 'streak' },
    { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day study streak', icon: '⚡', isUnlocked: false, progress: 0, requirement: 30, current: 0, category: 'streak' },
    { id: 'accuracy_90', name: 'Sharpshooter', description: 'Achieve 90%+ accuracy in a test', icon: '🎯', isUnlocked: false, progress: 0, requirement: 90, current: 0, category: 'accuracy' },
    { id: 'speed_master', name: 'Speed Demon', description: 'Average under 30 seconds per question in a test', icon: '⏱️', isUnlocked: false, progress: 0, requirement: 1, current: 0, category: 'speed' },
    { id: 'mistake_recovery', name: 'Comeback Kid', description: 'Resolve 10 mistakes', icon: '💪', isUnlocked: false, progress: 0, requirement: 10, current: 0, category: 'mastery' },
    { id: 'all_subjects', name: 'All-Rounder', description: 'Practice from all 4 subjects', icon: '🌟', isUnlocked: false, progress: 0, requirement: 4, current: 0, category: 'practice' },
    { id: 'topic_mastery', name: 'Topic Expert', description: 'Master any topic (85%+ accuracy, 10+ questions)', icon: '🏆', isUnlocked: false, progress: 0, requirement: 1, current: 0, category: 'mastery' },
  ];
}

function checkAchievements(progress: UserProgress): void {
  const achievements = progress.achievements;

  for (const ach of achievements) {
    switch (ach.id) {
      case 'first_test':
        ach.current = progress.totalTests;
        break;
      case 'q_100':
      case 'q_500':
        ach.current = progress.totalQuestionsSolved;
        break;
      case 'streak_7':
      case 'streak_30':
        ach.current = progress.studyStreak;
        break;
      case 'all_subjects': {
        const practiced = Object.values(progress.subjectProgress).filter(sp => sp.totalAttempted > 0).length;
        ach.current = practiced;
        break;
      }
      case 'topic_mastery': {
        const mastered = Object.values(progress.topicProgress).filter(tp => tp.mastery === 'mastered').length;
        ach.current = mastered;
        break;
      }
      case 'mistake_recovery': {
        const resolved = getMistakes().filter(m => m.resolved).length;
        ach.current = resolved;
        break;
      }
    }
    ach.progress = Math.min(100, Math.round((ach.current / ach.requirement) * 100));
    if (ach.current >= ach.requirement && !ach.isUnlocked) {
      ach.isUnlocked = true;
      ach.unlockedAt = new Date().toISOString();
    }
  }
}

// ============================================================
// RECOMMENDATIONS
// ============================================================
export function getStudyRecommendations(): { type: string; priority: string; subject: SubjectId; topic?: string; reason: string; action: string; questionCount?: number }[] {
  const progress = getProgress();
  const recommendations: { type: string; priority: string; subject: SubjectId; topic?: string; reason: string; action: string; questionCount?: number }[] = [];

  // 1. Weak topics
  const weakTopics = Object.values(progress.topicProgress)
    .filter(tp => tp.totalAttempted >= 3 && tp.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  for (const wt of weakTopics.slice(0, 2)) {
    recommendations.push({
      type: 'practice',
      priority: 'high',
      subject: wt.subjectId,
      topic: wt.topicId,
      reason: `Your accuracy in ${wt.topicName} is ${wt.accuracy}%. Let's improve this.`,
      action: `Practice 10 ${wt.topicName} questions`,
      questionCount: 10,
    });
  }

  // 2. Untouched subjects
  for (const [subId, sp] of Object.entries(progress.subjectProgress)) {
    if (sp.totalAttempted === 0) {
      const subject = SUBJECTS.find(s => s.id === subId);
      if (subject) {
        recommendations.push({
          type: 'practice',
          priority: 'medium',
          subject: subId as SubjectId,
          reason: `You haven't started ${subject.shortName} yet. Begin with some easy questions.`,
          action: `Start ${subject.shortName}`,
          questionCount: 5,
        });
      }
    }
  }

  // 3. Slow topics
  const slowTopics = Object.values(progress.topicProgress)
    .filter(tp => tp.totalAttempted >= 5 && tp.avgTime > 90)
    .sort((a, b) => b.avgTime - a.avgTime);

  for (const st of slowTopics.slice(0, 1)) {
    recommendations.push({
      type: 'practice',
      priority: 'medium',
      subject: st.subjectId,
      topic: st.topicId,
      reason: `Your average time for ${st.topicName} is ${st.avgTime}s. Try speed practice.`,
      action: `Speed practice — ${st.topicName}`,
      questionCount: 10,
    });
  }

  // 4. Mistakes to revisit
  const unresolvedMistakes = getMistakes().filter(m => !m.resolved);
  if (unresolvedMistakes.length >= 5) {
    recommendations.push({
      type: 'review',
      priority: 'medium',
      subject: unresolvedMistakes[0].question.subject,
      reason: `You have ${unresolvedMistakes.length} unresolved mistakes. Let's fix them.`,
      action: 'Review Mistakes',
      questionCount: Math.min(10, unresolvedMistakes.length),
    });
  }

  // 5. Test suggestion
  if (progress.totalQuestionsSolved > 20 && progress.totalTests < 3) {
    recommendations.push({
      type: 'test',
      priority: 'low',
      subject: 'quantitative_aptitude',
      reason: 'You\'ve practiced enough questions. Time to test yourself!',
      action: 'Take a Quick Test',
      questionCount: 15,
    });
  }

  return recommendations;
}

// ============================================================
// CLEAR ALL DATA (for testing/reset)
// ============================================================
export function clearAllData(): void {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}
