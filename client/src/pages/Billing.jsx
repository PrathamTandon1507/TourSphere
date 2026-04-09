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
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen rounded-3px overflow-hidden shadow-[0_2.5rem_8rem_2rem_rgba(0,0,0,0.07)] flex">
        <UserSidebar activeTab="billing" />

        <div className="flex-1 py-[7rem] px-0">
          <div className="max-w-[100%] mx-auto px-[8rem]">
            <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] mb-[3rem]">Billing History</h2>
            
            {loading && (
              <div className="flex items-center justify-center py-10">
                <p className="text-[1.8rem] font-medium text-primary-200">Loading billing history…</p>
              </div>
            )}

            {error && (
              <div className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            )}

            {!loading && !error && bookings.length === 0 && (
              <p className="text-[1.8rem] font-medium text-grey-500">No transaction history found.</p>
            )}

            {!loading && !error && bookings.length > 0 && (
              <div className="overflow-x-auto rounded-[1rem] shadow-[0_1rem_3rem_rgba(0,0,0,0.1)] bg-white">
                <table className="w-full text-left text-[1.5rem] border-collapse">
                  <thead>
                    <tr className="bg-grey-400 text-primary-1000 uppercase font-bold text-[1.3rem]">
                      <th className="px-6 py-4 border-b border-grey-400">Date</th>
                      <th className="px-6 py-4 border-b border-grey-400">Tour</th>
                      <th className="px-6 py-4 border-b border-grey-400">Transaction ID</th>
                      <th className="px-6 py-4 border-b border-grey-400">Amount</th>
                      <th className="px-6 py-4 border-b border-grey-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grey-400">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-primary-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary-1000">
                          {booking.tour.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-[1.2rem] text-grey-500">
                          #{booking._id.substring(0, 12).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary-1000">
                          ${booking.price}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[1.2rem] font-bold uppercase ${
                            booking.paid ? 'bg-primary-200 text-white' : 'bg-orange-main text-white'
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
