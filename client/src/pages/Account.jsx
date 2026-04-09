import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';

import UserSidebar from '../components/UserSidebar';

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
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen rounded-3px overflow-hidden shadow-[0_2.5rem_8rem_2rem_rgba(0,0,0,0.07)] flex">
        <UserSidebar activeTab="settings" />

        <div className="flex-1 py-[7rem] px-0">
          <div className="max-w-[68rem] mx-auto px-[8rem]">
            <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[3rem]">Your account settings</h2>
            {message && message.type === 'success' && (
               <div className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#20bf6b] rounded-[5px] shadow-sm">{message.text}</div>
            )}
             {message && message.type === 'error' && (
               <div className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">{message.text}</div>
            )}
            <form onSubmit={handleUpdateData} className="form form-user-data">
              <div className="mb-[2.5rem]">
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]" htmlFor="name">Name</label>
                <input
                  id="name"
                  className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-t-[3px] border-transparent border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200 placeholder:text-grey-500"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-[3rem]">
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]" htmlFor="email">Email address</label>
                <input
                  id="email"
                  className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-t-[3px] border-transparent border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200 placeholder:text-grey-500"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-[2.5rem] flex items-center text-[1.6rem]">
                <img
                  className="h-[7.5rem] w-[7.5rem] rounded-full mr-[2rem]"
                  src={`/img/users/${user?.photo || 'default.jpg'}`}
                  alt="User photo"
                />
                <input
                  className="w-[0.1px] h-[0.1px] opacity-0 overflow-hidden absolute z-[-1]"
                  type="file"
                  accept="image/*"
                  id="photo"
                  name="photo"
                  onChange={(e) => setPhoto(e.target.files[0])}
                />
                <label htmlFor="photo" className="text-primary-200 inline-block no-underline border-b border-primary-200 p-[3px] transition-all duration-200 cursor-pointer hover:bg-primary-200 hover:text-white hover:shadow-btn hover:-translate-y-[2px]">Choose new photo</label>
              </div>
              <div className="mb-[2.5rem] text-right">
                <button className="text-[1.4rem] py-[1.25rem] px-[3rem] rounded-[10rem] uppercase no-underline relative transition-all duration-200 font-normal cursor-pointer border-none bg-primary-200 text-white hover:shadow-btn active:shadow-btn-active disabled:bg-grey-500" disabled={updatingData}>
                  {updatingData ? 'Updating...' : 'Save settings'}
                </button>
              </div>
            </form>
          </div>

          <div className="my-[6rem] w-full h-[1px] bg-[#e0e0e0]">&nbsp;</div>

          <div className="max-w-[68rem] mx-auto px-[8rem]">
            <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[3rem]">Password change</h2>
            <form onSubmit={handleUpdatePassword} className="form form-user-password">
              <div className="mb-[2.5rem]">
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]" htmlFor="password-current">Current password</label>
                <input
                  id="password-current"
                  className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-t-[3px] border-transparent border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200 placeholder:text-grey-500"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength="8"
                  value={passwordCurrent}
                  onChange={(e) => setPasswordCurrent(e.target.value)}
                />
              </div>
              <div className="mb-[2.5rem]">
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]" htmlFor="password">New password</label>
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
              <div className="mb-[3.5rem]">
                <label className="block text-[1.6rem] font-bold mb-[0.75rem]" htmlFor="password-confirm">Confirm password</label>
                <input
                  id="password-confirm"
                  className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-t-[3px] border-transparent border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200 placeholder:text-grey-500"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength="8"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              <div className="mb-[2.5rem] text-right">
                <button className="text-[1.4rem] py-[1.25rem] px-[3rem] rounded-[10rem] uppercase no-underline relative transition-all duration-200 font-normal cursor-pointer border-none bg-primary-200 text-white hover:shadow-btn active:shadow-btn-active disabled:bg-grey-500" disabled={updatingPassword}>
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
