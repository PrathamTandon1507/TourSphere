import { useState } from 'react';
import { api } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const data = await api('/api/v1/users/forgotPassword', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStatus({ type: 'success', message: 'Token sent to email!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="mx-auto max-w-[55rem] bg-white shadow-[0_2.5rem_8rem_2rem_rgba(0,0,0,0.06)] p-[5rem_7rem] rounded-[5px]">
        <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[3.5rem]">Forgot your password?</h2>
        <form onSubmit={handleSubmit}>
          {status && (
            <div className={`mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white rounded-[5px] shadow-sm ${status.type === 'success' ? 'bg-[#20bf6b]' : 'bg-[#eb4d4b]'}`}>
              {status.message}
            </div>
          )}

          <div className="mb-[2.5rem]">
            <label className="block text-[1.6rem] font-bold mb-[0.75rem]" htmlFor="email">Email address</label>
            <input
              id="email"
              className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-t-[3px] border-transparent border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200 placeholder:text-grey-500"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-[2.5rem]">
            <button
              className="text-[1.6rem] py-[1.4rem] px-[3rem] rounded-[10rem] uppercase no-underline relative transition-all duration-400 font-normal cursor-pointer border-none bg-primary-200 text-white hover:-translate-y-[3px] hover:shadow-btn active:-translate-y-[1px] active:shadow-btn-active disabled:bg-grey-500"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
