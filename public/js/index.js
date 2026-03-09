/* eslint-disable */
import '@babel/polyfill';
import { login, logout, signup } from './login';
import { displayMap } from './leaflet';
import { updateSettings } from './updateSettings';
import { forgotPassword } from './forgotPassword';
import { resetPassword } from './resetPassword';
import { initCheckout } from './checkout';
import { initAccountTabs } from './accountTabs';

const loginForm = document.querySelector('.form--login');
const mapElement = document.getElementById('map');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

const signupForm = document.querySelector('.form--signup');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (updateForm) {
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);

      await updateSettings(form, 'data');
    } catch (err) {
      console.error('Update failed:', err);
    }
  });
}

if (passwordForm) {
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save-password').textContent =
      'Update Password';
  });
}

const forgotPasswordForm = document.querySelector('.form--forgot-password');
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgotPassword(email);
  });
}

const resetPasswordForm = document.querySelector('.form--reset-password');
if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const token = resetPasswordForm.dataset.token;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    resetPassword(password, passwordConfirm, token);
  });
}

const bookTourBtn = document.getElementById('book-tour-btn');
if (bookTourBtn) {
  bookTourBtn.addEventListener('click', () => {
    const tourId = bookTourBtn.dataset.tourId;
    initCheckout(tourId);
  });
}

if (document.querySelector('.user-view')) {
  initAccountTabs();
}
