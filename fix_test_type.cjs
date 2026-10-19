const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');
content = content.replace(
  "export type TestType = 'online_test' | 'chapter_test' | 'subject_test';",
  "export type TestType = 'online_test' | 'chapter_test' | 'subject_test' | 'practice_quiz' | 'objective_test';"
);
fs.writeFileSync('src/types/index.ts', content);
