import { useEffect, useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

export default function MyTours() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
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

    loadBookings();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-slate-900">My bookings</h1>
        <p className="mt-2 text-sm text-slate-600">View your upcoming trips and explore details.</p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow">
            <div className="h-3 w-3 animate-pulse rounded-full bg-primary-600" />
            <span className="text-sm font-medium text-slate-700">Loading bookings…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-base font-medium text-slate-700">You don&apos;t have any bookings yet.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            Browse tours
          </Link>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <article
              key={booking._id}
              className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{booking.tour.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">Price: ₹{booking.tour.price}</p>
                  <p className="mt-1 text-sm text-slate-600">Status: {booking.paid ? 'Paid' : 'Pending'}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/tour/${booking.tour.slug}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    View tour
                  </Link>
                  {!booking.paid && (
                    <Link
                      to={`/checkout/${booking.tour._id}`}
                      className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                    >
                      Pay now
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
