import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== passwordConfirm) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setStatus(null);
    setLoading(true);
    try {
      await api(`/api/v1/users/resetPassword/${encodeURIComponent(token)}`, {
        method: 'PATCH',
        body: JSON.stringify({ password, passwordConfirm }),
      });

      setStatus({ type: 'success', message: 'Password reset successful!' });
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Reset your password</h2>
        <form onSubmit={handleSubmit} className="form form--reset-password">
          {status && (
            <div className={`alert alert--${status.type === 'success' ? 'success' : 'error'}`}>
              {status.message}
            </div>
          )}

          <div className="form__group">
            <label className="form__label" htmlFor="password">New password</label>
            <input
              id="password"
              className="form__input"
              type="password"
              placeholder="••••••••"
              required
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form__group ma-bt-md">
            <label className="form__label" htmlFor="passwordConfirm">Confirm password</label>
            <input
              id="passwordConfirm"
              className="form__input"
              type="password"
              placeholder="••••••••"
              required
              minLength="8"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          <div className="form__group">
            <button
              className="btn btn--green"
              disabled={loading}
            >
              {loading ? 'Reseting...' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
