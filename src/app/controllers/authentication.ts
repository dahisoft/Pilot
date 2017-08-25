/**
 * Pustaka Utama (yang mendasari jalannya program ini)
 */
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
let User = require('../models/user');
let config = require('../config/utama');

function generateToken(user: any) {
  return jwt.sign(user, config.rahasia, {
    expiresIn: 10080 // dalam detik
  });
}

// atur informasi pengguna dari permintaan
function setUserInfo(request: any) {
  return {
    _id: request._id,
    firstName: request.profile.firstName,
    lastName: request.profile.lastName,
    email: request.email,
    role: request.role,
  };
}

//========================================
// Rute Masuk
//========================================
exports.login = function (req: any, res: any, next: any) {
  let userInfo = setUserInfo(req.user);
  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo
  });
}


//========================================
// Rute Registrasi
//========================================
exports.register = function (req: any, res: any, next: any) {
  // periksa kesalahan dalam registrasi
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;

  // kirim pesan kesalahan jika email tidak disediakan
  if (!email) {
    return res.status(422).send({ error: 'Anda harus memasukkan email anda.' });
  }

  // kirim pesan kesalahan jika nama lengkap tidak disediakan
  if (!firstName || !lastName) {
    return res.status(422).send({ error: 'Anda harus menyertakan nama lengkap.' });
  }

  // kirim pesan kesalahan jika sandi tidak disediakan
  if (!password) {
    return res.status(422).send({ error: 'Tentukan kata sandi anda.' });
  }

  User.findOne({ email: email }, function (err: any, existingUser: any) {
    if (err) { return next(err); }

    // jika akun penggun tidak unik, kirim pesan kesalahan
    if (existingUser) {
      return res.status(422).send({ error: 'Alamat email telah digunakan.' });
    }

    // jika email unik dan sandi tersedia, buatlah akun
    let user = new User({
      email: email,
      password: password,
      profile: { firstName: firstName, lastName: lastName }
    });

    user.save(function (err: any, user: any) {
      if (err) { return next(err); }
      // respon dengan JWT jika pengguna telah tercipta
      let userInfo = setUserInfo(user);
      res.status(201).json({
        token: 'JWT ' + generateToken(userInfo),
        user: userInfo
      });
    });
  });
}

//==================================s======
// Authorization Middleware
//========================================
// pemeriksaan otorisasi peran
exports.roleAuthorization = function (role: any) {
  return function (req: any, res: any, next: any) {
    const user = req.user;
    user.findById(user._id, function (err: any, foundUser: any) {
      if (err) {
        res.status(422).json({ error: 'Akun pengguna tidak ditemukan.' });
        return next(err);
      }
      // jika pengguna ditemukan, periksa peran
      if (foundUser.role == role) {
        return next();
      }
      res.status(401).json({ error: 'Anda tidak diijinkan melihat konten ini.' });
      return next('Unauthorized');
    })
  }
}