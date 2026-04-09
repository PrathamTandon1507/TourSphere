import { useEffect, useState } from 'react';
import { api } from '../api';
import TourCard from '../components/TourCard';
import Loader from '../components/Loader';

export default function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState('');
  const [latlng, setLatlng] = useState(''); // e.g., 34.111745,-118.113491

  const loadTours = async (query = '') => {
    setLoading(true);
    try {
      const url = query ? `/api/v1/tours/tours-within/${query}` : '/api/v1/tours';
      const { data } = await api(url);
      setTours(data.doc || data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  const handleSpatialSearch = (e) => {
    e.preventDefault();
    if (!distance || !latlng) return loadTours();
    loadTours(`${distance}/center/${latlng}/unit/mi`);
  };

  return (
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="flex justify-between items-center mb-[3.5rem]">
        <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block">All Tours</h2>
        <form onSubmit={handleSpatialSearch} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
          <input 
            type="number" 
            placeholder="Distance (mi)" 
            className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-t-[3px] border-transparent border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200 placeholder:text-grey-500" 
            style={{ width: '12rem', marginBottom: 0 }}
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Lat,Lng" 
            className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-t-[3px] border-transparent border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200 placeholder:text-grey-500" 
            style={{ width: '20rem', marginBottom: 0 }}
            value={latlng}
            onChange={(e) => setLatlng(e.target.value)}
          />
          <button className="bg-primary-200 text-white uppercase text-[1.4rem] py-[1.25rem] px-[3rem] rounded-full transition-all duration-200 hover:bg-primary-100">Find Near Me</button>
          <button type="button" onClick={() => { setDistance(''); setLatlng(''); loadTours(); }} className="text-primary-200 inline-block no-underline border-b border-primary-200 p-[3px] transition-all duration-200 hover:bg-primary-200 hover:text-white hover:shadow-btn hover:-translate-y-[2px] active:translate-y-0 active:shadow-btn-active focus:outline-none focus:outline-[3px_solid_#55c57a] focus:outline-offset-[3px]">Reset</button>
        </form>
      </div>
      {loading && (
        <div className="flex items-center justify-center py-[15rem] min-h-[50vh]">
          <Loader />
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-[80rem] rounded-2xl bg-rose-50 p-6 text-[1.8rem] text-rose-700 shadow-sm text-center">
          <strong className="font-semibold">Unable to load tours:</strong> {error}
        </div>
      )}

      {!loading && !error && tours.length === 0 && (
        <div className="mx-auto max-w-[80rem] rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-[1.8rem] font-medium text-primary-500">No tours found at the moment.</p>
        </div>
      )}

      {!loading && !error && tours.length > 0 && (
        <div className="max-w-[120rem] mx-auto grid grid-cols-3 gap-[7rem]">
          {tours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      )}
    </main>
  );
}
