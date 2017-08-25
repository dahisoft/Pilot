/**
 * Pustaka Utama (yang mendasari jalannya program ini)
 */
import * as passport from 'passport';
import * as passportJwt from 'passport-jwt';
let jwtStrategy = passportJwt.Strategy;
let extractJwt = passportJwt.ExtractJwt;
let localStrategy = require('passport-local');
let User = require('../models/user');
let config = require('./utama');

const localOptions = { usernameField: 'email' };

// Pengaturan strategi masuk lokal
const localLogin = new localStrategy(localOptions, function (email: any, password: any, done: any) {
  User.findOne({ email: email }, function (err: any, user: any) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { error: 'Detail akun anda tidak dapat diverifikasi. Coba lagi!.' }); }
    user.comparePassword(password, function (err: any, isMatch: any) {
      if (err) { return done(err); }
      if (!isMatch) { return done(null, false, { error: "Detail akun anda tidak dapat diverifikasi. Coba lagi!." }); }
      return done(null, user);
    });
  });
});

const jwtOptions = {
  // perintahkan passport untuk memeriksa authorization headers untuk JWT
  jwtFromRequest: extractJwt.fromAuthHeaderWithScheme('jwt'),
  // perintahkan passport dimana bisa menemukan rahasia
  secretOrKey: config.rahasia
};

// Pengaturan strategi masuk JWT
const jwtLogin = new jwtStrategy(jwtOptions, function (payload: any, done: any) {
  User.findById(payload._id, function (err: any, user: any) {
    if (err) { return done(err, false); }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

passport.use(jwtLogin);
passport.use(localLogin); 