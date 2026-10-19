const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The tests route parsing
const oldTests = "} else if (pathSource === 'tests') {\\n        setCurrentRoute('tests');";
const newTests = `} else if (pathSource.startsWith('tests')) {
        setCurrentRoute('tests');
        const parts = pathSource.split('/');
        
        // Handle normal tests routing
        if (parts[1] && ['class-9', 'class-10', 'class-11', 'class-12'].includes(parts[1])) {
          setSelectedClass(parts[1]);
        }
        
        // Structure: tests/class-10/hindi/godhuli/chapter-01/test-id
        // We will store test-id in a state if needed, or pass it. Let's add selectedTestId state.
        
        setSelectedSubjectSlug(parts[2] || undefined);
        setSelectedBookSlug(parts[3] || undefined);
        setSelectedChapterSlug(parts[4] || undefined);
        
        // If there's a test ID, we'll need to parse it. Let's assume parts[5] might be the test ID if parts[4] is the chapter.
        // Actually the easiest is to just pass the whole thing and let TestsView handle it, or we add state.
`;
content = content.replace(
  "} else if (pathSource === 'tests') {\n        setCurrentRoute('tests');",
  `} else if (pathSource.startsWith('tests')) {
        setCurrentRoute('tests');
        const parts = pathSource.split('/');
        if (parts[1] === 'result') {
          // It's a result page: /tests/result/result-id
          // We can handle this inside TestsView
        } else if (parts[1] && ['class-9', 'class-10', 'class-11', 'class-12'].includes(parts[1])) {
          setSelectedClass(parts[1]);
        }
        setSelectedSubjectSlug(parts[2] || undefined);
        setSelectedBookSlug(parts[3] || undefined);
        setSelectedChapterSlug(parts[4] || undefined);
        // We need a way to pass testId. Let's just pass parts down.
`
);

// We need to pass the parts to TestsView
content = content.replace(
  "{currentRoute === 'tests' && <TestsView onNavigate={navigateTo} />}",
  `{currentRoute === 'tests' && (
          <TestsView 
            initialClass={selectedClass}
            initialSubjectSlug={selectedSubjectSlug}
            initialBookSlug={selectedBookSlug}
            initialChapterSlug={selectedChapterSlug}
            urlParts={hash ? hash.substring(1).split('/') : (pathname.startsWith('/tests') ? pathname.substring(1).split('/') : [])}
            onNavigate={navigateTo} 
          />
        )}`
);

fs.writeFileSync('src/App.tsx', content);
