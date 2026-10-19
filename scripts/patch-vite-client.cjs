const fs = require('fs');
const path = require('path');

const clientPath = path.resolve(__dirname, '../node_modules/vite/dist/client/client.mjs');

if (fs.existsSync(clientPath)) {
  let content = fs.readFileSync(clientPath, 'utf8');
  let modified = false;

  if (content.includes('ws.send(JSON.stringify(data));')) {
    content = content.replace(
      'ws.send(JSON.stringify(data));',
      'ws?.send?.(JSON.stringify(data));'
    );
    modified = true;
  }

  if (content.includes('error: (err) => console.error("[vite]", err),')) {
    content = content.replace(
      'error: (err) => console.error("[vite]", err),',
      'error: (err) => { if (err && (String(err).includes("send") || String(err).includes("WebSocket"))) return; console.error("[vite]", err); },'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(clientPath, content, 'utf8');
    console.log('[patch-vite-client] Successfully patched Vite client for WebSocket resilience.');
  }
}
