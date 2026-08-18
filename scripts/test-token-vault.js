const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const vaultText = fs.readFileSync(path.join(root, 'config', 'token-vault.json'), 'utf8');
const vault = JSON.parse(vaultText);
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

if (vault.schema !== 'wtfmi-encrypted-github-token-v2') throw new Error('Unexpected vault schema');
if (vault.algorithm !== 'AES-256-GCM') throw new Error('Unexpected vault algorithm');
if (vault.passwordLength !== 10) throw new Error('Password length metadata mismatch');
if (vault.randomKeyLength !== 47) throw new Error('Random key length metadata mismatch');
if (vault.kdf?.iterations !== 600000) throw new Error('PBKDF2 iteration mismatch');
if (!vault.wrappedKey?.ciphertext || !vault.token?.ciphertext) throw new Error('Ciphertext is missing');
if (/github_pat_|ghp_|gho_/i.test(vaultText)) throw new Error('Plaintext credential leaked into the vault');
for (const removedId of ['githubTokenSetup', 'githubTokenInput', 'githubPasswordConfirmInput', 'githubEncryptTokenButton', 'githubExportTokenButton', 'githubImportTokenInput']) {
  if (html.includes(removedId) || app.includes(removedId)) throw new Error(`Removed setup control remains: ${removedId}`);
}
if (!app.includes("fetch('./config/token-vault.json'")) throw new Error('Hosted vault loader is missing');
console.log('Hosted vault passed: encrypted payload only, 47-char key metadata, 10-char password metadata, no setup UI');
