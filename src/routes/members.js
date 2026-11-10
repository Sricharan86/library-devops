const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM members ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load members' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, member_type = 'student' } = req.body;
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid name and email are required' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO members (name,email,member_type) VALUES ($1,$2,$3) RETURNING *',
      [name, email, member_type]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(err.code === '23505' ? 409 : 500).json({
      error: err.code === '23505' ? 'Email already registered' : 'Unable to register member'
    });
  }
});

module.exports = router;
