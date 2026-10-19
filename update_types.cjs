const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');
content = content.replace(
`export interface TestItem {
  id: string;
  slug?: string;
  classLevel: ClassLevel;
  subjectId: string;
  chapterId?: string;`,
`export interface TestItem {
  id: string;
  slug?: string;
  classLevel: ClassLevel;
  subjectId: string;
  bookId: string;
  chapterId: string;`
);

// We need a TestQuestion type too
const questionType = `
export interface TestQuestion {
  id: string;
  testId: string;
  classId: ClassLevel;
  subjectId: string;
  bookId: string;
  chapterId: string;
  question: string;
  options: [string, string, string, string];
  correctOption: 0 | 1 | 2 | 3;
  explanation?: string;
  marks: number;
  order: number;
}
`;

content = content + questionType;

fs.writeFileSync('src/types/index.ts', content);
