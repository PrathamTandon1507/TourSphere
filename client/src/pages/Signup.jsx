import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const { signup, error } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name || !email || !password || !passwordConfirm) {
      setFormError('Please fill out all fields.');
      return;
    }

    if (password !== passwordConfirm) {
      setFormError('Passwords do not match.');
      return;
    }

    setFormError(null);
    setLoading(true);

    try {
      await signup(name, email, password, passwordConfirm);
      navigate('/');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Create your account</h2>
        <form onSubmit={handleSubmit} className="form form--signup">
          {formError || error ? (
            <div className="alert alert--error">
              {formError || error}
            </div>
          ) : null}

          <div className="form__group">
            <label className="form__label" htmlFor="name">Full name</label>
            <input
              id="name"
              className="form__input"
              type="text"
              placeholder="Your Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
