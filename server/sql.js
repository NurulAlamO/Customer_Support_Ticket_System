const fs = require('fs');
const path = require('path');

const sqlFilePath = path.join(__dirname, 'sql', 'queries.sql');
const sqlCache = new Map();

function parseQueries() {
  if (sqlCache.size) {
    return sqlCache;
  }

  const contents = fs.readFileSync(sqlFilePath, 'utf8');
  const blocks = contents.split(/^-- name:\s+/m).slice(1);

  for (const block of blocks) {
    const [rawName, ...queryLines] = block.split(/\r?\n/);
    const name = rawName.trim();
    const sql = queryLines.join('\n').trim();

    if (name && sql) {
      sqlCache.set(name, sql);
    }
  }

  return sqlCache;
}

function loadSql(name) {
  const queries = parseQueries();

  if (!queries.has(name)) {
    throw new Error(`SQL query "${name}" was not found in ${sqlFilePath}`);
  }

  return queries.get(name);
}

module.exports = {
  loadSql,
};
