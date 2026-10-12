import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const ignored = new Set(['.git', 'node_modules', '.astro', 'dist', 'artifacts']);
const rules = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['provider-token', /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|AIza[A-Za-z0-9_-]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{32,})/],
  ['local-user-path', /(?:[A-Z]:[\\/](?:Users|PORTFOLIO|site-factory|JOB)[\\/]|\/Users\/|\/home\/[^\s/]+\/)/i],
  ['private-deployment-origin', /https?:\/\/[^\s"<>]+\.(?:pages|workers)\.dev/],
];
const findings = [];
let files = 0;
function walk(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue;
    const path = join(directory, item.name);
    if (item.isDirectory()) walk(path);
    else {
      const name = relative(root, path).replaceAll('\\', '/');
      files++;
      if (item.name.startsWith('.env') && item.name !== '.env.example') findings.push({ path: name, rule: 'environment-file' });
      if (!/\.(?:ts|tsx|mjs|astro|css|svg|json|jsonc|md|yml|yaml|csv|txt)$/.test(name) && !['LICENSE', '.env.example', '.gitignore'].includes(item.name)) continue;
      const text = readFileSync(path, 'utf8');
      for (const [rule, pattern] of rules) {
        if (pattern.test(text)) findings.push({ path: name, rule });
      }
    }
  }
}
walk(root);
if (findings.length) {
  // Never print matched values: only paths and categories.
  console.error(JSON.stringify({ files, findings }, null, 2));
  process.exitCode = 1;
} else console.log(`Public-content guard passed across ${files} files. Manual review still required.`);
