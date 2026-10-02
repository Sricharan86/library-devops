const router = require('express').Router();
const pool = require('../db');

// List or search: /api/books?q=clean
router.get('/', async (req, res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const { rows } = await pool.query(
      `SELECT * FROM books
       WHERE title ILIKE $1 OR author ILIKE $1 OR isbn ILIKE $1
       ORDER BY id`, [q]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { isbn, title, author, category, total_copies = 1 } = req.body;
  if (!isbn || !title || !author)
    return res.status(400).json({ error: 'isbn, title, author required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO books (isbn,title,author,category,total_copies,available_copies)
       VALUES ($1,$2,$3,$4,$5,$5) RETURNING *`,
      [isbn, title, author, category, total_copies]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { title, author, category } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE books SET title=$1, author=$2, category=$3 WHERE id=$4 RETURNING *`,
      [title, author, category, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM books WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;