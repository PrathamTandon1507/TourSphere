const crypto = require('crypto');
const Razorpay = require('razorpay');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// Razorpay instance (use test keys from https://dashboard.razorpay.com/app/keys)
const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

/**
 * Create a Razorpay order for a tour (amount in paise for INR)
 */
exports.createOrder = catchAsync(async (req, res, next) => {
  if (!razorpay) {
    return next(
      new AppError(
        'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to config.env',
        500,
      ),
    );
  }

  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  const amount = Math.round(tour.price * 100); // Razorpay expects amount in paise (INR)
  // Let Razorpay validate minimum amounts; we just ensure it's positive
  if (!Number.isFinite(amount) || amount <= 0) {
    return next(new AppError('Invalid tour price for payment', 400));
  }

  // Razorpay enforces a max length of 40 chars for the receipt field.
  // Keep it short but still reasonably traceable (tour + user + random suffix).
  const receipt = `tour_${tour._id.toString().slice(-6)}_${req.user.id.toString().slice(-6)}_${crypto.randomBytes(3).toString('hex')}`;

  const options = {
    amount,
    currency: 'INR',
    receipt: receipt.slice(0, 40),
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({
    status: 'success',
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      tourId: req.params.tourId,
    },
  });
});

/**
 * Verify Razorpay payment signature and create booking
 */
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tourId } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !tourId) {
    return next(new AppError('Invalid payment data', 400));
  }

  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return next(new AppError('Invalid payment signature', 400));
  }

  await Booking.create({
    tour: tourId,
    user: req.user.id,
    price: tour.price,
    paid: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Payment verified. Booking created.',
    data: { tourId },
  });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover price duration',
  });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: { bookings },
  });
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
