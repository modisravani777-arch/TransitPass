const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { documentUpload, photoUpload } = require('../middleware/upload');
const auth = require('../controllers/auth');
const users = require('../controllers/users');
const apps = require('../controllers/applications');
const pay = require('../controllers/payments');
const passes = require('../controllers/passes');
const stats = require('../controllers/stats');
const catalog = require('../controllers/catalog');

const routesCtl = catalog('routes', { fields: ['name', 'source', 'destination', 'fare'], numeric: ['fare'] });
const typesCtl = catalog('pass_types', { fields: ['name', 'duration_days', 'price', 'description'], numeric: ['duration_days', 'price'] });

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);

// Users
router.put('/users/profile', protect, photoUpload.single('photo'), users.updateProfile);
router.get('/users', protect, adminOnly, users.list);
router.get('/users/:id', protect, adminOnly, users.get);
router.patch('/users/:id/status', protect, adminOnly, users.setStatus);

// Routes & pass types: public read of active items, admin write
for (const [path, ctl] of [['/routes', routesCtl], ['/pass-types', typesCtl]]) {
  router.get(path, ctl.list);
  router.get(`${path}/admin/all`, protect, adminOnly, ctl.listAll);
  router.post(path, protect, adminOnly, ctl.create);
  router.put(`${path}/:id`, protect, adminOnly, ctl.update);
  router.delete(`${path}/:id`, protect, adminOnly, ctl.remove);
}

// Applications (the document is uploaded together with the application)
router.post('/applications', protect, documentUpload.single('document'), apps.create);
router.get('/applications', protect, apps.list);
router.get('/applications/:id', protect, apps.get);
router.patch('/applications/:id/approve', protect, adminOnly, apps.approve);
router.patch('/applications/:id/reject', protect, adminOnly, apps.reject);

// Payments
router.post('/payments', protect, pay.create);
router.get('/payments', protect, pay.list);

// Bus passes
router.get('/passes', protect, passes.list);
router.get('/passes/public/:number', passes.publicVerify); // opened from the QR link, no login
router.get('/passes/verify/:number', protect, adminOnly, passes.verify);
router.get('/passes/:id', protect, passes.get);

// Stats
router.get('/stats/student', protect, stats.student);
router.get('/stats/admin', protect, adminOnly, stats.admin);
router.get('/stats/notifications', protect, stats.notifications);

module.exports = router;