import { Link } from 'react-router-dom';

export default function TourCard({ tour }) {
  return (
    <div className="rounded-3px overflow-hidden shadow-card bg-white transition-all duration-300 flex flex-col">
      <div className="relative">
        <div className="relative h-[22rem] [clip-path:polygon(0_0,100%_0,100%_83%,0_98%)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-300 opacity-70">&nbsp;</div>
          <img
            className="object-cover h-full w-full"
            src={`/img/tours/${tour.imageCover}`}
            alt={tour.name}
          />
        </div>
        <h3 className="text-white uppercase font-light text-[2.75rem] text-right absolute bottom-4 right-8 w-2/3 z-10">
          <span className="py-[1rem] px-[1.5rem] [box-decoration-break:clone] bg-gradient-to-br from-[rgba(125,213,111,0.85)] to-[rgba(40,180,135,0.85)]">{tour.name}</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-[1.75rem] py-[2.5rem] px-[3rem]">
        <h4 className="text-[1.2rem] uppercase font-bold col-span-full">{`${tour.difficulty} ${tour.duration}-day tour`}</h4>
        <p className="col-span-full text-[1.5rem] italic mt-[-1rem] mb-[0.75rem]">{tour.summary}</p>
        <div className="text-[1.3rem] flex items-center">
          <svg className="h-8 w-8 fill-primary-200 mr-[0.7rem]">
            <use xlinkHref="/img/icons.svg#icon-map-pin" />
          </svg>
          <span>{tour.startLocation?.description}</span>
        </div>
        <div className="text-[1.3rem] flex items-center">
          <svg className="h-8 w-8 fill-primary-200 mr-[0.7rem]">
            <use xlinkHref="/img/icons.svg#icon-calendar" />
          </svg>
          <span>
            {new Date(tour.startDates[0]).toLocaleString('en-us', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="text-[1.3rem] flex items-center">
          <svg className="h-8 w-8 fill-primary-200 mr-[0.7rem]">
            <use xlinkHref="/img/icons.svg#icon-flag" />
          </svg>
          <span>{`${tour.locations?.length || 0} stops`}</span>
        </div>
        <div className="text-[1.3rem] flex items-center">
          <svg className="h-8 w-8 fill-primary-200 mr-[0.7rem]">
            <use xlinkHref="/img/icons.svg#icon-user" />
          </svg>
          <span>{`${tour.maxGroupSize} people`}</span>
        </div>
      </div>

      <div className="bg-primary-50 py-[2.5rem] px-[3rem] border-t border-[#f1f1f1] text-[1.4rem] grid grid-cols-[auto_1fr] gap-4 mt-auto">
        <p>
          <span className="font-bold">{`$${tour.price}`}</span>
          <span className="text-grey-200"> per person</span>
        </p>
        <p className="row-start-2">
          <span className="font-bold">{tour.ratingsAverage}</span>
          <span className="text-grey-200">{` rating (${tour.ratingsQuantity})`}</span>
        </p>
        <Link to={`/tour/${tour.slug}`} className="row-span-2 self-center justify-self-end bg-primary-200 text-white uppercase text-[1.4rem] py-[1.25rem] px-[3rem] rounded-full transition-all duration-200 hover:bg-primary-100">
          Details
        </Link>
      </div>
    </div>
  );
}
