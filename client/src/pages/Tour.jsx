import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import ReviewCard from '../components/ReviewCard';
import Loader from '../components/Loader';

// Fix for Leaflet marker icons which often fail to load in bundled environments
const fixLeafletIcons = () => {
  if (typeof window !== 'undefined' && window.L && window.L.Icon) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }
};

function OverviewBox({ label, text, icon }) {
  return (
    <div className="text-[1.5rem] flex items-center font-normal mb-[2.25rem] last:mb-0">
      <svg className="h-[2.25rem] w-[2.25rem] fill-primary-200 mr-[1.25rem]">
        <use xlinkHref={`/img/icons.svg#icon-${icon}`} />
      </svg>
      <span className="font-bold mr-[2.25rem] uppercase text-[1.4rem]">{label}</span>
      <span className="capitalize">{text}</span>
    </div>
  );
}

export default function Tour() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBooked, setIsBooked] = useState(false);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadTour = async () => {
      setLoading(true);
      try {
        const { data } = await api(`/api/v1/tours/slug/${encodeURIComponent(slug)}`);
        setTour(data.doc);
        
        // Check if user booked this tour
        if (user) {
          const { data: bookingsData } = await api('/api/v1/bookings/my-bookings');
          const booked = bookingsData.bookings.some(b => b.tour._id === data.doc._id);
          setIsBooked(booked);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadTour();
  }, [slug, user]);

  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!review || review.length < 10) {
      alert('Review must be at least 10 characters long!');
      return;
    }
    setSubmittingReview(true);
    try {
      await api(`/api/v1/tours/${tour._id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ 
          review, 
          rating: Number(rating) 
        }),
      });
      // Reload tour to show new review
      const { data } = await api(`/api/v1/tours/slug/${encodeURIComponent(slug)}`);
      setTour(data.doc);
      setReviewSuccess(true);
      
      // Reset form fields
      setReview('');
      setRating(5);
    } catch (err) {
      setError(`Error submitting review: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const mapRef = useRef(null);

  useEffect(() => {
    if (tour && window.L && document.getElementById('map')) {
      if (mapRef.current) {
        mapRef.current.remove();
      }

      fixLeafletIcons(); // Ensure icons are ready before map init
      mapRef.current = L.map('map', { zoomControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      const points = [];
      
      // 1) Add Start Location
      if (tour.startLocation && tour.startLocation.coordinates) {
        const [lng, lat] = tour.startLocation.coordinates;
        points.push([lat, lng]);
        
        L.marker([lat, lng], {
          icon: L.divIcon({ 
            className: 'bg-primary-200 border-white border-2 rounded-full w-5 h-5 shadow-lg',
            iconSize: [20, 20]
          })
        })
        .addTo(mapRef.current)
        .bindPopup(`<p><strong>Start:</strong> ${tour.startLocation.description}</p>`, { autoClose: false })
        .openPopup();
      }

      // 2) Add Tour Stops
      tour.locations?.forEach((loc) => {
        if (loc.coordinates) {
          const [lng, lat] = loc.coordinates;
          points.push([lat, lng]);
          L.marker([lat, lng])
            .addTo(mapRef.current)
            .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, { autoClose: false })
            .openPopup();
        }
      });

      if (points.length > 0) {
        const bounds = L.latLngBounds(points).pad(0.5);
        mapRef.current.fitBounds(bounds);
      } else {
        mapRef.current.setView([0, 0], 2);
      }

      mapRef.current.scrollWheelZoom.disable();

      // IMPORTANT: Invalidate size after layout is stable to fix "white map" issue
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [tour, isBooked]);

  if (loading) {
    return (
      <main className="main min-h-screen flex items-center justify-center">
        <Loader />
      </main>
    );
  }

  if (error || !tour) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="rounded-2xl bg-rose-50 p-8 text-rose-700 shadow-sm text-center">
          <p className="text-lg font-semibold">Unable to load tour</p>
          <p className="mt-2 text-sm">{error || 'Tour not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn btn--green mt-6"
          >
            Go back
          </button>
        </div>
      </section>
    );
  }

  const date = new Date(tour.startDates?.[0]).toLocaleString('en-us', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <section className="relative h-[38vw] [clip-path:polygon(0_0,100%_0,100%_calc(100%-9vw),0_100%)]">
        <div className="h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-300 opacity-85 z-10">&nbsp;</div>
          <img
            className="object-cover h-full w-full [object-position:50%_25%]"
            src={`/img/tours/${tour.imageCover}`}
            alt={tour.name}
          />
        </div>
        <div className="absolute bottom-[13vw] left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 z-20">
          <h1 className="text-[5rem] text-center w-full mx-auto uppercase font-light text-white leading-tight">
            <span className="py-[1rem] px-[1.5rem] [box-decoration-break:clone] bg-gradient-to-br from-[rgba(125,213,111,0.85)] to-[rgba(40,180,135,0.85)]">{`${tour.name} tour`}</span>
          </h1>
          <div className="text-white mt-[3rem] flex items-center justify-center">
            <div className="text-[1.5rem] font-bold uppercase flex items-center [text-shadow:0_0.5rem_2rem_rgba(0,0,0,0.15)] mr-[4rem] last:mr-0">
              <svg className="h-[2rem] w-[2rem] fill-current [filter:drop-shadow(0_0.75rem_0.5rem_rgba(0,0,0,0.25))] mr-[0.8rem]">
                <use xlinkHref="/img/icons.svg#icon-clock" />
              </svg>
              <span className="font-bold">{`${tour.duration} days`}</span>
            </div>
            <div className="text-[1.5rem] font-bold uppercase flex items-center [text-shadow:0_0.5rem_2rem_rgba(0,0,0,0.15)] mr-[4rem] last:mr-0">
              <svg className="h-[2rem] w-[2rem] fill-current [filter:drop-shadow(0_0.75rem_0.5rem_rgba(0,0,0,0.25))] mr-[0.8rem]">
                <use xlinkHref="/img/icons.svg#icon-map-pin" />
              </svg>
              <span className="font-bold">{tour.startLocation?.description}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fcfcfc] mt-[-9vw] flex">
        <div className="bg-primary-50 flex justify-center p-[0_8vw] pt-[14vw] pb-[calc(1vw+9vw)] flex-[0_0_50%]">
          <div>
            <div className="mb-[7rem] last:mb-0">
              <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[3.5rem]">Quick facts</h2>
              <OverviewBox label="Next date" text={date} icon="calendar" />
              <OverviewBox label="Difficulty" text={tour.difficulty} icon="trending-up" />
              <OverviewBox label="Participants" text={`${tour.maxGroupSize} people`} icon="user" />
              <OverviewBox label="Rating" text={`${tour.ratingsAverage} / 5`} icon="star" />
            </div>

            <div className="mb-[7rem] last:mb-0">
              <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[3.5rem]">Your tour guides</h2>
              {tour.guides?.map((guide) => (
                <div key={guide._id} className="text-[1.5rem] flex items-center font-normal mb-[2.25rem] last:mb-0">
                  <img
                    className="h-[3.5rem] rounded-full mr-[1.25rem]"
                    src={`/img/users/${guide.photo}`}
                    alt={guide.name}
                  />
                  <span className="font-bold mr-[2.25rem] uppercase text-[1.4rem]">
                    {guide.role === 'lead-guide' ? 'Lead guide' : 'Tour guide'}
                  </span>
                  <span className="capitalize">{guide.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-[0_8vw] pt-[14vw] pb-[calc(1vw+9vw)] flex-[0_0_50%]">
          <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[3.5rem]">{`About ${tour.name} tour`}</h2>
          {tour.description?.split('\n').map((p, i) => (
            <p key={i} className="text-[1.7rem] mb-[2rem] last:mb-0">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="flex mt-[-9vw] relative z-[1000] [clip-path:polygon(0_9vw,100%_0,100%_calc(100%-9vw),0_100%)]">
        {tour.images?.map((img, i) => (
          <div key={i} className="flex-1">
            <img
              className={`block w-full h-[110%] object-cover ${i === 0 ? 'pt-[15%]' : i === 1 ? 'pb-[15%]' : 'pb-[27%]'}`}
              src={`/img/tours/${img}`}
              alt={`Tour picture ${i + 1}`}
            />
          </div>
        ))}
      </section>

      <section className="section-map relative z-0">
        <div id="map" className="bg-[#f7f7f7] relative z-[1]" style={{ height: '50rem' }}></div>
      </section>

      <section className="mt-[-9vw] py-[calc(7rem+9vw)] px-0 relative z-[1000] bg-gradient-to-br from-primary-100 to-primary-300 [clip-path:polygon(0_9vw,100%_0,100%_calc(100%-9vw),0_100%)]">
        <div className="py-[3rem] px-[4rem] grid grid-flow-col gap-[6rem] overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {tour.reviews?.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
          <div className="w-[1rem] flex-shrink-0">&nbsp;</div>
        </div>
      </section>

      {isBooked && (
        <section className="py-[12rem] bg-grey-light flex justify-center">
          <div className="max-w-[114rem] mx-auto w-full px-[3rem]">
            <div className="bg-white shadow-[0_3rem_8rem_rgba(0,0,0,0.1)] p-[6rem_8rem] rounded-[1.5rem] max-w-[65rem] mx-auto transition-all duration-500 transform">
              {reviewSuccess ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="h-[8rem] w-[8rem] bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="h-[4rem] w-[4rem] fill-primary-200">
                      <use xlinkHref="/img/icons.svg#icon-check" />
                    </svg>
                  </div>
                  <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] mb-4">Thank You!</h2>
                  <p className="text-[1.8rem] text-grey-500 mb-8">Your review has been successfully submitted and will help other adventurers. You're amazing!</p>
                  <button 
                    onClick={() => setReviewSuccess(false)}
                    className="text-[1.40rem] py-[1.2rem] px-[3rem] rounded-full uppercase transition-all duration-300 font-bold bg-primary-200 text-white hover:bg-primary-100"
                  >
                    Add another review
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block mb-[3.5rem]">Leave a review</h2>
                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-[3rem]">
                    {error && (
                      <div className="p-[1.5rem] text-[1.4rem] font-normal text-center text-white bg-[#eb4d4b] rounded-[5px] shadow-sm">
                        {error}
                      </div>
                    )}
                    <div>
                      <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Rating (1-5)</label>
                      <select 
                        className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200" 
                        value={rating} 
                        onChange={(e) => setRating(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[1.6rem] font-bold mb-[0.75rem]">Your Review</label>
                      <textarea 
                        className="block font-inherit text-[1.5rem] p-[1.25rem_1.75rem] border-none w-full bg-grey-400 border-b-[3px] border-transparent transition-all duration-300 rounded-[4px] focus:outline-none focus:border-b-primary-200" 
                        value={review} 
                        onChange={(e) => setReview(e.target.value)} 
                        required 
                        rows="4"
                        placeholder="Tell us about your adventure..."
                      />
                    </div>
                    <div className="text-right">
                      <button className="w-full sm:w-auto text-[1.6rem] py-[1.5rem] px-[4rem] rounded-[10rem] uppercase no-underline relative transition-all duration-400 font-bold cursor-pointer border-none bg-primary-200 text-white hover:bg-primary-100 hover:shadow-btn active:-translate-y-[1px] disabled:bg-grey-500" disabled={submittingReview}>
                        {submittingReview ? 'Submitting...' : 'Post Review'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="mt-[-9vw] p-[3rem] pb-[11rem] pt-[calc(15rem+9vw)] bg-primary-50">
        <div className="relative max-w-[105rem] mx-auto overflow-hidden bg-white p-[9rem_5rem_9rem_21rem] rounded-[2rem] shadow-[0_3rem_8rem_0.5rem_rgba(0,0,0,0.15)]">
          <div className="h-[15rem] w-[15rem] absolute left-0 top-1/2 rounded-full shadow-[1rem_0.5rem_3rem_rgba(0,0,0,0.15)] p-[2rem] flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-300 z-10 -translate-x-[35%] -translate-y-1/2">
            <img src="/img/logo-white.png" alt="TourSphere logo" className="w-full" />
          </div>
          <img
            className="h-[15rem] w-[15rem] absolute left-0 top-1/2 rounded-full shadow-[1rem_0.5rem_3rem_rgba(0,0,0,0.15)] z-[9] -translate-x-[10%] -translate-y-1/2 scale-[0.97]"
            src={`/img/tours/${tour.images?.[1]}`}
            alt="Tour"
          />
          <img
            className="h-[15rem] w-[15rem] absolute left-0 top-1/2 rounded-full shadow-[1rem_0.5rem_3rem_rgba(0,0,0,0.15)] z-[8] translate-x-[15%] -translate-y-1/2 scale-[0.94]"
            src={`/img/tours/${tour.images?.[2]}`}
            alt="Tour"
          />
          <div className="grid grid-rows-[auto_auto] grid-cols-[1fr_auto] gap-[0.7rem] grid-flow-col items-center">
            <h2 className="text-[2.25rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.1rem] leading-[1.3] inline-block">What are you waiting for?</h2>
            <p className="text-[1.9rem] font-normal">{`${tour.duration} days. 1 adventure. Infinite memories. Make it yours today!`}</p>
            {user ? (
               <Link to={`/checkout/${tour._id}`} className="row-span-2 self-center justify-self-end text-[1.6rem] py-[1.4rem] px-[3rem] rounded-[10rem] uppercase no-underline relative transition-all duration-400 font-normal cursor-pointer border-none bg-primary-200 text-white hover:-translate-y-[3px] hover:shadow-btn active:-translate-y-[1px] active:shadow-btn-active">
               Book tour now!
             </Link>
            ) : (
              <Link to="/login" className="row-span-2 self-center justify-self-end text-[1.6rem] py-[1.4rem] px-[3rem] rounded-[10rem] uppercase no-underline relative transition-all duration-400 font-normal cursor-pointer border-none bg-primary-200 text-white hover:-translate-y-[3px] hover:shadow-btn active:-translate-y-[1px] active:shadow-btn-active">
                Log in to book tour
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
