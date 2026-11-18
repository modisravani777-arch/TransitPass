// Shared CRUD for routes and pass types (delete = deactivate, so history stays intact)
const db = require('../db');
const { wrap, fail } = require('../utils');

module.exports = (table, { fields, numeric }) => {
  const clean = (b) => {
    const d = {};
    for (const f of fields) {
      let v = typeof b[f] === 'string' ? b[f].trim() : b[f];
      if (numeric.includes(f)) {
        v = Number(v);
        if (!(v > 0)) throw fail(400, `${f.replace('_', ' ')} must be a positive number`);
      } else if (f !== 'description' && !v) throw fail(400, `${f.replace('_', ' ')} is required`);
      d[f] = v ?? '';
    }
    d.is_active = [0, '0', false].includes(b.is_active) ? 0 : 1;
    return d;
  };

  return {
    list: wrap(async (req, res) => {
      const [rows] = await db.query(`SELECT * FROM ${table} WHERE is_active = 1 ORDER BY id`);
      res.json(rows);
    }),
    listAll: wrap(async (req, res) => {
      const [rows] = await db.query(`SELECT * FROM ${table} ORDER BY id`);
      res.json(rows);
    }),
    create: wrap(async (req, res) => {
      const [r] = await db.query(`INSERT INTO ${table} SET ?`, [clean(req.body)]);
      res.status(201).json({ id: r.insertId });
    }),
    update: wrap(async (req, res) => {
      const [[row]] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      if (!row) throw fail(404, 'Not found');
      await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [clean({ ...row, ...req.body }), req.params.id]);
      res.json({ ok: true });
    }),
    remove: wrap(async (req, res) => {
      const [r] = await db.query(`UPDATE ${table} SET is_active = 0 WHERE id = ?`, [req.params.id]);
      if (!r.affectedRows) throw fail(404, 'Not found');
      res.json({ ok: true });
    }),
  };
};
