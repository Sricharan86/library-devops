const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const { rows } = await pool.query(
      `SELECT * FROM books
       WHERE title ILIKE $1 OR author ILIKE $1 OR isbn ILIKE $1
       ORDER BY id`, [q]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load books' });
  }
});

router.post('/', async (req, res) => {
  const { isbn, title, author, category = '', total_copies = 1 } = req.body;
  const copies = Number(total_copies);
  if (!isbn || !title || !author || !Number.isInteger(copies) || copies < 1) {
    return res.status(400).json({ error: 'Valid ISBN, title, author and total_copies are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO books (isbn,title,author,category,total_copies,available_copies)
       VALUES ($1,$2,$3,$4,$5,$5) RETURNING *`,
      [isbn, title, author, category, copies]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(err.code === '23505' ? 409 : 500).json({
      error: err.code === '23505' ? 'ISBN already exists' : 'Unable to add book'
    });
  }
});

router.put('/:id', async (req, res) => {
  const { title, author, category } = req.body;
  if (!title || !author) return res.status(400).json({ error: 'Title and author are required' });
  try {
    const { rows } = await pool.query(
      'UPDATE books SET title=$1, author=$2, category=$3 WHERE id=$4 RETURNING *',
      [title, author, category || '', req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Unable to update book' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM books WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Book not found' });
    res.status(204).end();
  } catch (err) {
    res.status(err.code === '23503' ? 409 : 500).json({
      error: err.code === '23503' ? 'Book has issue history and cannot be deleted' : 'Unable to delete book'
    });
  }
});

module.exports = router;
