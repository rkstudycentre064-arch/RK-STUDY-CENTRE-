const fs = require('fs');
let content = fs.readFileSync('src/views/TestsView.tsx', 'utf8');
content = content.replace(
  "ListOrdered",
  "ListOrdered,\n  ArrowRight"
);
fs.writeFileSync('src/views/TestsView.tsx', content);
