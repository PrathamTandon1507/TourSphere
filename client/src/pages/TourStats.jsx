import { useEffect, useState } from 'react';
import { api } from '../api';

export default function TourStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api('/api/v1/tours/tour-stats');
        setStats(data.stats || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="stats-container">
        <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[3.5rem]">Tour Statistics</h2>

        {loading && <p className="text-[1.8rem] text-center py-10">Loading statistics...</p>}
        {error && <p className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(30rem,1fr))] gap-[3rem]">
            {stats.map((stat) => (
              <div key={stat._id} className="bg-white rounded-[1rem] p-[3rem] shadow-[0_1rem_3rem_rgba(0,0,0,0.1)]">
                <h3 className="text-primary-200 mb-[2rem] text-left font-bold uppercase text-[1.8rem]">Difficulty: {stat._id}</h3>
                <div className="grid gap-[1.5rem]">
                  <div className="flex justify-between text-[1.5rem] pb-[1rem] border-b border-[#f0f0f0]">
                    <span className="text-grey-main font-normal">Number of Tours</span>
                    <span className="text-primary-1000 font-bold">{stat.numTours}</span>
                  </div>
                  <div className="flex justify-between text-[1.5rem] pb-[1rem] border-b border-[#f0f0f0]">
                    <span className="text-grey-main font-normal">Average Rating</span>
                    <span className="text-primary-1000 font-bold">{stat.avgRating.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[1.5rem] pb-[1rem] border-b border-[#f0f0f0]">
                    <span className="text-grey-main font-normal">Average Price</span>
                    <span className="text-primary-1000 font-bold">${stat.avgPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[1.5rem] pb-[1rem] border-b border-[#f0f0f0]">
                    <span className="text-grey-main font-normal">Min Price</span>
                    <span className="text-primary-1000 font-bold">${stat.minPrice}</span>
                  </div>
                  <div className="flex justify-between text-[1.5rem] pb-[1rem] border-b border-[#f0f0f0] last:border-0 last:pb-0">
                    <span className="text-grey-main font-normal">Max Price</span>
                    <span className="text-primary-1000 font-bold">${stat.maxPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
