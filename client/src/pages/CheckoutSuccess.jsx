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
    <main className="bg-primary-50 min-h-screen py-[8rem] flex items-center justify-center relative">
      <div className="bg-white rounded-[1rem] shadow-[0_2.5rem_8rem_2rem_rgba(0,0,0,0.06)] p-[5rem] text-center max-w-[50rem] w-full mx-[2rem]">
        {status === 'verifying' && (
          <>
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-primary-200 mb-6"></div>
            <h2 className="text-[2.25rem] uppercase font-bold text-primary-1000 mb-2">Verifying Payment</h2>
            <p className="text-[1.6rem] text-grey-500">Please wait while we confirm your payment...</p>
            <p className="text-[1.2rem] text-grey-400 mt-6 uppercase">You will be redirected shortly</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="inline-block rounded-full bg-[#20bf6b] p-4 text-white">
                <svg
                  className="h-10 w-10"
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
            <h2 className="text-[2.25rem] uppercase font-bold text-[#20bf6b] mb-2">Payment Successful!</h2>
            <p className="text-[1.8rem] text-grey-500 mb-2">{message}</p>
            <p className="text-[1.2rem] text-grey-400 uppercase mt-4">Redirecting to My Tours...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="inline-block rounded-full bg-[#eb4d4b] p-4 text-white">
                <svg
                  className="h-10 w-10"
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
            <h2 className="text-[2.25rem] uppercase font-bold text-[#eb4d4b] mb-2">Payment Failed</h2>
            <p className="text-[1.8rem] text-grey-500 mb-6">{message}</p>
            <button
              onClick={() => navigate('/my-tours')}
              className="bg-primary-200 text-white uppercase text-[1.4rem] py-[1.25rem] px-[3rem] rounded-full transition-all duration-200 hover:bg-primary-100 hover:shadow-btn active:shadow-btn-active active:-translate-y-[1px] w-full"
            >
              Go to My Tours
            </button>
            <p className="text-[1.2rem] text-grey-400 uppercase mt-[2rem]">Redirecting in 5 seconds...</p>
          </>
        )}
      </div>
    </main>
  );
}
