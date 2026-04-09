import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-primary-1000 px-[5rem] h-[8rem] relative z-[100] flex justify-between items-center">
      <nav className="flex items-center flex-[0_1_40%]">
        <Link to="/tours" className="text-primary-50 uppercase text-[1.6rem] no-underline inline-flex items-center transition-all duration-200 font-normal bg-none border-none cursor-pointer hover:-translate-y-[2px] hover:[text-shadow:0_0.7rem_1rem_rgba(0,0,0,0.5)] mr-[3rem] last:mr-0">
          All tours
        </Link>
        {(user?.role === 'admin' || user?.role === 'lead-guide') && (
          <Link to="/manage-tours" className="text-primary-50 uppercase text-[1.6rem] no-underline inline-flex items-center transition-all duration-200 font-normal bg-none border-none cursor-pointer hover:-translate-y-[2px] hover:[text-shadow:0_0.7rem_1rem_rgba(0,0,0,0.5)] mr-[3rem] last:mr-0">
            Manage Tours
          </Link>
        )}
        {(user?.role === 'admin' || user?.role === 'lead-guide' || user?.role === 'guide') && (
          <Link to="/stats" className="text-primary-50 uppercase text-[1.6rem] no-underline inline-flex items-center transition-all duration-200 font-normal bg-none border-none cursor-pointer hover:-translate-y-[2px] hover:[text-shadow:0_0.7rem_1rem_rgba(0,0,0,0.5)] mr-[3rem] last:mr-0">
            Stats
          </Link>
        )}
      </nav>
      <div className="h-[3.5rem]">
        <img src="/img/logo-white.png" alt="TourSphere logo" className="h-[3.5rem]" />
      </div>
      <nav className="flex items-center flex-[0_1_40%] justify-end">
        {user ? (
          <>
            <button onClick={logout} className="text-primary-50 uppercase text-[1.6rem] no-underline inline-flex items-center transition-all duration-200 font-normal bg-none border-none cursor-pointer hover:-translate-y-[2px] hover:[text-shadow:0_0.7rem_1rem_rgba(0,0,0,0.5)] mr-[3rem] last:mr-0">
              Log out
            </button>
            <Link to="/me" className="text-primary-50 uppercase text-[1.6rem] no-underline inline-flex items-center transition-all duration-200 font-normal bg-none border-none cursor-pointer hover:-translate-y-[2px] hover:[text-shadow:0_0.7rem_1rem_rgba(0,0,0,0.5)] last:mr-0">
              <img
                className="h-[3.5rem] w-[3.5rem] rounded-full mr-[1rem]"
                src={`/img/users/${user.photo || 'default.jpg'}`}
                alt={`Photo of ${user.name}`}
              />
              <span>{user.name.split(' ')[0]}</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="text-primary-50 uppercase text-[1.6rem] no-underline inline-flex items-center transition-all duration-200 font-normal bg-none border-none cursor-pointer hover:-translate-y-[2px] hover:[text-shadow:0_0.7rem_1rem_rgba(0,0,0,0.5)] mr-[3rem] last:mr-0">
              Log in
            </Link>
            <Link to="/signup" className="text-primary-50 uppercase text-[1.6rem] no-underline inline-flex items-center transition-all duration-300 font-normal bg-none cursor-pointer hover:-translate-y-[2px] mr-[3rem] last:mr-0 py-[1rem] px-[3rem] rounded-[10rem] border border-current hover:bg-primary-50 hover:text-primary-400 hover:shadow-none hover:border-primary-50">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
