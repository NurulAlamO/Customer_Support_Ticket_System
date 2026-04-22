const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { loadSql } = require('./sql');

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
  const [[row]] = await pool.query(loadSql('db.countUsers'));

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
      loadSql('db.syncSampleUserCredentials'),
      [sampleUser.email, sampleUser.passwordHash, sampleUser.id],
    );
  }
}

async function ensureUserAuthColumns() {
  const [emailColumns] = await pool.query(loadSql('db.showEmailColumn'));
  if (!emailColumns.length) {
    await pool.query(loadSql('db.addEmailColumn'));
  }

  const [passwordColumns] = await pool.query(loadSql('db.showPasswordHashColumn'));
  if (!passwordColumns.length) {
    await pool.query(loadSql('db.addPasswordHashColumn'));
  }

  await pool.query(loadSql('db.fillMissingUserEmails'));
  await pool.query(loadSql('db.fillMissingUserPasswordHashes'), [defaultPasswordHash]);

  const [emailIndexes] = await pool.query(loadSql('db.showEmailUniqueIndex'));
  if (!emailIndexes.length) {
    await pool.query(loadSql('db.createEmailUniqueIndex'));
  }

  await pool.query(loadSql('db.modifyEmailColumnNotNull'));
  await pool.query(loadSql('db.modifyPasswordHashColumnNotNull'));
}

async function ensureDatabaseTriggers() {
  const triggerPairs = [
    ['db.dropTriggerUsersBeforeInsert', 'db.createTriggerUsersBeforeInsert'],
    ['db.dropTriggerUsersBeforeUpdate', 'db.createTriggerUsersBeforeUpdate'],
    ['db.dropTriggerTicketsBeforeInsert', 'db.createTriggerTicketsBeforeInsert'],
    ['db.dropTriggerTicketsBeforeUpdate', 'db.createTriggerTicketsBeforeUpdate'],
    ['db.dropTriggerCommentsBeforeInsert', 'db.createTriggerCommentsBeforeInsert'],
    ['db.dropTriggerCommentsBeforeUpdate', 'db.createTriggerCommentsBeforeUpdate'],
    ['db.dropTriggerAuthSessionsBeforeInsert', 'db.createTriggerAuthSessionsBeforeInsert'],
    ['db.dropTriggerUsersAfterPasswordUpdate', 'db.createTriggerUsersAfterPasswordUpdate'],
  ];

  for (const [dropQueryName, createQueryName] of triggerPairs) {
    await pool.query(loadSql(dropQueryName));
    await pool.query(loadSql(createQueryName));
  }
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
    const createDatabaseSql = loadSql('db.createDatabase').replace(
      '`__DATABASE_NAME__`',
      `\`${databaseName}\``,
    );
    await adminConnection.query(createDatabaseSql);
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
  await ensureDatabaseTriggers();
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
