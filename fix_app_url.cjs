const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "urlParts={hash ? hash.substring(1).split('/') : (pathname.startsWith('/tests') ? pathname.substring(1).split('/') : [])}",
  "urlParts={window.location.hash ? window.location.hash.substring(1).split('/') : (window.location.pathname.startsWith('/tests') ? window.location.pathname.substring(1).split('/') : [])}"
);
fs.writeFileSync('src/App.tsx', content);
