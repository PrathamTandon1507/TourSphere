import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import ReviewCard from '../components/ReviewCard';

function OverviewBox({ label, text, icon }) {
  return (
    <div className="overview-box__detail">
      <svg className="overview-box__icon">
        <use xlinkHref={`/img/icons.svg#icon-${icon}`} />
      </svg>
      <span className="overview-box__label">{label}</span>
      <span className="overview-box__text">{text}</span>
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

  useEffect(() => {
    const loadTour = async () => {
      setLoading(true);
      try {
        const { data } = await api(`/api/v1/tours/slug/${encodeURIComponent(slug)}`);
        setTour(data.doc);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadTour();
  }, [slug]);

  useEffect(() => {
    if (tour && window.L && document.getElementById('map')) {
      const mapContainer = document.getElementById('map');
      if (mapContainer._leaflet_id) return; // Already initialized

      const map = L.map('map', { zoomControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const points = [];
      tour.locations?.forEach((loc) => {
        points.push([loc.coordinates[1], loc.coordinates[0]]);
        L.marker([loc.coordinates[1], loc.coordinates[0]])
          .addTo(map)
          .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, { autoClose: false })
          .openPopup();
      });

      const bounds = L.latLngBounds(points).pad(0.5);
      map.fitBounds(bounds);
      map.scrollWheelZoom.disable();

      return () => {
        map.remove();
      };
    }
  }, [tour]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm font-medium text-slate-700">Loading tour…</p>
      </div>
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
      <section className="section-header">
        <div className="header__hero">
          <div className="header__hero-overlay">&nbsp;</div>
          <img
            className="header__hero-img"
            src={`/img/tours/${tour.imageCover}`}
            alt={tour.name}
          />
        </div>
        <div className="heading-box">
          <h1 className="heading-primary">
            <span>{`${tour.name} tour`}</span>
          </h1>
          <div className="heading-box__group">
            <div className="heading-box__detail">
              <svg className="heading-box__icon">
                <use xlinkHref="/img/icons.svg#icon-clock" />
              </svg>
              <span className="heading-box__text">{`${tour.duration} days`}</span>
            </div>
            <div className="heading-box__detail">
              <svg className="heading-box__icon">
                <use xlinkHref="/img/icons.svg#icon-map-pin" />
              </svg>
              <span className="heading-box__text">{tour.startLocation?.description}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-description">
        <div className="overview-box">
          <div>
            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Quick facts</h2>
              <OverviewBox label="Next date" text={date} icon="calendar" />
              <OverviewBox label="Difficulty" text={tour.difficulty} icon="trending-up" />
              <OverviewBox label="Participants" text={`${tour.maxGroupSize} people`} icon="user" />
              <OverviewBox label="Rating" text={`${tour.ratingsAverage} / 5`} icon="star" />
            </div>

            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Your tour guides</h2>
              {tour.guides?.map((guide) => (
                <div key={guide._id} className="overview-box__detail">
                  <img
                    className="overview-box__img"
                    src={`/img/users/${guide.photo}`}
                    alt={guide.name}
                  />
                  <span className="overview-box__label">
                    {guide.role === 'lead-guide' ? 'Lead guide' : 'Tour guide'}
                  </span>
                  <span className="overview-box__text">{guide.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="description-box">
          <h2 className="heading-secondary ma-bt-lg">{`About ${tour.name} tour`}</h2>
          {tour.description?.split('\n').map((p, i) => (
            <p key={i} className="description__text">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="section-pictures">
        {tour.images?.map((img, i) => (
          <div key={i} className="picture-box">
            <img
              className={`picture-box__img picture-box__img--${i + 1}`}
              src={`/img/tours/${img}`}
              alt={`Tour picture ${i + 1}`}
            />
          </div>
        ))}
      </section>

      <section className="section-map">
        <div id="map" style={{ height: '50rem' }}></div>
      </section>

      <section className="section-reviews">
        <div className="reviews">
          {tour.reviews?.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      </section>

      <section className="section-cta">
        <div className="cta">
          <div className="cta__img cta__img--logo">
            <img src="/img/logo-white.png" alt="TourSphere logo" />
          </div>
          <img
            className="cta__img cta__img--1"
            src={`/img/tours/${tour.images?.[1]}`}
            alt="Tour"
          />
          <img
            className="cta__img cta__img--2"
            src={`/img/tours/${tour.images?.[2]}`}
            alt="Tour"
          />
          <div className="cta__content">
            <h2 className="heading-secondary">What are you waiting for?</h2>
            <p className="cta__text">{`${tour.duration} days. 1 adventure. Infinite memories. Make it yours today!`}</p>
            {user ? (
               <Link to={`/checkout/${tour._id}`} className="btn btn--green span-all-rows">
               Book tour now!
             </Link>
            ) : (
              <Link to="/login" className="btn btn--green span-all-rows">
                Log in to book tour
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
