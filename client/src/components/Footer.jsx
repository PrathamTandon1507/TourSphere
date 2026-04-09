import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-50 py-[6rem] px-[4rem] pb-[3rem] text-[1.4rem] grid grid-cols-[auto_auto] gap-y-[0.75rem] justify-between items-center max-md:grid-cols-1 max-md:gap-y-[1.25rem] max-md:justify-items-center">
      <div className="row-span-2 self-center max-md:row-span-1">
        <img src="img/logo-green.png" alt="TourSphere logo" className="h-[3rem]" />
      </div>
      <ul className="list-none flex">
        <li className="ml-[1.5rem] first:ml-0">
          <Link to="#" className="text-primary-400 no-underline transition-all duration-200 hover:text-primary-200">About us</Link>
        </li>
        <li className="ml-[1.5rem]">
          <Link to="#" className="text-primary-400 no-underline transition-all duration-200 hover:text-primary-200">Download apps</Link>
        </li>
        <li className="ml-[1.5rem]">
          <Link to="#" className="text-primary-400 no-underline transition-all duration-200 hover:text-primary-200">Become a guide</Link>
        </li>
        <li className="ml-[1.5rem]">
          <Link to="#" className="text-primary-400 no-underline transition-all duration-200 hover:text-primary-200">Careers</Link>
        </li>
        <li className="ml-[1.5rem]">
          <Link to="#" className="text-primary-400 no-underline transition-all duration-200 hover:text-primary-200">Contact</Link>
        </li>
      </ul>
      <p className="justify-self-end text-grey-200 max-md:justify-self-center">
        © by Pratham Tandon. All rights reserved.
      </p>
    </footer>
  );
}
