/**
 * Decrypt CREDENTIALS.enc file
 * Usage: node scripts/decrypt-credentials.js <passphrase>
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const passphrase = process.argv[2];

if (!passphrase) {
  console.error('Usage: node scripts/decrypt-credentials.js <passphrase>');
  process.exit(1);
}

const encFile = path.join(__dirname, '..', 'CREDENTIALS.enc');

if (!fs.existsSync(encFile)) {
  console.error('CREDENTIALS.enc not found');
  process.exit(1);
}

try {
  const content = fs.readFileSync(encFile, 'utf8');
  const [ivHex, encrypted] = content.split(':');
  const key = crypto.scryptSync(passphrase, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  console.log(decrypted);
} catch (err) {
  console.error('Decryption failed. Wrong passphrase?');
  process.exit(1);
}
