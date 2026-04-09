import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';



export default function Checkout() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadTour = async () => {
      setLoading(true);
      try {
        const { data } = await api(`/api/v1/tours/${encodeURIComponent(tourId)}`);
        setTour(data.doc);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tourId) loadTour();
  }, [tourId]);

  const handlePay = async () => {
    setPaying(true);
    setMessage(null);
    try {
      const { data } = await api(`/api/v1/bookings/create-order/${tourId}`, {
        method: 'POST',
      });
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL not found');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center py-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-sm font-medium text-slate-700">Loading checkout…</p>
        </div>
      </main>
    );
  }

  if (error || !tour) {
    return (
      <main className="flex items-center justify-center py-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-md w-full px-6 py-12 bg-white rounded-lg shadow-md text-center">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-primary-600 mb-2">Uh oh!</h2>
            <p className="text-5xl mb-4">😢</p>
          </div>
          <div className="text-slate-600 mb-6">{error || 'Tour not found'}</div>
          <button 
            onClick={() => navigate(-1)} 
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Go back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="py-[8rem] bg-primary-50 min-h-screen relative">
      <div className="max-w-[80rem] mx-auto px-4">
        {/* Header */}
        <div className="mb-[4rem] text-center">
          <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[1rem]">Review your booking</h2>
          <p className="text-[1.8rem] text-grey-500">Complete your tour booking with PhonePe</p>
        </div>

        {/* Alerts */}
        {message && message.type === 'success' && (
          <div className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#20bf6b] rounded-[5px] shadow-sm">
            <p>{message.text}</p>
          </div>
        )}
        {message && message.type === 'error' && (
          <div className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">
            <p>{message.text}</p>
          </div>
        )}

        {/* Booking Card */}
        <div className="bg-white rounded-[1rem] shadow-[0_2.5rem_8rem_2rem_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Tour Image */}
          {tour.imageCover && (
            <div className="h-[30rem] bg-grey-400 overflow-hidden">
              <img 
                src={`/img/tours/${tour.imageCover}`} 
                alt={tour.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Booking Details */}
          <div className="p-[4rem]">
            <h3 className="text-[2rem] font-bold text-primary-1000 mb-[1.5rem] uppercase">{tour.name}</h3>
            <p className="text-[1.6rem] text-grey-500 mb-[3rem] leading-relaxed italic">{tour.summary}</p>

            {/* Divider */}
            <div className="border-t border-grey-400 my-[3rem]"></div>

            {/* Tour Details */}
            <div className="space-y-[1rem] mb-[4rem]">
              <div className="flex justify-between items-center py-2 text-[1.6rem]">
                <span className="text-grey-600 font-bold uppercase">Duration:</span>
                <span className="text-primary-1000 font-normal">{tour.duration} days</span>
              </div>
              <div className="flex justify-between items-center py-2 text-[1.6rem]">
                <span className="text-grey-600 font-bold uppercase">Max Group Size:</span>
                <span className="text-primary-1000 font-normal">{tour.maxGroupSize} people</span>
              </div>
              <div className="flex justify-between items-center py-[2rem] border-t border-grey-400 mt-4">
                <span className="text-primary-1000 font-bold text-[1.8rem] uppercase">Total Price:</span>
                <span className="text-primary-200 font-bold text-[2.4rem]">${tour.price}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePay}
              disabled={paying}
              className={`w-full py-[1.5rem] px-[3rem] rounded-[10rem] font-bold text-white uppercase text-[1.6rem] transition-all flex items-center justify-center gap-2 ${ 
                paying 
                  ? 'bg-grey-500 cursor-not-allowed' 
                  : 'bg-primary-200 hover:bg-primary-100 hover:shadow-btn active:shadow-btn-active active:-translate-y-[1px]'
              }`}
            >
              {paying && (
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {paying ? 'Redirecting...' : 'Pay with PhonePe'}
            </button>

            {/* Info */}
            <p className="text-center text-[1.4rem] text-grey-500 mt-[2rem]">
              💳 Secure payment powered by PhonePe
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
