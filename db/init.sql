CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  member_type VARCHAR(20) DEFAULT 'student',
  joined_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  total_copies INT NOT NULL DEFAULT 1 CHECK (total_copies >= 1),
  available_copies INT NOT NULL DEFAULT 1 CHECK (available_copies >= 0 AND available_copies <= total_copies)
);

CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES books(id),
  member_id INT NOT NULL REFERENCES members(id),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  fine NUMERIC(8,2) DEFAULT 0
);

INSERT INTO books (isbn,title,author,category,total_copies,available_copies)
VALUES
('9780132350884','Clean Code','Robert C. Martin','Programming',3,3),
('9780135957059','The Pragmatic Programmer','Andrew Hunt','Programming',2,2),
('9780262033848','Introduction to Algorithms','Cormen','Computer Science',2,2)
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO members (name,email,member_type)
VALUES
('Asha Rao','asha@example.com','student'),
('Ravi Kumar','ravi@example.com','staff')
ON CONFLICT (email) DO NOTHING;
