/**
 * Pustaka Utama (yang mendasari jalannya program ini)
 */
import * as bcrypt from 'bcrypt-nodejs';
import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

//================================
// Skema Pengguna
//================================
const UserSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String }
  },
  role: {
    type: String,
    enum: ['Member', 'Client', 'Owner', 'Admin'],
    default: 'Member'
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
},
  {
    timestamps: true
  });

// pra-penyimpanan pengguna di basisdata, sandi acak jika sandi dimodifikasi atau baru
UserSchema.pre('save', function (next) {
  const user = this,
    SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// metode untuk membandingkan sandi untuk masuk
UserSchema.methods.comparePassword = function(candidatePassword:any, cb:any) {  
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return cb(err); }

    cb(null, isMatch);
  });
}

module.exports = mongoose.model('User', UserSchema);