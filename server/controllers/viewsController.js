const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1. Get tour data
  const tours = await Tour.find();

  //2. build template
  //3. render template based on tour data
  res.status(200).render('overview', {
    title: 'Get All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1. Get tour data
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user photo',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name!', 404));
  }
  //2. build template
  //3. render template based on tour data
  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up',
  });
};

exports.getForgotPasswordForm = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot password',
  });
};

exports.getResetPasswordForm = (req, res) => {
  res.status(200).render('resetPassword', {
    title: 'Reset password',
    token: req.params.token,
  });
};

exports.getCheckout = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  res.status(200).render('checkout', {
    title: 'Checkout',
    tour,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const Booking = require('../models/bookingModel');
  const bookings = await Booking.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover price duration',
  });
  res.status(200).render('myTours', {
    title: 'My Bookings',
    bookings,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).render('account', {
    title: 'Account Information',
    user,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Account Information',
    user: updatedUser,
  });
});
