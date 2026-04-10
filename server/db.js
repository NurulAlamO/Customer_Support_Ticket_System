const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const databaseName = process.env.DB_NAME || 'ticket_system';
const schemaPath = path.join(__dirname, 'schema.sql');
const seedPath = path.join(__dirname, 'seed.sql');
let pool;
const defaultPasswordHash = 'sha256:ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

function getSqlStatements(filePath, options = {}) {
  const sql = fs.readFileSync(filePath, 'utf8');
  let normalizedSql = sql;

  if (options.stripCreateDatabase) {
    normalizedSql = normalizedSql.replace(/CREATE DATABASE IF NOT EXISTS[\s\S]*?;\s*/i, '');
  }

  if (options.stripUseDatabase) {
    normalizedSql = normalizedSql.replace(/USE[\s\S]*?;\s*/i, '');
  }

  return normalizedSql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function runStatements(statements) {
  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function seedDatabaseIfEmpty() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');

  if (Number(row.totalUsers) > 0) {
    return;
  }

  const seedStatements = getSqlStatements(seedPath, { stripUseDatabase: true });
  await runStatements(seedStatements);
}

async function syncSampleUserCredentials() {
  const sampleUsers = [
    { id: 1, email: 'john@example.com', passwordHash: defaultPasswordHash },
    { id: 2, email: 'emma@example.com', passwordHash: defaultPasswordHash },
    { id: 3, email: 'michael@example.com', passwordHash: defaultPasswordHash },
    { id: 4, email: 'sophia@example.com', passwordHash: defaultPasswordHash },
    { id: 5, email: 'olivia@example.com', passwordHash: defaultPasswordHash },
    {
      id: 6,
      email: 'support@example.com',
      passwordHash: 'sha256:a67d22cef2f6639d71b8901b5b2bbee4a2400d92c70e60c179c0fd76d72d6c23',
    },
  ];

  for (const sampleUser of sampleUsers) {
    await pool.query(
      `
        UPDATE users
        SET
          email = ?,
          password_hash = ?
        WHERE id = ?
          AND (
            email = CONCAT('user', id, '@example.com')
            OR email IS NULL
            OR email = ''
          )
      `,
      [sampleUser.email, sampleUser.passwordHash, sampleUser.id],
    );
  }
}

async function ensureUserAuthColumns() {
  const [emailColumns] = await pool.query("SHOW COLUMNS FROM users LIKE 'email'");
  if (!emailColumns.length) {
    await pool.query('ALTER TABLE users ADD COLUMN email VARCHAR(150) NULL AFTER name');
  }

  const [passwordColumns] = await pool.query("SHOW COLUMNS FROM users LIKE 'password_hash'");
  if (!passwordColumns.length) {
    await pool.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER email');
  }

  await pool.query(
    "UPDATE users SET email = COALESCE(NULLIF(email, ''), CONCAT('user', id, '@example.com'))",
  );
  await pool.query(
    "UPDATE users SET password_hash = COALESCE(NULLIF(password_hash, ''), ?)",
    [defaultPasswordHash],
  );

  const [emailIndexes] = await pool.query("SHOW INDEX FROM users WHERE Key_name = 'idx_users_email_unique'");
  if (!emailIndexes.length) {
    await pool.query('CREATE UNIQUE INDEX idx_users_email_unique ON users (email)');
  }

  await pool.query('ALTER TABLE users MODIFY COLUMN email VARCHAR(150) NOT NULL');
  await pool.query('ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NOT NULL');
}

async function initializeDatabase() {
  if (pool) {
    return pool;
  }

  const adminConnection = await mysql.createConnection({
    ...dbConfig,
    multipleStatements: true,
  });

  try {
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
  } finally {
    await adminConnection.end();
  }

  pool = mysql.createPool({
    ...dbConfig,
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,
  });

  const schemaStatements = getSqlStatements(schemaPath, {
    stripCreateDatabase: true,
    stripUseDatabase: true,
  });

  await runStatements(schemaStatements);
  await ensureUserAuthColumns();
  await seedDatabaseIfEmpty();
  await syncSampleUserCredentials();

  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error('Database has not been initialized yet.');
  }

  return pool;
}

module.exports = {
  initializeDatabase,
  getPool,
};
