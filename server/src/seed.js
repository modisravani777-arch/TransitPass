// Resets the database and fills it with demo data:  npm run seed
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', multipleStatements: true,
  });
  await conn.query(fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8'));
  await conn.query('USE transitpass');

  // A sample document so the admin can preview uploads for seeded applications
  const uploads = path.join(__dirname, '../uploads');
  fs.mkdirSync(uploads, { recursive: true });
  fs.writeFileSync(path.join(uploads, 'sample-college-id.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="480" height="300" rx="18" fill="#EEF2FF"/><rect width="480" height="64" rx="18" fill="#1E2F7A"/><text x="24" y="40" font-family="Arial" font-size="22" fill="#fff">ANITS - Student ID (sample)</text><circle cx="90" cy="160" r="44" fill="#C7D2FE"/><text x="160" y="150" font-family="Arial" font-size="20" fill="#0B1B3F">Demo Student</text><text x="160" y="182" font-family="Arial" font-size="15" fill="#475569">B.Tech CSE - 3rd Year</text></svg>`);

  const hash = {
    admin: await bcrypt.hash('Admin@123', 10),
    student: await bcrypt.hash('Student@123', 10),
  };

  await conn.query("INSERT INTO users (name,email,phone,password_hash,role) VALUES ('Transit Admin','admin@transitpass.com','9000000001',?,'admin')", [hash.admin]);
  const students = [
    ['Sai Kiran', 'student@transitpass.com', '9848012345'], ['Ananya Rao', 'ananya.rao@example.com', '9848023456'],
    ['Harsha Vardhan', 'harsha.v@example.com', '9848034567'], ['Meghana Reddy', 'meghana.r@example.com', '9848045678'],
    ['Praneeth Kumar', 'praneeth.k@example.com', '9848056789'], ['Divya Lakshmi', 'divya.l@example.com', '9848067890'],
    ['Karthik Varma', 'karthik.v@example.com', '9848078901'], ['Sravani Devi', 'sravani.d@example.com', '9848089012'],
  ];
  for (const [n, e, p] of students)
    await conn.query("INSERT INTO users (name,email,phone,password_hash) VALUES (?,?,?,?)", [n, e, p, hash.student]);

  const routes = [
    ['Visakhapatnam → Madhurawada', 'Visakhapatnam', 'Madhurawada', 30], ['Madhurawada → Visakhapatnam', 'Madhurawada', 'Visakhapatnam', 30],
    ['Visakhapatnam → Gajuwaka', 'Visakhapatnam', 'Gajuwaka', 35], ['Gajuwaka → Visakhapatnam', 'Gajuwaka', 'Visakhapatnam', 35],
    ['Visakhapatnam → Sangivalasa', 'Visakhapatnam', 'Sangivalasa', 40], ['Visakhapatnam → Anakapalle', 'Visakhapatnam', 'Anakapalle', 45],
  ];
  for (const r of routes) await conn.query('INSERT INTO routes (name,source,destination,fare) VALUES (?,?,?,?)', r);

  const types = [
    ['Student Monthly', 30, 450, 'Discounted monthly pass for students with a valid college ID.'],
    ['General Monthly', 30, 750, 'Unlimited rides on your route for 30 days.'],
    ['Quarterly', 90, 1900, 'Best value: three months of unlimited rides.'],
    ['Weekly Express', 7, 199, 'Short-term pass for visitors and interns.'],
  ];
  for (const t of types) await conn.query('INSERT INTO pass_types (name,duration_days,price,description) VALUES (?,?,?,?)', t);
  const price = types.map(t => t[2]), days = types.map(t => t[1]);

  // [studentIdx(1-8), routeIdx, typeIdx, startOffsetDays, status, paid, appliedDaysAgo, rejectionReason, method]
  const apps = [
    [1, 1, 1, -10, 'Pass Issued', 1, 14, null, 'UPI'],
    [1, 5, 2, 20, 'Rejected', 0, 6, 'Document is blurry. Please upload a clear photo of your college ID.', null],
    [1, 2, 2, 5, 'Pending', 1, 1, null, 'Card'],
    [2, 1, 1, -5, 'Pass Issued', 1, 9, null, 'UPI'],
    [3, 3, 2, -40, 'Pass Issued', 1, 48, null, 'Net Banking'],
    [4, 5, 3, -80, 'Pass Issued', 1, 88, null, 'UPI'],
    [5, 1, 2, -2, 'Pass Issued', 1, 5, null, 'Card'],
    [6, 2, 1, 3, 'Pending', 1, 2, null, 'UPI'],
    [7, 4, 1, 8, 'Pending', 0, 1, null, null],
    [8, 6, 3, -120, 'Pass Issued', 1, 128, null, 'Net Banking'],
    [3, 1, 1, 12, 'Approved', 0, 3, null, null],
    [2, 3, 2, -75, 'Pass Issued', 1, 82, null, 'Card'],
  ];
  let n = 100000;
  for (const [s, r, t, off, status, paid, ago, reason, method] of apps) {
    const uid = s + 1, amount = price[t - 1];
    const [res] = await conn.query(
      `INSERT INTO applications (user_id,route_id,pass_type_id,start_date,amount,status,payment_status,rejection_reason,created_at)
       VALUES (?,?,?,DATE_ADD(CURDATE(), INTERVAL ? DAY),?,?,?,?,DATE_SUB(NOW(), INTERVAL ? DAY))`,
      [uid, r, t, off, amount, status, paid ? 'Paid' : 'Unpaid', reason, ago]);
    await conn.query('INSERT INTO documents (application_id,file_path,original_name) VALUES (?,?,?)', [res.insertId, 'sample-college-id.svg', 'college-id.svg']);
    if (paid) await conn.query(
      'INSERT INTO payments (application_id,user_id,amount,method,transaction_id,created_at) VALUES (?,?,?,?,?,DATE_SUB(NOW(), INTERVAL ? DAY))',
      [res.insertId, uid, amount, method, `TXN${1700000000000 + res.insertId * 7919}`, ago]);
    if (status === 'Pass Issued') await conn.query(
      `INSERT INTO bus_passes (application_id,user_id,pass_number,valid_from,valid_until)
       VALUES (?,?,?,DATE_ADD(CURDATE(), INTERVAL ? DAY),DATE_ADD(CURDATE(), INTERVAL ? DAY))`,
      [res.insertId, uid, `TP-${new Date().getFullYear()}-${++n}`, off, off + days[t - 1] - 1]);
  }

  console.log('Database ready.\n  Admin:   admin@transitpass.com / Admin@123\n  Student: student@transitpass.com / Student@123');
  await conn.end();
})().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
