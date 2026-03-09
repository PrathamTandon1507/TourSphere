import { useEffect, useState } from 'react';
import { api } from '../api';
import UserSidebar from '../components/UserSidebar';

export default function Billing() {
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
    <main className="main">
      <div className="user-view">
        <UserSidebar activeTab="billing" />

        <div className="user-view__content">
          <div className="user-view__form-container" style={{ maxWidth: '100%' }}>
            <h2 className="heading-secondary ma-bt-md">Billing History</h2>
            
            {loading && (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm font-medium text-slate-700">Loading billing history…</p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-rose-50 p-6 text-sm text-rose-700 shadow-sm ma-bt-md">
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            )}

            {!loading && !error && bookings.length === 0 && (
              <p className="text-base font-medium text-slate-700">No transaction history found.</p>
            )}

            {!loading && !error && bookings.length > 0 && (
              <div className="overflow-x-auto rounded-lg shadow-sm border border-slate-200">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tour</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {booking.tour.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {booking._id.substring(0, 12).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          ₹{booking.price}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            booking.paid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {booking.paid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
