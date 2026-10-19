const fs = require('fs');
let content = fs.readFileSync('src/lib/constants.ts', 'utf8');

const testsRegex = /export const TESTS: TestItem\[\] = \[[\s\S]*?\];/;
const newTests = `export const TESTS: TestItem[] = [
  {
    id: 'test-01',
    slug: 'test-01',
    classLevel: 'class-10',
    subjectId: 'hindi',
    bookId: 'godhuli-part-2',
    chapterId: 'chapter-01',
    title: 'श्रम विभाजन और जाति प्रथा - Objective Test',
    type: 'chapter_test',
    totalQuestions: 5,
    durationMinutes: 10,
    totalMarks: 5,
    passingMarks: 3,
    isNegativeMarking: false,
    difficulty: 'Easy',
  },
  {
    id: 'test-02',
    slug: 'test-02',
    classLevel: 'class-10',
    subjectId: 'hindi',
    bookId: 'godhuli-part-2',
    chapterId: 'chapter-01',
    title: 'अभ्यास क्विज़ (Practice Quiz)',
    type: 'practice_quiz',
    totalQuestions: 5,
    durationMinutes: 0,
    totalMarks: 5,
    passingMarks: 0,
    isNegativeMarking: false,
    difficulty: 'Medium',
  }
];

export const TEST_QUESTIONS = [
  {
    id: 'q-1',
    testId: 'test-01',
    classId: 'class-10',
    subjectId: 'hindi',
    bookId: 'godhuli-part-2',
    chapterId: 'chapter-01',
    question: "'श्रम विभाजन और जाति प्रथा' पाठ के लेखक कौन हैं?",
    options: ['महात्मा गांधी', 'भीमराव अंबेडकर', 'राममनोहर लोहिया', 'जवाहरलाल नेहरू'],
    correctOption: 1,
    marks: 1,
    order: 1
  },
  {
    id: 'q-2',
    testId: 'test-01',
    classId: 'class-10',
    subjectId: 'hindi',
    bookId: 'godhuli-part-2',
    chapterId: 'chapter-01',
    question: "जाति प्रथा किस प्रकार का श्रम विभाजन है?",
    options: ['स्वाभाविक', 'अस्वाभाविक', 'प्राकृतिक', 'इनमें से कोई नहीं'],
    correctOption: 1,
    marks: 1,
    order: 2
  },
  {
    id: 'q-3',
    testId: 'test-01',
    classId: 'class-10',
    subjectId: 'hindi',
    bookId: 'godhuli-part-2',
    chapterId: 'chapter-01',
    question: "डॉ. अंबेडकर का जन्म किस राज्य में हुआ था?",
    options: ['उत्तर प्रदेश', 'मध्य प्रदेश', 'बिहार', 'महाराष्ट्र'],
    correctOption: 1,
    marks: 1,
    order: 3
  },
  {
    id: 'q-4',
    testId: 'test-01',
    classId: 'class-10',
    subjectId: 'hindi',
    bookId: 'godhuli-part-2',
    chapterId: 'chapter-01',
    question: "लेखक की दृष्टि में विडंबना की बात क्या है?",
    options: ['जातिवाद के पोषकों की कमी नहीं है', 'जातिवाद के पोषक नगण्य हैं', 'आर्थिक दृष्टि से जातिवाद उचित है', 'जातिवाद लोकतंत्र के विरुद्ध नहीं है'],
    correctOption: 0,
    marks: 1,
    order: 4
  },
  {
    id: 'q-5',
    testId: 'test-01',
    classId: 'class-10',
    subjectId: 'hindi',
    bookId: 'godhuli-part-2',
    chapterId: 'chapter-01',
    question: "आधुनिक सभ्य समाज कार्य कुशलता के लिए किसे आवश्यक मानता है?",
    options: ['श्रम विभाजन', 'धन विभाजन', 'जन विभाजन', 'जाति विभाजन'],
    correctOption: 0,
    marks: 1,
    order: 5
  }
];
`;

content = content.replace(testsRegex, newTests);
fs.writeFileSync('src/lib/constants.ts', content);
