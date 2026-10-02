const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM members ORDER BY id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { name, email, member_type = 'student' } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'name and email required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO members (name,email,member_type) VALUES ($1,$2,$3) RETURNING *',
      [name, email, member_type]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;