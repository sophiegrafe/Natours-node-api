const mongoose = require('mongoose');
const validator = require('validator');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [
      true,
      'Your name is require to fullfil your inscription.',
    ],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please provide a valide email',
    ],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password'],
    validate: {
      // This only works on .create() and .save() !
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords don't match",
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await argon2.hash(
    this.password
  );
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.checkPassword =
  async function (givenPassword, userPassword) {
    return await argon2.verify(
      givenPassword,
      userPassword
    );
  };

userSchema.methods.changedPasswordAfter =
  function (JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  };

const User = mongoose.model('User', userSchema);

module.exports = User;
