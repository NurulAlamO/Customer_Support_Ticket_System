const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { getPool, initializeDatabase } = require('./db');
const {
  generateSessionToken,
  hashPassword,
  hashValue,
  verifyPassword,
} = require('./auth');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = Number(process.env.PORT || 5000);
const distPath = path.join(__dirname, '..', 'dist');
const validPriorities = new Set(['High', 'Medium', 'Low']);
const validRoles = new Set(['Customer', 'Support']);

app.use(cors());
app.use(express.json());

async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return null;
  }

  const tokenHash = hashValue(token);
  const [rows] = await getPool().query(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role
      FROM auth_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
      LIMIT 1
    `,
    [tokenHash],
  );

  return rows[0] || null;
}

async function requireAuth(req, res, next) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({ message: 'Please log in to continue.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication failed.', error: error.message });
  }
}

async function createSessionForUser(user) {
  const token = generateSessionToken();
  const tokenHash = hashValue(token);

  await getPool().query(
    'INSERT INTO auth_sessions (user_id, token_hash) VALUES (?, ?)',
    [user.id, tokenHash],
  );

  return {
    token,
    user,
  };
}

app.get('/api/health', async (_req, res) => {
  try {
    await getPool().query('SELECT 1');
    res.json({ ok: true, message: 'API and database are connected.' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  res.json(req.user);
});

app.post('/api/auth/register', async (req, res) => {
  const {
    name = '',
    email = '',
    password = '',
    role = 'Customer',
  } = req.body;

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName || !normalizedEmail || !password.trim()) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (!validRoles.has(role)) {
    return res.status(400).json({ message: 'Role must be Customer or Support.' });
  }

  try {
    const [existingUsers] = await getPool().query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail],
    );

    if (existingUsers.length) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const [result] = await getPool().query(
      `
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `,
      [trimmedName, normalizedEmail, hashPassword(password), role],
    );

    const user = {
      id: result.insertId,
      name: trimmedName,
      email: normalizedEmail,
      role,
    };

    res.status(201).json(await createSessionForUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Failed to register user.', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email = '', password = '' } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password.trim()) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await getPool().query(
      `
        SELECT id, name, email, password_hash AS passwordHash, role
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [normalizedEmail],
    );

    const user = rows[0];

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await getPool().query('DELETE FROM auth_sessions WHERE user_id = ?', [user.id]);

    res.json(
      await createSessionForUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    );
  } catch (error) {
    res.status(500).json({ message: 'Failed to log in.', error: error.message });
  }
});

app.post('/api/auth/logout', requireAuth, async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  try {
    await getPool().query('DELETE FROM auth_sessions WHERE token_hash = ?', [hashValue(token)]);
    res.json({ ok: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log out.', error: error.message });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const [rows] = await getPool().query(
      'SELECT id, name, email, role FROM users ORDER BY name ASC',
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load users.', error: error.message });
  }
});

app.get('/api/tickets', async (req, res) => {
  const { priority = 'All', status = 'all' } = req.query;
  const filters = [];
  const values = [];

  if (priority !== 'All' && !validPriorities.has(priority)) {
    return res.status(400).json({ message: 'Priority must be High, Medium, Low, or All.' });
  }

  if (priority !== 'All') {
    filters.push('t.priority = ?');
    values.push(priority);
  }

  if (status === 'open') {
    filters.push('t.isOpen = TRUE');
  } else if (status === 'closed') {
    filters.push('t.isOpen = FALSE');
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  try {
    const [rows] = await getPool().query(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.priority,
          t.isOpen,
          t.user_id AS userId,
          t.created_at AS createdAt,
          u.name AS userName,
          u.role AS userRole,
          COUNT(c.id) AS commentsCount
        FROM tickets t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN comments c ON c.ticket_id = t.id
        ${whereClause}
        GROUP BY t.id, u.name, u.role
        ORDER BY
          FIELD(t.priority, 'High', 'Medium', 'Low'),
          t.created_at DESC
      `,
      values,
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load tickets.', error: error.message });
  }
});

app.post('/api/tickets', requireAuth, async (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || !description || !priority) {
    return res.status(400).json({ message: 'Title, description, and priority are required.' });
  }

  if (!validPriorities.has(priority)) {
    return res.status(400).json({ message: 'Priority must be High, Medium, or Low.' });
  }

  try {
    const [result] = await getPool().query(
      `
        INSERT INTO tickets (title, description, priority, isOpen, user_id)
        VALUES (?, ?, ?, TRUE, ?)
      `,
      [title, description, priority, req.user.id],
    );

    const [[ticket]] = await getPool().query(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.priority,
          t.isOpen,
          t.user_id AS userId,
          t.created_at AS createdAt,
          u.name AS userName,
          u.role AS userRole,
          0 AS commentsCount
        FROM tickets t
        JOIN users u ON u.id = t.user_id
        WHERE t.id = ?
      `,
      [result.insertId],
    );

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create ticket.', error: error.message });
  }
});

app.patch('/api/tickets/:id/status', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { isOpen } = req.body;

  if (typeof isOpen !== 'boolean') {
    return res.status(400).json({ message: 'isOpen must be true or false.' });
  }

  try {
    const [result] = await getPool().query(
      'UPDATE tickets SET isOpen = ? WHERE id = ?',
      [isOpen, id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const [[ticket]] = await getPool().query(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.priority,
          t.isOpen,
          t.user_id AS userId,
          t.created_at AS createdAt,
          u.name AS userName,
          u.role AS userRole,
          COUNT(c.id) AS commentsCount
        FROM tickets t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN comments c ON c.ticket_id = t.id
        WHERE t.id = ?
        GROUP BY t.id, u.name, u.role
      `,
      [id],
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ticket status.', error: error.message });
  }
});

app.get('/api/tickets/:id/comments', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await getPool().query(
      `
        SELECT id, ticket_id AS ticketId, message, created_at AS createdAt
        FROM comments
        WHERE ticket_id = ?
        ORDER BY created_at DESC, id DESC
      `,
      [id],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load comments.', error: error.message });
  }
});

app.post('/api/tickets/:id/comments', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Comment message is required.' });
  }

  try {
    const [[ticket]] = await getPool().query('SELECT id FROM tickets WHERE id = ?', [id]);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const [result] = await getPool().query(
      'INSERT INTO comments (ticket_id, message) VALUES (?, ?)',
      [id, message.trim()],
    );

    const [[comment]] = await getPool().query(
      `
        SELECT id, ticket_id AS ticketId, message, created_at AS createdAt
        FROM comments
        WHERE id = ?
      `,
      [result.insertId],
    );

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment.', error: error.message });
  }
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.method !== 'GET') {
      return next();
    }

    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    const isAuthError =
      error && (error.code === 'ER_ACCESS_DENIED_ERROR' || error.errno === 1045);

    if (isAuthError) {
      console.error(
        'Unable to start the server: MySQL rejected the login. Check DB_USER and DB_PASSWORD in your .env file.',
      );
    } else {
      console.error('Unable to start the server:', error.message);
    }

    process.exit(1);
  }
}

startServer();
