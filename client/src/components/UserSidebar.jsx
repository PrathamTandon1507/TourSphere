import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function NavItem({ link, text, icon, active }) {
  return (
    <li className={active ? 'side-nav--active' : ''}>
      <Link to={link}>
        <svg>
          <use xlinkHref={`/img/icons.svg#icon-${icon}`} />
        </svg>
        {text}
      </Link>
    </li>
  );
}

export default function UserSidebar({ activeTab }) {
  const { user } = useAuth();

  return (
    <nav className="user-view__menu">
      <ul className="side-nav">
        <NavItem link="/me" text="Settings" icon="settings" active={activeTab === 'settings'} />
        <NavItem link="/my-tours" text="My bookings" icon="briefcase" active={activeTab === 'bookings'} />
        <NavItem link="#" text="My reviews" icon="star" />
        <NavItem link="/billing" text="Billing" icon="credit-card" active={activeTab === 'billing'} />
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
  );
}
