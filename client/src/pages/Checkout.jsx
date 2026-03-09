import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      return resolve(window.Razorpay);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });
}

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
      const { data } = await api(`/api/v1/bookings/create-order/${tourId}`);

      const Razorpay = await loadRazorpayScript();

      const options = {
        key: data.data.keyId,
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'Natours',
        description: tour?.name || 'Tour booking',
        order_id: data.data.orderId,
        handler: async (response) => {
          try {
            await api('/api/v1/bookings/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                ...response,
                tourId: data.data.tourId,
              }),
            });
            setMessage({ type: 'success', text: 'Payment successful! Redirecting…' });
            setTimeout(() => navigate('/my-tours'), 1400);
          } catch (err) {
            setMessage({ type: 'error', text: err.message });
          }
        },
        prefill: {
          name: tour?.name,
        },
        theme: {
          color: '#55c57a',
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="main">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm font-medium text-slate-700">Loading checkout…</p>
        </div>
      </main>
    );
  }

  if (error || !tour) {
    return (
       <main className="main">
        <div className="error">
          <div className="error__title">
            <h2 className="heading-secondary heading-secondary--error">Uh oh! Something went wrong!</h2>
            <h2 className="error__emoji">😢 🤯</h2>
          </div>
          <div className="error__msg">{error || 'Tour not found'}</div>
          <button onClick={() => navigate(-1)} className="btn btn--green mt-6">Go back</button>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Review your booking</h2>
        
        {message && message.type === 'success' && (
           <div className="alert alert--success">{message.text}</div>
        )}
         {message && message.type === 'error' && (
           <div className="alert alert--error">{message.text}</div>
        )}

        <div className="form form--checkout" style={{ maxWidth: '60rem', margin: '0 auto' }}>
          <div className="form__group">
            <h3 className="heading-tertiary ma-bt-sm">{tour.name}</h3>
            <p className="card__text">{tour.summary}</p>
          </div>

          <div className="line" style={{ margin: '3rem 0' }}>&nbsp;</div>

          <div className="form__group" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.6rem' }}>
             <span className="form__label">Duration:</span>
             <span className="card__footer-value">{tour.duration} days</span>
          </div>

          <div className="form__group" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.6rem' }}>
             <span className="form__label">Max participants:</span>
             <span className="card__footer-value">{tour.maxGroupSize}</span>
          </div>

          <div className="form__group" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.6rem', marginTop: '1rem' }}>
             <span className="form__label" style={{ fontWeight: 700 }}>Total Price:</span>
             <span className="card__footer-value" style={{ color: '#55c57a' }}>${tour.price}</span>
          </div>

          <div className="form__group right" style={{ marginTop: '4rem' }}>
            <button
              onClick={handlePay}
              disabled={paying}
              className="btn btn--green"
            >
              {paying ? 'Processing...' : `Book Tour with Razorpay`}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
