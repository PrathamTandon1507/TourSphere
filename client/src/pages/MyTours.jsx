import { useEffect, useState } from 'react';
import { api } from '../api';
import { Link, useLocation } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';

export default function MyTours() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    if (successParam) {
      // Handle success notification smoothly without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const verifyAndLoad = async () => {
      setLoading(true);
      try {

        const { data } = await api('/api/v1/bookings/my-bookings');
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();
  }, []);

  return (
    <main className="main">
      <div className="user-view">
        <UserSidebar activeTab="bookings" />

        <div className="user-view__content">
          <div className="user-view__form-container" style={{ maxWidth: '100%' }}>
            <h2 className="heading-secondary ma-bt-md">Your Bookings</h2>
            
            {loading && (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm font-medium text-slate-700">Loading bookings…</p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-rose-50 p-6 text-sm text-rose-700 shadow-sm ma-bt-md">
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            )}

            {!loading && !error && bookings.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <p className="text-base font-medium text-slate-700">You don't have any bookings yet.</p>
                <Link
                  to="/"
                  className="btn btn--green btn--small"
                  style={{ marginTop: '2rem' }}
                >
                  Browse tours
                </Link>
              </div>
            )}

            {!loading && !error && bookings.length > 0 && (
              <div className="card-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {bookings.map((booking) => (
                  <div key={booking._id} className="card">
                    <div className="card__header">
                      <div className="card__picture">
                        <div className="card__picture-overlay">&nbsp;</div>
                        <img
                          className="card__picture-img"
                          src={`/img/tours/${booking.tour.imageCover}`}
                          alt={booking.tour.name}
                        />
                      </div>
                      <h3 className="heading-tertirary">
                        <span>{booking.tour.name}</span>
                      </h3>
                    </div>

                    <div className="card__details">
                      <h4 className="card__sub-heading">Tour Details</h4>
                      <p className="card__text">{booking.tour.duration} day tour</p>
                      <div className="card__data">
                        <svg className="card__icon">
                          <use xlinkHref="/img/icons.svg#icon-map-pin" />
                        </svg>
                        <span>{booking.tour.startLocation?.description || 'Various locations'}</span>
                      </div>
                      <div className="card__data">
                        <svg className="card__icon">
                          <use xlinkHref="/img/icons.svg#icon-calendar" />
                        </svg>
                        <span>Purchased: {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="card__data">
                        <svg className="card__icon">
                          <use xlinkHref="/img/icons.svg#icon-credit-card" />
                        </svg>
                        <span>₹{booking.price}</span>
                      </div>
                    </div>

                    <div className="card__footer">
                      <p>
                        <span className="card__footer-value">Status: </span>
                        <span className="card__footer-text font-bold text-green-600 uppercase">
                          {booking.paid ? 'Confirmed' : 'Pending'}
                        </span>
                      </p>
                      <Link to={`/tour/${booking.tour.slug}`} className="btn btn--green btn--small">
                        View Tour
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
