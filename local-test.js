// Entry point for the local Square sandbox test (run by START-TEST.bat, or `npm run test:square`).
// Asks for the sandbox access token if it is not already set, checks it with Square, then starts
// the server in local test mode. The token is kept in memory only and never written to disk.
require('dotenv').config();
process.env.ALLOW_LOCAL_TEST = '1';
process.env.SQUARE_ENV = 'sandbox';
const readline = require('readline');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;

async function checkToken(token) {
  try {
    const r = await fetch('https://connect.squareupsandbox.com/v2/locations', {
      headers: { Authorization: `Bearer ${token}`, 'Square-Version': '2025-01-23' },
    });
    if (r.status === 401) return 'bad';
    return r.ok ? 'ok' : 'unknown';
  } catch { return 'unreachable'; }
}

async function main() {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    console.log('\n============================================================');
    console.log(' ONE STEP: paste your Square SANDBOX access token.');
    console.log(' 1. In Chrome, click the copy icon next to "Sandbox Access token".');
    console.log(' 2. Come back to THIS window.');
    console.log(' 3. RIGHT-CLICK anywhere inside it, then press Enter.');
    console.log('============================================================');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(res => rl.question('Token: ', res));
    rl.close();
    const token = String(answer).trim();
    if (!token) { console.log('\nNothing was pasted. Close this window and run START-TEST again.'); process.exit(1); }
    process.env.SQUARE_ACCESS_TOKEN = token;
  }

  const check = await checkToken(process.env.SQUARE_ACCESS_TOKEN);
  if (check === 'bad') {
    console.log('\nSquare rejected that token. Make sure Sandbox (not Production) is selected on the Credentials page, copy the token again, and run START-TEST again.');
    process.exit(1);
  }
  console.log(check === 'ok' ? '\nSquare accepted the token.' : '\n(Could not verify the token with Square right now; continuing.)');

  require('./server');
  if (process.platform === 'win32') setTimeout(() => exec(`start "" http://localhost:${PORT}/square-test`), 1500);
  console.log(`\nTest page: http://localhost:${PORT}/square-test  (opening it now). Leave this window open while you test. Close it to stop.`);
}
main();
