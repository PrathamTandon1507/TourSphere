import { useEffect, useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import Loader from '../components/Loader';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const { data } = await api('/api/v1/users/my-reviews');
        setReviews(data.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api(`/api/v1/reviews/${reviewId}`, { method: 'DELETE' });
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err) {
      alert(`Error deleting review: ${err.message}`);
    }
  };

  return (
    <main className="bg-primary-50 py-[8rem] px-[6rem] flex-1 relative">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen rounded-3px overflow-hidden shadow-[0_2.5rem_8rem_2rem_rgba(0,0,0,0.07)] flex">
        <UserSidebar activeTab="reviews" />

        <div className="flex-1 py-[7rem] px-0">
          <div className="max-w-[100%] mx-auto px-[8rem]">
            <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] mb-[3rem]">
              Your Reviews
            </h2>

            {loading && (
              <div className="flex items-center justify-center py-20 min-h-[50vh]">
                <Loader />
              </div>
            )}

            {error && (
              <div className="mb-8 p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            )}

            {!loading && !error && reviews.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <p className="text-[1.8rem] font-medium text-grey-500">You haven't written any reviews yet.</p>
                <Link
                  to="/my-tours"
                  className="bg-primary-200 text-white uppercase text-[1.4rem] py-[1.25rem] px-[3rem] rounded-full transition-all duration-200 hover:bg-primary-100 mt-[2rem] inline-block"
                >
                  Review a tour
                </Link>
              </div>
            )}

            {!loading && !error && reviews.length > 0 && (
              <div className="grid grid-cols-1 gap-[3rem] mt-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-[1rem] p-[3rem] shadow-[0_1rem_3rem_rgba(0,0,0,0.08)] border border-grey-100 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[1.8rem] font-bold text-primary-300 uppercase mb-2">
                          {review.tour?.name || 'Deleted Tour'}
                        </h3>
                        <div className="flex mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-[1.75rem] w-[1.75rem] mr-[2px] ${
                                review.rating >= star ? 'fill-primary-200' : 'fill-grey-100'
                              }`}
                            >
                              <use xlinkHref="/img/icons.svg#icon-star" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {review.tour?.slug && (
                          <Link 
                            to={`/tour/${review.tour.slug}`}
                            className="text-[1.2rem] uppercase font-bold text-primary-200 hover:text-primary-100 transition-colors"
                          >
                            View Tour
                          </Link>
                        )}
                        <button 
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-[1.2rem] uppercase font-bold text-[#eb4d4b] hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-[1.5rem] italic text-black-500 leading-relaxed bg-primary-50 p-6 rounded-lg border-l-4 border-primary-200">
                      "{review.review}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
