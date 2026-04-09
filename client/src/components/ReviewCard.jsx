export default function ReviewCard({ review }) {
  return (
    <div className="w-[30rem] p-[4rem] bg-primary-50 rounded-[3px] shadow-[0_1.5rem_4rem_rgba(0,0,0,0.15)] snap-center flex flex-col items-center">
      <div className="flex items-center mb-[2rem]">
        <img
          className="h-[4.5rem] rounded-full mr-[1.5rem]"
          src={`/img/users/${review.user?.photo || 'default.jpg'}`}
          alt={review.user?.name}
        />
        <h6 className="text-[1.5rem] font-bold uppercase">{review.user?.name}</h6>
      </div>
      <p className="text-[1.5rem] mb-[2rem] italic font-normal text-center">{review.review}</p>
      <div className="mt-auto flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-[2rem] w-[2rem] mr-[1px] ${
              review.rating >= star ? 'fill-primary-200' : 'fill-grey-100'
            }`}
          >
            <use xlinkHref="/img/icons.svg#icon-star" />
          </svg>
        ))}
      </div>
    </div>
  );
}
