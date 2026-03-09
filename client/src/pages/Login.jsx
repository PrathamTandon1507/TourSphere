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
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Log into your account</h2>
        <form onSubmit={handleSubmit} className="form form--login">
          {formError || error ? (
            <div className="alert alert--error">
              {formError || error}
            </div>
          ) : null}

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

          <div className="form__group ma-bt-md">
            <label className="form__label" htmlFor="password">Password</label>
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

          <div className="form__group">
            <button
              className="btn btn--green"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="form__group ma-bt-md" style={{ marginTop: '2rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '1.4rem', color: '#55c57a' }}>
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
