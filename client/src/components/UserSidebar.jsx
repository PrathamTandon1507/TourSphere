import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function NavItem({ link, text, icon, active }) {
  return (
    <li className={`my-[1rem] border-l-0 border-white transition-all duration-300 hover:border-l-4 ${active ? 'border-l-4' : ''}`}>
      <Link 
        to={link} 
        className={`py-[1rem] px-[4rem] flex items-center text-white text-[1.5rem] uppercase font-normal no-underline transition-all duration-300 hover:translate-x-[3px] ${active ? '-translate-x-[3px]' : ''}`}
      >
        <svg className="h-[1.9rem] w-[1.9rem] fill-primary-50 mr-[2rem]">
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
    <nav className="flex-[32rem_0_0] bg-gradient-to-br from-primary-100 to-primary-300 py-[4rem] px-0">
      <ul className="list-none">
        <NavItem link="/me" text="Settings" icon="settings" active={activeTab === 'settings'} />
        <NavItem link="/my-tours" text="My bookings" icon="briefcase" active={activeTab === 'bookings'} />
        <NavItem link="/my-reviews" text="My reviews" icon="star" active={activeTab === 'reviews'} />
        <NavItem link="/billing" text="Billing" icon="credit-card" active={activeTab === 'billing'} />
      </ul>

      {user?.role === 'admin' && (
        <div className="mt-[5.5rem]">
          <h5 className="mx-[4rem] ml-[4rem] mr-[5rem] mb-[1.5rem] pb-[3px] text-[1.2rem] uppercase text-[#f2f2f2] border-b border-current">Admin</h5>
          <ul className="list-none">
            <NavItem link="/manage-tours" text="Manage tours" icon="map" active={activeTab === 'manage-tours'} />
            <NavItem link="/stats" text="Manage stats" icon="trending-up" active={activeTab === 'stats'} />
            <NavItem link="#" text="Manage users" icon="users" />
            <NavItem link="#" text="Manage reviews" icon="star" />
            <NavItem link="#" text="Manage bookings" icon="briefcase" />
          </ul>
        </div>
      )}
    </nav>
  );
}
