USE ticket_system;

INSERT INTO users (id, name, email, password_hash, role) VALUES
  (1, 'John Smith', 'john@example.com', 'sha256:ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Customer'),
  (2, 'Emma Johnson', 'emma@example.com', 'sha256:ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Customer'),
  (3, 'Michael Brown', 'michael@example.com', 'sha256:ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Customer'),
  (4, 'Sophia Williams', 'sophia@example.com', 'sha256:ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Customer'),
  (5, 'Olivia Davis', 'olivia@example.com', 'sha256:ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Customer'),
  (6, 'Support Agent', 'support@example.com', 'sha256:a67d22cef2f6639d71b8901b5b2bbee4a2400d92c70e60c179c0fd76d72d6c23', 'Support'),
  (7, 'System Admin', 'admin@example.com', 'sha256:240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  role = VALUES(role);

INSERT INTO tickets (id, title, description, priority, isOpen, user_id) VALUES
  (1, 'Login Issue', 'User unable to login with correct credentials.', 'High', TRUE, 1),
  (2, 'Payment Failed', 'Transaction failed during checkout process.', 'Medium', TRUE, 2),
  (3, 'UI Bug on Dashboard', 'Dashboard layout breaks on mobile devices.', 'Low', FALSE, 3),
  (4, 'Slow Performance', 'App is taking too long to load data.', 'High', TRUE, 4),
  (5, 'Signup Error', 'Error occurs while creating new account.', 'High', TRUE, 5)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  priority = VALUES(priority),
  isOpen = VALUES(isOpen),
  user_id = VALUES(user_id);

INSERT INTO comments (id, ticket_id, message) VALUES
  (1, 1, 'Asked the customer for a fresh screenshot of the error.'),
  (2, 1, 'Reset instructions shared and waiting for confirmation.'),
  (3, 2, 'Payment gateway logs show a timeout during checkout.'),
  (4, 3, 'Responsive layout fix has already been deployed.'),
  (5, 4, 'Engineering team is investigating the database query load.')
ON DUPLICATE KEY UPDATE
  ticket_id = VALUES(ticket_id),
  message = VALUES(message);
