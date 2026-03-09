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
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Forgot your password?</h2>
        <form onSubmit={handleSubmit} className="form form--forgot-password">
          {status && (
            <div className={`alert alert--${status.type === 'success' ? 'success' : 'error'}`}>
              {status.message}
            </div>
          )}

          <div className="form__group">
            <label className="form__label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="form__input"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form__group">
            <button
              className="btn btn--green"
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
