const crypto = require('crypto');
const axios = require('axios');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const MERCHANT_ID = process.env.CLIENT_ID;
const SALT_KEY = process.env.CLIENT_KEY_SECRET;
const SALT_INDEX = 1;
const PHONEPE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';
const PHONEPE_STATUS_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status';

// Store pending transactions temporarily (in production, use Redis or DB)
const pendingTransactions = new Map();

/**
 * Create a PhonePe payment session for a tour
 */
exports.createOrder = catchAsync(async (req, res, next) => {
  if (!MERCHANT_ID || !SALT_KEY) {
    return next(new AppError('PhonePe keys not configured. Contact admin.', 500));
  }

  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError('Tour not found', 404));

  const amount = Math.round(tour.price * 100); // PhonePe expects amount in paise (INR)
  const transactionId = `T${Date.now()}${req.user.id.toString().slice(-6)}`;

  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: transactionId,
    merchantUserId: `${req.user.id}`,
    amount: amount,
    redirectUrl: `${req.protocol}://${req.get('host')}/api/v1/bookings/callback?transactionId=${transactionId}`,
    redirectMode: 'REDIRECT',
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const verifyString = base64Payload + '/pg/v1/pay' + SALT_KEY;
  const checksum = crypto.createHash('sha256').update(verifyString).digest('hex') + '###' + SALT_INDEX;

  try {
    const response = await axios.post(
      PHONEPE_URL,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
      },
    );

    if (response.data.success && response.data.data.instrumentResponse.redirectInfo?.url) {
      // Store transaction details for later verification
      pendingTransactions.set(transactionId, {
        tourId: req.params.tourId,
        userId: req.user.id,
        amount: amount,
        createdAt: Date.now(),
      });

      res.status(200).json({
        status: 'success',
        data: {
          paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
          transactionId: transactionId,
        },
      });
    } else {
      return next(new AppError(response.data.message || 'PhonePe payment creation failed', 400));
    }
  } catch (err) {
    console.error('PhonePe API error:', err.response?.data || err.message);
    return next(new AppError(`PhonePe error: ${err.response?.data?.message || err.message}`, 500));
  }
});

/**
 * Verify PhonePe payment and create booking
 */
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    return next(new AppError('Transaction ID missing', 400));
  }

  // Get transaction details from storage
  const txnData = pendingTransactions.get(transactionId);
  if (!txnData) {
    return next(new AppError('Transaction not found or expired', 400));
  }

  try {
    // Verify payment status with PhonePe
    const verifyString = `/pg/v1/status/${MERCHANT_ID}/${transactionId}` + SALT_KEY;
    const checksum = crypto.createHash('sha256').update(verifyString).digest('hex') + '###' + SALT_INDEX;

    const statusResponse = await axios.get(
      `${PHONEPE_STATUS_URL}/${MERCHANT_ID}/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
      },
    );

    if (statusResponse.data.success && statusResponse.data.data.state === 'COMPLETED') {
      const tour = await Tour.findById(txnData.tourId);
      if (!tour) {
        return next(new AppError('Tour not found', 404));
      }

      // Create booking
      await Booking.create({
        tour: txnData.tourId,
        user: txnData.userId,
        price: txnData.amount / 100, // Convert paise back to rupees
        paid: true,
      });

      // Clear transaction from storage
      pendingTransactions.delete(transactionId);

      res.status(200).json({
        status: 'success',
        message: 'Payment verified. Booking created successfully!',
        data: { tourId: txnData.tourId },
      });
    } else {
      return next(
        new AppError(
          `Payment ${statusResponse.data.data.state || 'FAILED'}: ${statusResponse.data.message}`,
          400,
        ),
      );
    }
  } catch (err) {
    console.error('PhonePe verification error:', err.message);
    return next(new AppError(`Payment verification failed: ${err.message}`, 500));
  }
});

/**
 * Handle PhonePe redirect callback
 */
exports.handlePhonePeCallback = catchAsync(async (req, res, next) => {
  const { transactionId } = req.query;
  const frontendUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : (process.env.FRONTEND_URL || 'http://localhost:5173');
  if (!transactionId) {
    return res.redirect(`${frontendUrl}/my-tours?error=No transaction found`);
  }

  try {
    // Verify payment with PhonePe
    const verifyString = `/pg/v1/status/${MERCHANT_ID}/${transactionId}` + SALT_KEY;
    const checksum = crypto.createHash('sha256').update(verifyString).digest('hex') + '###' + SALT_INDEX;

    const statusResponse = await axios.get(
      `${PHONEPE_STATUS_URL}/${MERCHANT_ID}/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
      },
    );

    if (statusResponse.data.success && statusResponse.data.data.state === 'COMPLETED') {
      const txnData = pendingTransactions.get(transactionId);
      if (txnData) {
        const tour = await Tour.findById(txnData.tourId);
        if (tour) {
          // Create booking
          await Booking.create({
            tour: txnData.tourId,
            user: txnData.userId,
            price: txnData.amount / 100,
            paid: true,
          });
          pendingTransactions.delete(transactionId);
        }
      }
      res.redirect(`${frontendUrl}/my-tours?success=Booking confirmed!`);
    } else {
      console.error('PhonePe verification failed:', statusResponse.data);
      res.redirect(`${frontendUrl}/my-tours?error=${encodeURIComponent(statusResponse.data.message || 'Payment failed')}`);
    }
  } catch (err) {
    console.error('PhonePe callback fetch error:', err.response?.data || err.message);
    res.redirect(`${frontendUrl}/my-tours?error=${encodeURIComponent('Payment verification failed')}`);
  }
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
