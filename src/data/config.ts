import { ExamConfig, ExamType, Subject, SubjectId, Topic } from '../types';

// ============================================================
// Exam Configurations
// ============================================================
export const EXAM_CONFIGS: Record<ExamType, ExamConfig> = {
  SSC_CGL: {
    id: 'SSC_CGL',
    name: 'SSC CGL',
    fullName: 'Combined Graduate Level Examination',
    description: 'For graduate-level posts in various government ministries, departments, and organizations.',
    totalMarks: 200,
    totalQuestions: 100,
    durationMinutes: 60,
    negativeMark: 0.5,
    markPerQuestion: 2,
    sections: ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English', 'General Awareness'],
    tiers: ['Tier I', 'Tier II'],
  },
  SSC_CHSL: {
    id: 'SSC_CHSL',
    name: 'SSC CHSL',
    fullName: 'Combined Higher Secondary Level Examination',
    description: 'For 12th pass candidates for LDC, DEO, PA/SA, and other posts.',
    totalMarks: 200,
    totalQuestions: 100,
    durationMinutes: 60,
    negativeMark: 0.5,
    markPerQuestion: 2,
    sections: ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English', 'General Awareness'],
    tiers: ['Tier I', 'Tier II'],
  },
  SSC_MTS: {
    id: 'SSC_MTS',
    name: 'SSC MTS',
    fullName: 'Multi Tasking Staff Examination',
    description: 'For 10th pass candidates for non-technical multi-tasking posts.',
    totalMarks: 150,
    totalQuestions: 75,
    durationMinutes: 90,
    negativeMark: 0.25,
    markPerQuestion: 2,
    sections: ['Numerical Aptitude', 'General Intelligence & Reasoning', 'English', 'General Awareness'],
    tiers: ['Paper I'],
  },
  SSC_CPO: {
    id: 'SSC_CPO',
    name: 'SSC CPO',
    fullName: 'Central Police Organization Examination',
    description: 'For Sub-Inspector posts in Delhi Police, CAPF, and CISF.',
    totalMarks: 200,
    totalQuestions: 200,
    durationMinutes: 120,
    negativeMark: 0.25,
    markPerQuestion: 1,
    sections: ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English', 'General Awareness'],
    tiers: ['Paper I', 'Paper II'],
  },
  SSC_GD: {
    id: 'SSC_GD',
    name: 'SSC GD',
    fullName: 'General Duty Constable Examination',
    description: 'For Constable (GD) posts in CAPFs, NIA, SSF, and Rifleman in Assam Rifles.',
    totalMarks: 160,
    totalQuestions: 80,
    durationMinutes: 60,
    negativeMark: 0.5,
    markPerQuestion: 2,
    sections: ['General Intelligence & Reasoning', 'General Knowledge', 'Elementary Mathematics', 'English/Hindi'],
    tiers: ['CBE'],
  },
};

// ============================================================
// Topics per Subject
// ============================================================
const quantTopics: Topic[] = [
  { id: 'number_system', name: 'Number System', subjectId: 'quantitative_aptitude', description: 'HCF, LCM, divisibility rules, remainders, and number properties', questionCount: 25, difficulty: 'mixed' },
  { id: 'simplification', name: 'Simplification', subjectId: 'quantitative_aptitude', description: 'BODMAS, fractions, decimals, surds, and indices', questionCount: 20, difficulty: 'easy' },
  { id: 'percentage', name: 'Percentage', subjectId: 'quantitative_aptitude', description: 'Percentage calculations, increase/decrease, successive changes', questionCount: 25, difficulty: 'mixed' },
  { id: 'profit_loss', name: 'Profit & Loss', subjectId: 'quantitative_aptitude', description: 'Cost price, selling price, markup, discount, and successive transactions', questionCount: 20, difficulty: 'mixed' },
  { id: 'ratio_proportion', name: 'Ratio & Proportion', subjectId: 'quantitative_aptitude', description: 'Ratios, proportions, and mixture problems', questionCount: 20, difficulty: 'mixed' },
  { id: 'average', name: 'Average', subjectId: 'quantitative_aptitude', description: 'Mean, weighted average, and related problems', questionCount: 15, difficulty: 'easy' },
  { id: 'time_work', name: 'Time & Work', subjectId: 'quantitative_aptitude', description: 'Work efficiency, pipes and cisterns, and collaborative work', questionCount: 20, difficulty: 'mixed' },
  { id: 'time_speed_distance', name: 'Time, Speed & Distance', subjectId: 'quantitative_aptitude', description: 'Relative speed, trains, boats, and circular motion', questionCount: 20, difficulty: 'hard' },
  { id: 'algebra', name: 'Algebra', subjectId: 'quantitative_aptitude', description: 'Linear equations, quadratic equations, polynomials, and identities', questionCount: 20, difficulty: 'mixed' },
  { id: 'geometry', name: 'Geometry', subjectId: 'quantitative_aptitude', description: 'Lines, angles, triangles, circles, quadrilaterals, and coordinate geometry', questionCount: 25, difficulty: 'hard' },
  { id: 'mensuration', name: 'Mensuration', subjectId: 'quantitative_aptitude', description: 'Area, perimeter, volume, and surface area of 2D/3D shapes', questionCount: 20, difficulty: 'mixed' },
  { id: 'trigonometry', name: 'Trigonometry', subjectId: 'quantitative_aptitude', description: 'Trigonometric ratios, identities, heights and distances', questionCount: 20, difficulty: 'hard' },
  { id: 'data_interpretation', name: 'Data Interpretation', subjectId: 'quantitative_aptitude', description: 'Tables, bar graphs, pie charts, line graphs, and mixed DI', questionCount: 15, difficulty: 'mixed' },
  { id: 'interest', name: 'Simple & Compound Interest', subjectId: 'quantitative_aptitude', description: 'SI, CI, installments, and growth calculations', questionCount: 15, difficulty: 'mixed' },
  { id: 'mixture_alligation', name: 'Mixture & Alligation', subjectId: 'quantitative_aptitude', description: 'Mixing solutions, alligation method', questionCount: 10, difficulty: 'medium' },
];

const reasoningTopics: Topic[] = [
  { id: 'analogy', name: 'Analogy', subjectId: 'reasoning', description: 'Word, number, and letter analogies', questionCount: 20, difficulty: 'mixed' },
  { id: 'classification', name: 'Classification', subjectId: 'reasoning', description: 'Odd one out from words, numbers, or letters', questionCount: 15, difficulty: 'easy' },
  { id: 'series', name: 'Series', subjectId: 'reasoning', description: 'Number series, letter series, and mixed series', questionCount: 25, difficulty: 'mixed' },
  { id: 'coding_decoding', name: 'Coding-Decoding', subjectId: 'reasoning', description: 'Letter coding, number coding, and mixed coding systems', questionCount: 20, difficulty: 'mixed' },
  { id: 'blood_relations', name: 'Blood Relations', subjectId: 'reasoning', description: 'Family tree problems and relationship identification', questionCount: 15, difficulty: 'medium' },
  { id: 'direction_sense', name: 'Direction Sense', subjectId: 'reasoning', description: 'Direction-based problems and distance calculations', questionCount: 15, difficulty: 'easy' },
  { id: 'syllogism', name: 'Syllogism', subjectId: 'reasoning', description: 'Statement and conclusion, logical deductions', questionCount: 15, difficulty: 'hard' },
  { id: 'puzzle', name: 'Puzzle', subjectId: 'reasoning', description: 'Arrangement, scheduling, and logic puzzles', questionCount: 20, difficulty: 'hard' },
  { id: 'seating_arrangement', name: 'Seating Arrangement', subjectId: 'reasoning', description: 'Linear and circular seating arrangements', questionCount: 15, difficulty: 'hard' },
  { id: 'venn_diagrams', name: 'Venn Diagrams', subjectId: 'reasoning', description: 'Logical Venn diagrams and set-based reasoning', questionCount: 10, difficulty: 'easy' },
  { id: 'number_alphabet_logic', name: 'Number & Alphabet Logic', subjectId: 'reasoning', description: 'Ranking, mathematical operations, and alphabet-based problems', questionCount: 15, difficulty: 'mixed' },
  { id: 'counting_figures', name: 'Counting Figures', subjectId: 'reasoning', description: 'Counting triangles, squares, and other shapes in a figure', questionCount: 10, difficulty: 'medium' },
];

const englishTopics: Topic[] = [
  { id: 'vocabulary', name: 'Vocabulary', subjectId: 'english', description: 'Word meanings, usage, and contextual vocabulary', questionCount: 15, difficulty: 'mixed' },
  { id: 'synonyms', name: 'Synonyms', subjectId: 'english', description: 'Identify words with similar meanings', questionCount: 15, difficulty: 'easy' },
  { id: 'antonyms', name: 'Antonyms', subjectId: 'english', description: 'Identify words with opposite meanings', questionCount: 15, difficulty: 'easy' },
  { id: 'one_word_substitution', name: 'One Word Substitution', subjectId: 'english', description: 'Replace phrases with a single word', questionCount: 15, difficulty: 'medium' },
  { id: 'idioms_phrases', name: 'Idioms & Phrases', subjectId: 'english', description: 'Meaning and usage of common idioms and phrases', questionCount: 15, difficulty: 'medium' },
  { id: 'error_detection', name: 'Error Detection', subjectId: 'english', description: 'Spot grammatical errors in sentences', questionCount: 20, difficulty: 'mixed' },
  { id: 'sentence_improvement', name: 'Sentence Improvement', subjectId: 'english', description: 'Improve sentences by replacing the underlined part', questionCount: 20, difficulty: 'mixed' },
  { id: 'fill_blanks', name: 'Fill in the Blanks', subjectId: 'english', description: 'Complete sentences with appropriate words', questionCount: 15, difficulty: 'mixed' },
  { id: 'cloze_test', name: 'Cloze Test', subjectId: 'english', description: 'Fill multiple blanks in a passage', questionCount: 10, difficulty: 'hard' },
  { id: 'active_passive', name: 'Active & Passive Voice', subjectId: 'english', description: 'Convert between active and passive voice', questionCount: 10, difficulty: 'medium' },
  { id: 'direct_indirect', name: 'Direct & Indirect Speech', subjectId: 'english', description: 'Convert between direct and indirect narration', questionCount: 10, difficulty: 'medium' },
  { id: 'reading_comprehension', name: 'Reading Comprehension', subjectId: 'english', description: 'Understand and answer questions based on passages', questionCount: 15, difficulty: 'hard' },
];

const gaTopics: Topic[] = [
  { id: 'history', name: 'History', subjectId: 'general_awareness', description: 'Ancient, Medieval, and Modern Indian History', questionCount: 20, difficulty: 'mixed' },
  { id: 'geography', name: 'Geography', subjectId: 'general_awareness', description: 'Indian and World Geography, Physical Geography', questionCount: 15, difficulty: 'mixed' },
  { id: 'polity', name: 'Indian Polity', subjectId: 'general_awareness', description: 'Constitution, governance, and political system', questionCount: 20, difficulty: 'mixed' },
  { id: 'economics', name: 'Economics', subjectId: 'general_awareness', description: 'Indian economy, banking, budget, and fiscal policies', questionCount: 15, difficulty: 'mixed' },
  { id: 'science', name: 'General Science', subjectId: 'general_awareness', description: 'Physics, Chemistry, Biology, and everyday science', questionCount: 25, difficulty: 'mixed' },
  { id: 'static_gk', name: 'Static GK', subjectId: 'general_awareness', description: 'Countries, capitals, currencies, dams, rivers, national symbols', questionCount: 15, difficulty: 'easy' },
  { id: 'awards_honors', name: 'Awards & Honours', subjectId: 'general_awareness', description: 'National and international awards, honors, and prizes', questionCount: 10, difficulty: 'easy' },
  { id: 'culture', name: 'Indian Culture', subjectId: 'general_awareness', description: 'Art, dance, music, festivals, and cultural heritage', questionCount: 10, difficulty: 'medium' },
];

// ============================================================
// Subjects
// ============================================================
export const SUBJECTS: Subject[] = [
  {
    id: 'quantitative_aptitude',
    name: 'Quantitative Aptitude',
    shortName: 'Quant',
    icon: '📐',
    color: '#6366f1',
    description: 'Master numbers, algebra, geometry, and data interpretation',
    topics: quantTopics,
  },
  {
    id: 'reasoning',
    name: 'General Intelligence & Reasoning',
    shortName: 'Reasoning',
    icon: '🧩',
    color: '#f59e0b',
    description: 'Sharpen logical thinking, pattern recognition, and analytical skills',
    topics: reasoningTopics,
  },
  {
    id: 'english',
    name: 'English Language',
    shortName: 'English',
    icon: '📝',
    color: '#10b981',
    description: 'Build vocabulary, grammar, and comprehension skills',
    topics: englishTopics,
  },
  {
    id: 'general_awareness',
    name: 'General Awareness',
    shortName: 'GA',
    icon: '🌍',
    color: '#ef4444',
    description: 'Stay informed about history, geography, polity, science, and current affairs',
    topics: gaTopics,
  },
];

export function getSubject(id: SubjectId): Subject | undefined {
  return SUBJECTS.find(s => s.id === id);
}

export function getTopic(topicId: string): Topic | undefined {
  for (const subject of SUBJECTS) {
    const topic = subject.topics.find(t => t.id === topicId);
    if (topic) return topic;
  }
  return undefined;
}

export function getSubjectForTopic(topicId: string): Subject | undefined {
  for (const subject of SUBJECTS) {
    if (subject.topics.some(t => t.id === topicId)) return subject;
  }
  return undefined;
}
