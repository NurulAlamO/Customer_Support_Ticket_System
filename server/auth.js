const crypto = require('crypto');

function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hashPassword(password) {
  return `sha256:${hashValue(password)}`;
}

function verifyPassword(password, storedHash) {
  return storedHash === hashPassword(password);
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateSessionToken,
  hashPassword,
  hashValue,
  verifyPassword,
};
