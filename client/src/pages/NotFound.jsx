import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="bg-primary-50 min-h-[70vh] py-[8rem] flex flex-col items-center justify-center text-center px-5">
      <h1 className="text-[10rem] font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent leading-none">404</h1>
      <p className="mt-4 text-[2.5rem] text-primary-1000 font-bold uppercase tracking-widest">Page not found</p>
      <p className="mt-4 text-[1.6rem] text-grey-500 max-w-[50rem]">
        The URL you requested couldn&apos;t be found. Try going back to the homepage.
      </p>
      <Link
        to="/"
        className="mt-8 bg-primary-200 text-white uppercase text-[1.4rem] py-[1.25rem] px-[3rem] rounded-full transition-all duration-200 hover:bg-primary-100 hover:shadow-btn active:shadow-btn-active active:-translate-y-[1px]"
      >
        Go to home
      </Link>
    </main>
  );
}
