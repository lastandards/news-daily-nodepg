import Router from 'express-promise-router';
import db from '../db';

const router = new Router();

module.exports = router;

router.get('/perfis', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM newsdaily.perfil', null);
  res.send(res.rows[0]);
});