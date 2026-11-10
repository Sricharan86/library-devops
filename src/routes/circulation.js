const router = require('express').Router();
const pool = require('../db');
const { calculateFine } = require('../fine');

router.post('/issue', async (req, res) => {
  const { book_id, member_id } = req.body;
  if (!Number.isInteger(Number(book_id)) || !Number.isInteger(Number(member_id))) {
    return res.status(400).json({ error: 'book_id and member_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const book = await client.query(
      'SELECT available_copies FROM books WHERE id=$1 FOR UPDATE', [book_id]);
    if (!book.rows.length) throw new Error('Book not found');
    if (book.rows[0].available_copies < 1) throw new Error('No copies available');

    const member = await client.query('SELECT id FROM members WHERE id=$1', [member_id]);
    if (!member.rows.length) throw new Error('Member not found');

    const issue = await client.query(
      `INSERT INTO issues (book_id, member_id, due_date)
       VALUES ($1, $2, CURRENT_DATE + INTERVAL '14 days') RETURNING *`,
      [book_id, member_id]);
    await client.query(
      'UPDATE books SET available_copies=available_copies-1 WHERE id=$1', [book_id]);
    await client.query('COMMIT');
    res.status(201).json(issue.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.post('/return/:issueId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT * FROM issues WHERE id=$1 AND return_date IS NULL FOR UPDATE',
      [req.params.issueId]);
    if (!rows.length) throw new Error('Issue not found or already returned');

    const fine = calculateFine(rows[0].due_date);
    const updated = await client.query(
      `UPDATE issues SET return_date=CURRENT_DATE, fine=$1
       WHERE id=$2 RETURNING *`, [fine, req.params.issueId]);
    await client.query(
      'UPDATE books SET available_copies=available_copies+1 WHERE id=$1',
      [rows[0].book_id]);
    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get('/issues', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, b.title, m.name AS member_name
       FROM issues i
       JOIN books b ON b.id=i.book_id
       JOIN members m ON m.id=i.member_id
       WHERE i.return_date IS NULL ORDER BY i.due_date`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load issued books' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const [books, issued, overdue, members] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(total_copies),0)::int AS count FROM books'),
      pool.query('SELECT COUNT(*)::int AS count FROM issues WHERE return_date IS NULL'),
      pool.query('SELECT COUNT(*)::int AS count FROM issues WHERE return_date IS NULL AND due_date < CURRENT_DATE'),
      pool.query('SELECT COUNT(*)::int AS count FROM members')
    ]);
    res.json({
      total_books: books.rows[0].count,
      issued: issued.rows[0].count,
      overdue: overdue.rows[0].count,
      members: members.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ error: 'Unable to load dashboard' });
  }
});

module.exports = router;
