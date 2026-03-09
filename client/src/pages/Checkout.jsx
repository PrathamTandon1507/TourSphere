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
    <main className="py-16 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Review your booking</h2>
          <p className="text-slate-600">Complete your tour booking with PhonePe</p>
        </div>

        {/* Alerts */}
        {message && message.type === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{message.text}</p>
          </div>
        )}
        {message && message.type === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{message.text}</p>
          </div>
        )}

        {/* Booking Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tour Image */}
          {tour.imageCover && (
            <div className="h-64 bg-slate-200 overflow-hidden">
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
          <div className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">{tour.name}</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">{tour.summary}</p>

            {/* Divider */}
            <div className="border-t border-slate-200 my-8"></div>

            {/* Tour Details */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-700 font-semibold">Duration:</span>
                <span className="text-slate-900 text-lg">{tour.duration} days</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-700 font-semibold">Max Group Size:</span>
                <span className="text-slate-900 text-lg">{tour.maxGroupSize} people</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 pt-4">
                <span className="text-slate-900 font-bold text-lg">Total Price:</span>
                <span className="text-primary-600 font-bold text-2xl">${tour.price}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePay}
              disabled={paying}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${ 
                paying 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
              }`}
            >
              {paying && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {paying ? 'Redirecting to PhonePe...' : 'Pay with PhonePe'}
            </button>

            {/* Info */}
            <p className="text-center text-sm text-slate-500 mt-6">
              💳 Secure payment powered by PhonePe
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
