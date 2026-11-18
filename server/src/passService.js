const db = require('./db');

// Pass state is computed from dates, so it never goes stale
exports.STATE_SQL = `CASE WHEN CURDATE() > bp.valid_until THEN 'Expired'
                          WHEN CURDATE() < bp.valid_from THEN 'Upcoming' ELSE 'Active' END`;

// Creates the digital pass once an application is both approved and paid
exports.issuePass = async (appId) => {
  const [[exists]] = await db.query('SELECT id FROM bus_passes WHERE application_id = ?', [appId]);
  if (exists) return;
  const [[a]] = await db.query(
    `SELECT a.id, a.user_id, a.start_date, pt.duration_days FROM applications a
     JOIN pass_types pt ON pt.id = a.pass_type_id WHERE a.id = ?`, [appId]);

  let number;
  for (;;) {
    number = `TP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const [[dup]] = await db.query('SELECT id FROM bus_passes WHERE pass_number = ?', [number]);
    if (!dup) break;
  }
  await db.query(
    `INSERT INTO bus_passes (application_id, user_id, pass_number, valid_from, valid_until)
     VALUES (?, ?, ?, ?, DATE_ADD(?, INTERVAL ? DAY))`,
    [a.id, a.user_id, number, a.start_date, a.start_date, a.duration_days - 1]);
  await db.query("UPDATE applications SET status = 'Pass Issued' WHERE id = ?", [appId]);
};
