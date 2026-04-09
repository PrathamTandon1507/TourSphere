import { useEffect, useState } from 'react';
import { api } from '../api';
import { Link, useLocation } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import Loader from '../components/Loader';

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
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen rounded-3px overflow-hidden shadow-[0_2.5rem_8rem_2rem_rgba(0,0,0,0.07)] flex">
        <UserSidebar activeTab="bookings" />

        <div className="flex-1 py-[7rem] px-0">
          <div className="max-w-[100%] mx-auto px-[8rem]">
            <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] mb-[3rem]">Your Bookings</h2>
            
            {loading && (
              <div className="flex items-center justify-center py-20 min-h-[50vh]">
                <Loader />
              </div>
            )}

            {error && (
              <div className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            )}

            {!loading && !error && bookings.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <p className="text-[1.8rem] font-medium text-grey-500">You don't have any bookings yet.</p>
                <Link
                  to="/"
                  className="bg-primary-200 text-white uppercase text-[1.4rem] py-[1.25rem] px-[3rem] rounded-full transition-all duration-200 hover:bg-primary-100 mt-[2rem] inline-block"
                >
                  Browse tours
                </Link>
              </div>
            )}

            {!loading && !error && bookings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[5rem] mt-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-[3px] shadow-[0_1.5rem_4rem_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 flex flex-col">
                    <div className="relative">
                      <div className="relative [clip-path:polygon(0_0,100%_0,100%_85%,0_100%)] h-[22rem]">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-300 opacity-70 z-10">&nbsp;</div>
                        <img
                          className="object-cover w-full h-full"
                          src={`/img/tours/${booking.tour.imageCover}`}
                          alt={booking.tour.name}
                          onError={(e) => { e.target.src = '/img/tours/tour-1-cover.jpg'; }}
                        />
                      </div>
                      <h3 className="text-[2.75rem] text-right absolute bottom-[1rem] right-[2rem] text-white uppercase font-light z-20 w-[70%]">
                        <span className="p-[1rem_1.5rem] [box-decoration-break:clone] bg-gradient-to-br from-[rgba(125,213,111,0.85)] to-[rgba(40,180,135,0.85)]">{booking.tour.name}</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-[2.5rem_3rem] p-[3rem]">
                      <h4 className="text-[1.2rem] uppercase font-bold col-span-full">Tour Details</h4>
                      <p className="text-[1.5rem] italic mb-[-1rem] col-span-full">{booking.tour.duration} day tour</p>
                      <div className="text-[1.3rem] flex items-center">
                        <svg className="mr-[0.7rem] h-[2rem] w-[2rem] fill-primary-200">
                          <use xlinkHref="/img/icons.svg#icon-map-pin" />
                        </svg>
                        <span>{booking.tour.startLocation?.description || 'Various locations'}</span>
                      </div>
                      <div className="text-[1.3rem] flex items-center">
                        <svg className="mr-[0.7rem] h-[2rem] w-[2rem] fill-primary-200">
                          <use xlinkHref="/img/icons.svg#icon-calendar" />
                        </svg>
                        <span>Purchased: {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[1.3rem] flex items-center">
                        <svg className="mr-[0.7rem] h-[2rem] w-[2rem] fill-primary-200">
                          <use xlinkHref="/img/icons.svg#icon-credit-card" />
                        </svg>
                        <span>${booking.price}</span>
                      </div>
                    </div>

                    <div className="bg-primary-50 p-[2.5rem_3rem] border-t border-grey-400 mt-auto flex justify-between items-center">
                      <p className="text-[1.4rem]">
                        <span className="font-bold">Status: </span>
                        <span className={`uppercase font-bold ${booking.paid ? 'text-[#20bf6b]' : 'text-orange-main'}`}>
                          {booking.paid ? 'Confirmed' : 'Pending'}
                        </span>
                      </p>
                      <Link to={`/tour/${booking.tour.slug}`} className="bg-primary-200 text-white uppercase text-[1.2rem] py-[1rem] px-[2rem] rounded-full transition-all duration-200 hover:bg-primary-100">
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
