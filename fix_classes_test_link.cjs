const fs = require('fs');
let content = fs.readFileSync('src/views/ClassesView.tsx', 'utf8');

// Find the tests card link: onClick={() => onNavigate('tests')}
// We want to replace it with a proper navigation route or hash.

content = content.replace(
  "onClick={() => onNavigate('tests')}",
  "onClick={() => { window.location.hash = `tests/${selectedClass}/${selectedSubjectSlug}/${selectedBookSlug}/${selectedChapterSlug}` }}"
);

fs.writeFileSync('src/views/ClassesView.tsx', content);
