/**
 * Pustaka Utama (yang mendasari jalannya program ini)
 */
import * as express from 'express';
import * as passport from 'passport';
let AuthenticationController = require('../controllers/authentication');
let passportService = require('../config/passport');

// middleware untuk membutuhkan login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

// konstan untuk tipe rule
const REQUIRE_ADMIN = "Admin";
const REQUIRE_OWNER = "Owner";
const REQUIRE_CLIENT = "Client";
const REQUIRE_MEMBER = "Member";

module.exports = function (app: any) {
  // Inisialisasi grup rute
  const apiRoutes = express.Router(),
    authRoutes = express.Router();

  //=========================
  // Auth Routes
  //=========================
  // atur rute auth seperti subgroup/middleware ke apiRoutes
  apiRoutes.use('/auth', authRoutes);

  // rute registrasi
  authRoutes.post('/register', AuthenticationController.register);

  // rute masuk
  authRoutes.post('/login', requireLogin, AuthenticationController.login);

  // rute testing
  authRoutes.get('/test', passport.authenticate('jwt', { session: false }), function(req, res) {  
    res.json({'pesan': 'It worked! User id is: ' + req.user._id + '.'});
  });

  // mengatur rute URL API (perlu disesuaikan dengan kode server)
  app.use('/api', apiRoutes);
};