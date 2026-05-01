-- name: auth.getAuthenticatedUser
-- token দিয়ে logged-in user বের করে
SELECT
  u.id,
  u.name,
  u.email,
  u.role
FROM auth_sessions s
JOIN users u ON u.id = s.user_id
WHERE s.token_hash = ?
LIMIT 1;

-- name: auth.createSession
-- login করলে session create হয়
INSERT INTO auth_sessions (user_id, token_hash)
VALUES (?, ?);

-- name: auth.healthCheck
-- DB alive কিনা check
SELECT 1;

-- name: auth.findUserByEmail
-- email already আছে কিনা check
SELECT id
FROM users
WHERE email = ?
LIMIT 1;

-- name: auth.findUserByEmailForReset
-- password reset এর জন্য user info আনে
SELECT
  id,
  name,
  email,
  role
FROM users
WHERE email = ?
LIMIT 1;

-- name: auth.registerUser
-- নতুন user create
INSERT INTO users (name, email, password_hash, role)
VALUES (?, ?, ?, ?);

-- name: auth.loginUserByEmail
-- login করার সময় user and password_hash নেয়
SELECT
  id,
  name,
  email,
  password_hash AS passwordHash,
  role
FROM users
WHERE email = ?
LIMIT 1;

-- name: auth.deleteSessionsByUserId
-- logout all devices
DELETE FROM auth_sessions
WHERE user_id = ?;

-- name: auth.deleteSessionByTokenHash
-- single session logout
DELETE FROM auth_sessions
WHERE token_hash = ?;

-- name: auth.resetPasswordByEmail
-- password change করে
UPDATE users
SET password_hash = ?
WHERE email = ?;

-- name: users.getUserById
-- ID দিয়ে user info আনে
SELECT
  id,
  name,
  email,
  role
FROM users
WHERE id = ?
LIMIT 1;

-- name: users.findOtherUserByEmail
-- email duplicate check করে (update time)
-- current user বাদ দিয়ে check করে
SELECT id
FROM users
WHERE email = ?
  AND id <> ?
LIMIT 1;

-- name: users.updateProfile
-- name , email update
UPDATE users
SET
  name = ?,
  email = ?
WHERE id = ?;

-- name: users.deleteUserById
-- user delete
DELETE FROM users
WHERE id = ?;

-- name: users.listUsers
-- সব user list
SELECT
  id,
  name,
  email,
  role
FROM users
ORDER BY name ASC;

-- name: tickets.listTickets
-- সব ticket list দেখায়
-- user info , comment count সহ
-- priority অনুযায়ী sort
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
/*__WHERE_CLAUSE__*/
GROUP BY t.id, u.name, u.role
ORDER BY
  FIELD(t.priority, 'High', 'Medium', 'Low'),
  t.created_at DESC;

-- name: tickets.createTicket
-- নতুন ticket create করে
-- default: isOpen = TRUE
INSERT INTO tickets (title, description, priority, isOpen, user_id)
VALUES (?, ?, ?, TRUE, ?);

-- name: tickets.getTicketById
-- একটা specific ticket এর info দেয়
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
WHERE t.id = ?;

-- name: tickets.updateTicketStatus
-- ticket open or close update করে
UPDATE tickets
SET isOpen = ?
WHERE id = ?;

-- name: tickets.getTicketWithCommentsCountById
-- ticket and কতগুলো comment আছে সেটা দেয়
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
GROUP BY t.id, u.name, u.role;

-- name: tickets.findTicketById
-- ticket exist করে কিনা check
SELECT
  id,
  user_id AS userId
FROM tickets
WHERE id = ?;

-- name: comments.listCommentsByTicketId
-- একটা ticket এর সব comment দেখায়
-- latest comment আগে
SELECT
  id,
  ticket_id AS ticketId,
  message,
  created_at AS createdAt
FROM comments
WHERE ticket_id = ?
ORDER BY created_at DESC, id DESC;

-- name: comments.createComment
-- নতুন comment add করে
INSERT INTO comments (ticket_id, message)
VALUES (?, ?);

-- name: comments.getCommentById
-- specific comment fetch করে
SELECT
  id,
  ticket_id AS ticketId,
  message,
  created_at AS createdAt
FROM comments
WHERE id = ?;

-- name: db.countUsers
-- total user সংখ্যা বের করে
SELECT COUNT(*) AS totalUsers
FROM users;

-- name: db.syncSampleUserCredentials
-- default user email or password update করে
UPDATE users
SET
  email = ?,
  password_hash = ?
WHERE id = ?
  AND (
    email = CONCAT('user', id, '@example.com')
    OR email IS NULL
    OR email = ''
  );

-- name: db.upsertSeedUser
INSERT INTO users (id, name, email, password_hash, role)
VALUES (?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  role = VALUES(role);

-- name: db.showEmailColumn
-- column আছে কিনা check
SHOW COLUMNS FROM users LIKE 'email';

-- name: db.addEmailColumn
-- table এ নতুন column add করে
ALTER TABLE users
ADD COLUMN email VARCHAR(150) NULL AFTER name;

-- name: db.showPasswordHashColumn
-- column আছে কিনা check
SHOW COLUMNS FROM users LIKE 'password_hash';

-- name: db.addPasswordHashColumn
-- table এ নতুন column add করে
ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255) NULL AFTER email;

-- name: db.fillMissingUserEmails
-- যাদের email নাই  auto generate করে
UPDATE users
SET email = COALESCE(NULLIF(email, ''), CONCAT('user', id, '@example.com'));

-- name: db.fillMissingUserPasswordHashes
-- যাদের password নাই fill করে
UPDATE users
SET password_hash = COALESCE(NULLIF(password_hash, ''), ?);

-- name: db.showEmailUniqueIndex
-- email unique index আছে কিনা check
SHOW INDEX FROM users
WHERE Key_name = 'idx_users_email_unique';

-- name: db.createEmailUniqueIndex
-- email duplicate না হয়  unique index তৈরি
CREATE UNIQUE INDEX idx_users_email_unique
ON users (email);

-- name: db.modifyEmailColumnNotNull
-- email column required করে
ALTER TABLE users
MODIFY COLUMN email VARCHAR(150) NOT NULL;

-- name: db.modifyPasswordHashColumnNotNull
-- password column required করে
ALTER TABLE users
MODIFY COLUMN password_hash VARCHAR(255) NOT NULL;

-- name: db.createDatabase
-- database create করে (no any database)
CREATE DATABASE IF NOT EXISTS `__DATABASE_NAME__`;

-- name: db.dropTriggerUsersBeforeInsert
DROP TRIGGER IF EXISTS trg_users_before_insert;

-- name: db.createTriggerUsersBeforeInsert
CREATE TRIGGER trg_users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  SET NEW.name = TRIM(NEW.name);
  SET NEW.email = LOWER(TRIM(NEW.email));
  SET NEW.role = TRIM(NEW.role);
END;

-- name: db.dropTriggerUsersBeforeUpdate
-- user update হলে same cleaning আবার হবে
DROP TRIGGER IF EXISTS trg_users_before_update;

-- name: db.createTriggerUsersBeforeUpdate
CREATE TRIGGER trg_users_before_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.name = TRIM(NEW.name);
  SET NEW.email = LOWER(TRIM(NEW.email));
  SET NEW.role = TRIM(NEW.role);
END;

-- name: db.dropTriggerTicketsBeforeInsert
DROP TRIGGER IF EXISTS trg_tickets_before_insert;

-- name: db.createTriggerTicketsBeforeInsert
CREATE TRIGGER trg_tickets_before_insert
BEFORE INSERT ON tickets
FOR EACH ROW
BEGIN
  SET NEW.title = TRIM(NEW.title);
  SET NEW.description = TRIM(NEW.description);
END;

-- name: db.dropTriggerTicketsBeforeUpdate
DROP TRIGGER IF EXISTS trg_tickets_before_update;

-- name: db.createTriggerTicketsBeforeUpdate
CREATE TRIGGER trg_tickets_before_update
BEFORE UPDATE ON tickets
FOR EACH ROW
BEGIN
  SET NEW.title = TRIM(NEW.title);
  SET NEW.description = TRIM(NEW.description);
END;

-- name: db.dropTriggerCommentsBeforeInsert
DROP TRIGGER IF EXISTS trg_comments_before_insert;

-- name: db.createTriggerCommentsBeforeInsert
CREATE TRIGGER trg_comments_before_insert
BEFORE INSERT ON comments
FOR EACH ROW
BEGIN
  SET NEW.message = TRIM(NEW.message);
END;

-- name: db.dropTriggerCommentsBeforeUpdate
DROP TRIGGER IF EXISTS trg_comments_before_update;

-- name: db.createTriggerCommentsBeforeUpdate
CREATE TRIGGER trg_comments_before_update
BEFORE UPDATE ON comments
FOR EACH ROW
BEGIN
  SET NEW.message = TRIM(NEW.message);
END;

-- name: db.dropTriggerAuthSessionsBeforeInsert
DROP TRIGGER IF EXISTS trg_auth_sessions_before_insert;

-- name: db.createTriggerAuthSessionsBeforeInsert
CREATE TRIGGER trg_auth_sessions_before_insert
BEFORE INSERT ON auth_sessions
FOR EACH ROW
BEGIN
  SET NEW.token_hash = TRIM(NEW.token_hash);
END;

-- name: db.dropTriggerUsersAfterPasswordUpdate
DROP TRIGGER IF EXISTS trg_users_after_password_update;

-- name: db.createTriggerUsersAfterPasswordUpdate
CREATE TRIGGER trg_users_after_password_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  IF NEW.password_hash <> OLD.password_hash THEN
    DELETE FROM auth_sessions
    WHERE user_id = NEW.id;
  END IF;
END;
