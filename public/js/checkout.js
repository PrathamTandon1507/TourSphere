/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    document.body.appendChild(script);
  });

export const initCheckout = async (tourId) => {
  try {
    const { data } = await axios({
      method: 'GET',
      url: `/api/v1/bookings/create-order/${tourId}`,
    });

    if (data.status !== 'success') {
      showAlert('error', 'Failed to create order');
      return;
    }

    const { orderId, amount, currency, keyId } = data.data;

    await loadRazorpayScript();

    const options = {
      key: keyId,
      amount,
      currency,
      name: 'TourSphere',
      description: 'Tour booking',
      order_id: orderId,
      handler(response) {
        verifyPayment(response, tourId);
      },
      prefill: {
        name: '',
        email: '',
      },
      theme: {
        color: '#55c57a',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    showAlert('error', err.response?.data?.message || err.message);
  }
};

const verifyPayment = async (response, tourId) => {
  try {
    await axios({
      method: 'POST',
      url: '/api/v1/bookings/verify-payment',
      data: {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        tourId,
      },
    });

    showAlert('success', 'Payment successful! Redirecting...');
    window.setTimeout(() => {
      location.assign('/my-tours');
    }, 1500);
  } catch (err) {
    showAlert('error', err.response?.data?.message || err.message);
  }
};
