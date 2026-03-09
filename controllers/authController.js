const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, code, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, //cannot be modified by browser to avoid cross site scripting attacks (XSS)
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; //to remove password from output
  res.status(code).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  //creating jwt
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1. check if email/pass exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //2. if user exists and pass is valid
  const user = await User.findOne({ email }).select('+password'); //to also include password (using +password because by defualt we did select: false, so to include it here in our user obj we need to explicitly state/add/select password too)

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }
  //3. everything fine, send message back to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1. get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log(token);
  //if the user is not logged in then the user will not be able to access all tours
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  //2. validate/verify token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. check if user exists
  const currUser = await User.findById(decode.id);
  if (!currUser) return next(new AppError('The user no longer exists', 401));

  //4. check if user changed pass after jwt/token was issued
  if (currUser.changedPasswordAfter(decode.iat))
    return next(
      new AppError(
        'Password has been changed recently. Please login again',
        401,
      ),
    );

  //call next

  req.user = currUser;
  res.locals.user = currUser;

  next();
});

//only used for rendering purposes
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    //2. validate/verify token
    const decode = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );

    //3. check if user exists
    const currUser = await User.findById(decode.id);
    if (!currUser) return next();

    //4. check if user changed pass after jwt/token was issued
    if (currUser.changedPasswordAfter(decode.iat)) return next();

    //call next

    res.locals.user = currUser;
    return next();
  }
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 401),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1 Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('User not found!', 404));

  //2 Generate the random reset token
  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  // const message = `Forgot password? Submit a PATCH request with new password and passwordConfirm to: ${resetURL}\nIf you didn't, then ignore this message.`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: `Your password reset token: ${resetURL} [valid for 10 mins]`,
    //   message,
    // });
    // 3 Send it to user's email
    const host = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const resetURL = `${host}/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    // Log the actual error to help diagnose email delivery issues.
    console.error('Forgot password email error:', err);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2 if token not expired and user is valid, set new password
  if (!user) {
    return next(new AppError('Token is either invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3. update the changedPasswordAt property

  //4. Log the user in (with new pass), send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. get user
  const user = await User.findById(req.user.id).select('+password');

  //2. check if POSTed password is correct
  if (!user.correctPassword(req.body.passwordCurrent, user.password))
    return next(new AppError('Please enter correct password', 401));
  //3. update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4. log the user in, send JWT
  createSendToken(user, 200, res);
});
