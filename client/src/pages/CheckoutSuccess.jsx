import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const txnId = searchParams.get('txnId');

      if (!txnId) {
        setStatus('failed');
        setMessage('No transaction found');
        setTimeout(() => navigate('/my-tours'), 3000);
        return;
      }

      try {
        const { data } = await api('/api/v1/bookings/verify-payment', {
          method: 'POST',
          body: JSON.stringify({ transactionId: txnId }),
        });

        setStatus('success');
        setMessage(data.message || 'Payment verified! Your booking is confirmed.');
        setTimeout(() => navigate('/my-tours'), 3000);
      } catch (err) {
        setStatus('failed');
        setMessage(err.message || 'Payment verification failed. Please try again.');
        setTimeout(() => navigate('/my-tours'), 5000);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <main className="flex items-center justify-center py-20 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md w-full px-6 py-12 bg-white rounded-lg shadow-lg text-center">
        {status === 'verifying' && (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment</h2>
            <p className="text-slate-600">Please wait while we confirm your payment...</p>
            <p className="text-xs text-slate-500 mt-4">You will be redirected shortly</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="inline-block rounded-full bg-green-100 p-3">
                <svg
                  className="h-8 w-8 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-slate-600 mb-2">{message}</p>
            <p className="text-xs text-slate-500">Redirecting to My Tours...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="inline-block rounded-full bg-red-100 p-3">
                <svg
                  className="h-8 w-8 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/my-tours')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Go to My Tours
            </button>
            <p className="text-xs text-slate-500 mt-3">Redirecting in 5 seconds...</p>
          </>
        )}
      </div>
    </main>
  );
}
