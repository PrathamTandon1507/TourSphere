import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="text-5xl font-semibold text-slate-900">404</h1>
      <p className="mt-4 text-lg text-slate-700">Page not found.</p>
      <p className="mt-2 text-sm text-slate-600">
        The URL you requested couldn&apos;t be found. Try going back to the homepage.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
      >
        Go to home
      </Link>
    </main>
  );
}
