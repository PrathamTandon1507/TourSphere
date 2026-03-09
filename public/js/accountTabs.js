/* eslint-disable */

import axios from 'axios';

const renderBookings = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return '<p>You have no bookings yet. <a href="/">Browse tours</a></p>';
  }
  return bookings
    .map(
      (b) => `
    <div class="card ma-bt-md">
      <div class="card__details">
        <h4 class="card__sub-heading">${b.tour.name}</h4>
        <p>${b.tour.duration} day tour · Paid ₹${b.price}</p>
        <a href="/tour/${b.tour.slug}" class="btn btn--small btn--green">View tour</a>
      </div>
    </div>
  `,
    )
    .join('');
};

const renderReviews = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return '<p>You have not written any reviews yet.</p>';
  }
  return reviews
    .map(
      (r) => `
    <div class="card ma-bt-md">
      <div class="card__details">
        <h4 class="card__sub-heading">${r.tour?.name || 'Tour'}</h4>
        <p>Rating: ${r.rating}/5</p>
        <p>${r.review}</p>
        <a href="/tour/${r.tour?.slug}" class="btn btn--small btn--green">View tour</a>
      </div>
    </div>
  `,
    )
    .join('');
};

const renderBilling = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return '<p>No payment history.</p>';
  }
  const total = bookings.reduce((sum, b) => sum + b.price, 0);
  return `
    <p class="ma-bt-md"><strong>Total spent:</strong> ₹${total}</p>
    ${bookings
      .map(
        (b) => `
      <div class="card ma-bt-md">
        <div class="card__details">
          <p>${b.tour.name} · ₹${b.price}</p>
        </div>
      </div>
    `,
      )
      .join('')}
  `;
};

export const initAccountTabs = () => {
  const tabs = document.querySelectorAll('.nav-tab[data-tab]');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab) => {
    tab.addEventListener('click', async (e) => {
      e.preventDefault();
      const target = tab.dataset.tab;
      if (!target) return;

      tabs.forEach((t) => t.parentElement.classList.remove('side-nav--active'));
      tab.parentElement.classList.add('side-nav--active');

      contents.forEach((c) => {
        c.style.display = c.id === `${target}-tab` ? 'block' : 'none';
      });

      const bookingsList = document.getElementById('bookings-list');
      const reviewsList = document.getElementById('reviews-list');
      const billingList = document.getElementById('billing-list');

      if (target === 'bookings' && bookingsList && !bookingsList.dataset.loaded) {
        bookingsList.innerHTML = '<p>Loading...</p>';
        try {
          const { data } = await axios.get('/api/v1/bookings/my-bookings');
          bookingsList.innerHTML = renderBookings(data.data.bookings);
          bookingsList.dataset.loaded = 'true';
        } catch {
          bookingsList.innerHTML = '<p>Failed to load bookings.</p>';
        }
      }

      if (target === 'reviews' && reviewsList && !reviewsList.dataset.loaded) {
        reviewsList.innerHTML = '<p>Loading...</p>';
        try {
          const { data } = await axios.get('/api/v1/users/my-reviews');
          reviewsList.innerHTML = renderReviews(data.data.reviews);
          reviewsList.dataset.loaded = 'true';
        } catch {
          reviewsList.innerHTML = '<p>Failed to load reviews.</p>';
        }
      }

      if (target === 'billing' && billingList && !billingList.dataset.loaded) {
        billingList.innerHTML = '<p>Loading...</p>';
        try {
          const { data } = await axios.get('/api/v1/bookings/my-bookings');
          billingList.innerHTML = renderBilling(data.data.bookings);
          billingList.dataset.loaded = 'true';
        } catch {
          billingList.innerHTML = '<p>Failed to load billing.</p>';
        }
      }
    });
  });
};
