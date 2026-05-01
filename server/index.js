const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { getPool, initializeDatabase } = require('./db');
const { loadSql } = require('./sql');
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
    loadSql('auth.getAuthenticatedUser'),
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
    loadSql('auth.createSession'),
    [user.id, tokenHash],
  );

  return {
    token,
    user,
  };
}

function isSupportUser(user) {
  return user?.role === 'Support';
}

function isAdminUser(user) {
  return user?.role === 'Admin';
}

function isStaffUser(user) {
  return isSupportUser(user) || isAdminUser(user);
}

function canAccessTicket(user, ticket) {
  if (!user || !ticket) {
    return false;
  }

  return isStaffUser(user) || Number(ticket.userId) === Number(user.id);
}

async function requireSupport(req, res, next) {
  if (!isStaffUser(req.user)) {
    return res.status(403).json({ message: 'Staff access is required for this action.' });
  }

  return next();
}

async function requireAdmin(req, res, next) {
  if (!isAdminUser(req.user)) {
    return res.status(403).json({ message: 'Admin access is required for this action.' });
  }

  return next();
}

async function getUserById(userId) {
  const [rows] = await getPool().query(loadSql('users.getUserById'), [userId]);
  return rows[0] || null;
}

app.get('/api/health', async (_req, res) => {
  try {
    await getPool().query(loadSql('auth.healthCheck'));
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
  } = req.body;

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName || !normalizedEmail || !password.trim()) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const [existingUsers] = await getPool().query(
      loadSql('auth.findUserByEmail'),
      [normalizedEmail],
    );

    if (existingUsers.length) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const [result] = await getPool().query(
      loadSql('auth.registerUser'),
      [trimmedName, normalizedEmail, hashPassword(password), 'Customer'],
    );

    const user = {
      id: result.insertId,
      name: trimmedName,
      email: normalizedEmail,
      role: 'Customer',
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
      loadSql('auth.loginUserByEmail'),
      [normalizedEmail],
    );

    const user = rows[0];

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await getPool().query(loadSql('auth.deleteSessionsByUserId'), [user.id]);

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
    await getPool().query(loadSql('auth.deleteSessionByTokenHash'), [hashValue(token)]);
    res.json({ ok: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log out.', error: error.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email = '', newPassword = '' } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !newPassword.trim()) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }

  try {
    const [rows] = await getPool().query(loadSql('auth.findUserByEmailForReset'), [normalizedEmail]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'No account was found for that email.' });
    }

    if (isStaffUser(user)) {
      return res.status(403).json({ message: 'Staff passwords are managed by the developer.' });
    }

    await getPool().query(loadSql('auth.resetPasswordByEmail'), [
      hashPassword(newPassword),
      normalizedEmail,
    ]);

    res.json({ ok: true, message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password.', error: error.message });
  }
});

app.patch('/api/account/profile', requireAuth, async (req, res) => {
  const { name = '', email = '' } = req.body;
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName || !normalizedEmail) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  if (isStaffUser(req.user) && normalizedEmail !== req.user.email) {
    return res.status(403).json({ message: 'Staff login emails are managed by the developer.' });
  }

  try {
    const [rows] = await getPool().query(loadSql('users.findOtherUserByEmail'), [
      normalizedEmail,
      req.user.id,
    ]);

    if (rows.length) {
      return res.status(409).json({ message: 'Another account is already using that email.' });
    }

    await getPool().query(loadSql('users.updateProfile'), [
      trimmedName,
      normalizedEmail,
      req.user.id,
    ]);

    const updatedUser = await getUserById(req.user.id);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
});

app.delete('/api/account', requireAuth, async (req, res) => {
  if (isStaffUser(req.user)) {
    return res.status(403).json({ message: 'Staff accounts can only be managed by the developer.' });
  }

  try {
    await getPool().query(loadSql('users.deleteUserById'), [req.user.id]);
    res.json({ ok: true, message: 'Your account has been deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account.', error: error.message });
  }
});

app.get('/api/users', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [rows] = await getPool().query(
      loadSql('users.listUsers'),
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load users.', error: error.message });
  }
});

app.get('/api/tickets', requireAuth, async (req, res) => {
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

  if (!isStaffUser(req.user)) {
    filters.push('t.user_id = ?');
    values.push(req.user.id);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  try {
    const listTicketsSql = loadSql('tickets.listTickets').replace(
      '/*__WHERE_CLAUSE__*/',
      whereClause,
    );
    const [rows] = await getPool().query(
      listTicketsSql,
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
      loadSql('tickets.createTicket'),
      [title, description, priority, req.user.id],
    );

    const [[ticket]] = await getPool().query(
      loadSql('tickets.getTicketById'),
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

  if (!isStaffUser(req.user)) {
    return res.status(403).json({ message: 'Only support or admin accounts can change ticket status.' });
  }

  try {
    const [result] = await getPool().query(
      loadSql('tickets.updateTicketStatus'),
      [isOpen, id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const [[ticket]] = await getPool().query(
      loadSql('tickets.getTicketWithCommentsCountById'),
      [id],
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ticket status.', error: error.message });
  }
});

app.get('/api/tickets/:id/comments', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [[ticket]] = await getPool().query(loadSql('tickets.findTicketById'), [id]);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'You do not have access to this ticket.' });
    }

    const [rows] = await getPool().query(
      loadSql('comments.listCommentsByTicketId'),
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
    const [[ticket]] = await getPool().query(loadSql('tickets.findTicketById'), [id]);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'You do not have access to this ticket.' });
    }

    const [result] = await getPool().query(
      loadSql('comments.createComment'),
      [id, message.trim()],
    );

    const [[comment]] = await getPool().query(
      loadSql('comments.getCommentById'),
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



// server
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
