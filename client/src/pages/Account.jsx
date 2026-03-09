import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';

function NavItem({ link, text, icon, active }) {
  return (
    <li className={active ? 'side-nav--active' : ''}>
      <a href={link}>
        <svg>
          <use xlinkHref={`/img/icons.svg#icon-${icon}`} />
        </svg>
        {text}
      </a>
    </li>
  );
}

export default function Account() {
  const { user, loadUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photo, setPhoto] = useState(null);
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [updatingData, setUpdatingData] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const handleUpdateData = async (e) => {
    e.preventDefault();
    setUpdatingData(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (photo) formData.append('photo', photo);

    try {
      await api('/api/v1/users/updateMe', {
        method: 'PATCH',
        body: formData,
        isFormData: true,
      });
      await loadUser();
      setMessage({ type: 'success', text: 'Data updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUpdatingData(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setUpdatingPassword(true);
    setMessage(null);

    try {
      await api('/api/v1/users/updatePassword', {
        method: 'PATCH',
        body: JSON.stringify({ passwordCurrent, password, passwordConfirm }),
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordCurrent('');
      setPassword('');
      setPasswordConfirm('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <main className="main">
      <div className="user-view">
        <nav className="user-view__menu">
          <ul className="side-nav">
            <NavItem link="#" text="Settings" icon="settings" active />
            <NavItem link="/my-tours" text="My bookings" icon="briefcase" />
            <NavItem link="#" text="My reviews" icon="star" />
            <NavItem link="#" text="Billing" icon="credit-card" />
          </ul>

          {user?.role === 'admin' && (
            <div className="admin-nav">
              <h5 className="admin-nav__heading">Admin</h5>
              <ul className="side-nav">
                <NavItem link="#" text="Manage tours" icon="map" />
                <NavItem link="#" text="Manage users" icon="users" />
                <NavItem link="#" text="Manage reviews" icon="star" />
                <NavItem link="#" text="Manage bookings" icon="briefcase" />
              </ul>
            </div>
          )}
        </nav>

        <div className="user-view__content">
          <div className="user-view__form-container">
            <h2 className="heading-secondary ma-bt-md">Your account settings</h2>
            {message && message.type === 'success' && (
               <div className="alert alert--success">{message.text}</div>
            )}
             {message && message.type === 'error' && (
               <div className="alert alert--error">{message.text}</div>
            )}
            <form onSubmit={handleUpdateData} className="form form-user-data">
              <div className="form__group">
                <label className="form__label" htmlFor="name">Name</label>
                <input
                  id="name"
                  className="form__input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form__group ma-bt-md">
                <label className="form__label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  className="form__input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form__group form__photo-upload">
                <img
                  className="form__user-photo"
                  src={`/img/users/${user?.photo || 'default.jpg'}`}
                  alt="User photo"
                />
                <input
                  className="form__upload"
                  type="file"
                  accept="image/*"
                  id="photo"
                  name="photo"
                  onChange={(e) => setPhoto(e.target.files[0])}
                />
                <label htmlFor="photo">Choose new photo</label>
              </div>
              <div className="form__group right">
                <button className="btn btn--small btn--green" disabled={updatingData}>
                  {updatingData ? 'Updating...' : 'Save settings'}
                </button>
              </div>
            </form>
          </div>

          <div className="line">&nbsp;</div>

          <div className="user-view__form-container">
            <h2 className="heading-secondary ma-bt-md">Password change</h2>
            <form onSubmit={handleUpdatePassword} className="form form-user-password">
              <div className="form__group">
                <label className="form__label" htmlFor="password-current">Current password</label>
                <input
                  id="password-current"
                  className="form__input"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength="8"
                  value={passwordCurrent}
                  onChange={(e) => setPasswordCurrent(e.target.value)}
                />
              </div>
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
              <div className="form__group ma-bt-lg">
                <label className="form__label" htmlFor="password-confirm">Confirm password</label>
                <input
                  id="password-confirm"
                  className="form__input"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength="8"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              <div className="form__group right">
                <button className="btn btn--small btn--green" disabled={updatingPassword}>
                  {updatingPassword ? 'Updating...' : 'Save password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
