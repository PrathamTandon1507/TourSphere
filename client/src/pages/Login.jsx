import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setFormError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="mx-auto max-w-[55rem] bg-white shadow-[0_2.5rem_8rem_2rem_rgba(0,0,0,0.06)] p-[5rem_7rem] rounded-[5px]">
        <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[3.5rem]">Log into your account</h2>
        <form onSubmit={handleSubmit} className="form form--login">
          {formError || error ? (
            <div className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">
              {formError || error}
            </div>
          ) : null}

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

          <div className="mb-[3rem]">
            <label className="block text-[1.6rem] font-bold mb-[0.75rem]" htmlFor="password">Password</label>
            <input
              id="password"
              className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-t-[3px] border-transparent border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200 placeholder:text-grey-500"
              type="password"
              placeholder="••••••••"
              required
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-[2.5rem]">
            <button
              className="text-[1.6rem] py-[1.4rem] px-[3rem] rounded-[10rem] uppercase no-underline relative transition-all duration-400 font-normal cursor-pointer border-none bg-primary-200 text-white hover:-translate-y-[3px] hover:shadow-btn active:-translate-y-[1px] active:shadow-btn-active disabled:bg-grey-500"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="mb-[3rem] mt-[2rem]">
            <Link to="/forgot-password" style={{ fontSize: '1.4rem', color: '#55c57a' }}>
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
