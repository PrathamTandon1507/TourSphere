import { useEffect, useState } from 'react';
import { api } from '../api';
import TourCard from '../components/TourCard';

export default function Home() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTours = async () => {
      setLoading(true);
      try {
        const { data } = await api('/api/v1/tours');
        setTours(data.doc || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  return (
    <main className="main">
      {loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm font-medium text-slate-700">Loading tours…</p>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-2xl rounded-2xl bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
          <strong className="font-semibold">Unable to load tours:</strong> {error}
        </div>
      )}

      {!loading && !error && tours.length === 0 && (
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-base font-medium text-slate-700">No tours found at the moment.</p>
        </div>
      )}

      {!loading && !error && tours.length > 0 && (
        <div className="card-container">
          {tours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      )}
    </main>
  );
}
