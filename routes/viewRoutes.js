const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = new express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);
router.get('/forgot-password', viewsController.getForgotPasswordForm);
router.get('/reset-password/:token', viewsController.getResetPasswordForm);
router.get('/me', authController.protect, viewsController.getMe);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.get('/checkout/:tourId', authController.protect, viewsController.getCheckout);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

module.exports = router;
