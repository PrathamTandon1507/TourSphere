import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader';

export default function ManageTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTours = async () => {
    setLoading(true);
    try {
      // Use a flag to show secret tours for admins
      const { data } = await api('/api/v1/tours?limit=100'); 
      // Note: We might need to adjust the backend to allow admins to see secret tours 
      // by default or via a query param if they are the ones requesting.
      // For now, let's assume the backend handles it via the user role in the request if we were using template engines,
      // but since it's an API, we'll need to make sure the API returns them.
      setTours(data.doc || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;

    try {
      await api(`/api/v1/tours/${id}`, { method: 'DELETE' });
      setTours(tours.filter((t) => t._id !== id));
    } catch (err) {
      alert(`Error deleting tour: ${err.message}`);
    }
  };

  return (
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="manage-tours">
        <div className="flex justify-between items-center mb-[3.5rem]">
          <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block">Manage Tours</h2>
          <Link to="/tours/new" className="bg-primary-200 text-white uppercase text-[1.4rem] py-[1.25rem] px-[3rem] rounded-full transition-all duration-200 hover:bg-primary-100">Add New Tour</Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-[15rem] min-h-[40vh]">
            <Loader />
          </div>
        )}
        {error && <p className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white rounded-[1rem] shadow-[0_1rem_3rem_rgba(0,0,0,0.1)]">
            <table className="w-full border-collapse text-[1.6rem]">
              <thead>
                <tr className="bg-[#f9f9f9]">
                  <th className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0] font-bold uppercase text-primary-400">Name</th>
                  <th className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0] font-bold uppercase text-primary-400">Duration</th>
                  <th className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0] font-bold uppercase text-primary-400">Difficulty</th>
                  <th className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0] font-bold uppercase text-primary-400">Price</th>
                  <th className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0] font-bold uppercase text-primary-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour) => (
                  <tr key={tour._id} className="hover:bg-[#fcfcfc] transition-colors">
                    <td className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0]">{tour.name} {tour.secretTour && <span className="p-[0.2rem_0.8rem] rounded-[10rem] text-[1.2rem] font-bold uppercase ml-[1rem] bg-orange-main text-white">Secret</span>}</td>
                    <td className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0]">{tour.duration} days</td>
                    <td className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0] capitalize">{tour.difficulty}</td>
                    <td className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0]">${tour.price}</td>
                    <td className="p-[1.5rem_2rem] text-left border-b border-[#f0f0f0]">
                      <div className="flex gap-[1.5rem]">
                        <Link to={`/tours/edit/${tour._id}`} className="text-primary-200 inline-block no-underline border-b border-primary-200 p-[3px] transition-all duration-200 hover:bg-primary-200 hover:text-white hover:shadow-btn hover:-translate-y-[2px]">Edit</Link>
                        <button onClick={() => handleDelete(tour._id)} className="text-[#eb4d4b] inline-block no-underline border-b border-[#eb4d4b] p-[3px] transition-all duration-200 hover:bg-[#eb4d4b] hover:text-white hover:shadow-btn hover:-translate-y-[2px]">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
