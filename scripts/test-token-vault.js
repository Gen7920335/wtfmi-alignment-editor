const fs = require('fs');
const path = require('path');
const { webcrypto } = require('crypto');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const start = source.indexOf('  async function createEncryptedTokenVault');
const end = source.indexOf('  function githubApiUrl', start);
if (start < 0 || end < 0) throw new Error('Token vault functions not found');

const factory = new Function('crypto', 'TOKEN_VAULT', 'TextEncoder', 'TextDecoder', 'btoa', 'atob', `
${source.slice(start, end)}
return { createEncryptedTokenVault, decryptTokenVault };
`);
const api = factory(webcrypto, {
  storageKey: 'test', schema: 'wtfmi-encrypted-github-token-v2',
  passwordLength: 10, randomKeyLength: 47, pbkdf2Iterations: 600000
}, TextEncoder, TextDecoder, btoa, atob);

(async () => {
  const token = 'github_pat_test_token_not_a_real_credential';
  const password = 'A1b2C3d4E5';
  const vault = await api.createEncryptedTokenVault(token, password);
  const serialized = JSON.stringify(vault);
  if (vault.randomKeyLength !== 47) throw new Error('Random key length metadata mismatch');
  if (serialized.includes(token) || serialized.includes(password)) throw new Error('Plaintext leaked into vault');
  if (await api.decryptTokenVault(vault, password) !== token) throw new Error('Round-trip failed');
  let wrongPasswordRejected = false;
  try { await api.decryptTokenVault(vault, 'Z9y8X7w6V5'); } catch { wrongPasswordRejected = true; }
  if (!wrongPasswordRejected) throw new Error('Wrong password was accepted');
  console.log('Token vault passed: AES-256-GCM, 47-char random key, exact round-trip, wrong-password rejection');
})().catch(error => { console.error(error); process.exitCode = 1; });
