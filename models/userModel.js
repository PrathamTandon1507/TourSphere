const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    unique: [true, 'Username already being used!'],
    trim: true,
    validate: {
      validator: function (value) {
        return !/<[^>]*>/.test(value);
      },
      message: 'Name cannot contain HTML tags or special symbols!',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'tour-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Please enter a password with at least 8 characters.'],
    select: false, //to avoid showing every users password by default
  },
  passwordConfirm: {
    type: String,
    validate: {
      //THIS ONLY WORKS ON CREATE AND SAVE
      validator: function (val) {
        return val === this.password;
      },
      message: 'Please enter the same password.',
    },
    required: true,
    select: false, //to avoid showing every users password by default
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //esnures token is created after password has been changed
  next();
});

userSchema.pre('save', async function (next) {
  //if password not modified then move to next func and ignore this
  if (!this.isModified('password')) return next();
  // otherwise encrypt password
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (timeJWT) {
  if (this.passwordChangedAt) {
    const timestampChange = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(timestampChange, timeJWT);
    return timeJWT < timestampChange;
  }
  return false;
};

userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  console.log({ token }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
