import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex flex-col font-sans text-grey-main overflow-hidden">
      {/* Hero Section */}
      <section className="h-[95vh] bg-[linear-gradient(to_right_bottom,rgba(125,213,111,0.8),rgba(40,180,135,0.8)),url('/img/tours/tour-1-cover.jpeg')] bg-cover bg-top relative [clip-path:polygon(0_0,100%_0,100%_75vh,0_100%)] flex items-center justify-center text-center text-white">
        <div className="max-w-[114rem] px-[3rem] mb-[15rem]">
          <h1 className="uppercase text-white backface-hidden mb-[6rem]">
            <span className="block text-[6rem] font-normal tracking-[3.5rem] leading-[1.2]">Outdoors</span>
            <span className="block text-[2rem] font-[700] tracking-[1.75rem] mt-[1rem]">is where life happens</span>
          </h1>
          <Link to="/tours" className="text-[1.6rem] py-[1.5rem] px-[4rem] rounded-[10rem] uppercase no-underline inline-block transition-all duration-200 font-normal cursor-pointer border-none bg-white text-grey-main hover:-translate-y-[3px] hover:shadow-btn active:-translate-y-[1px] active:shadow-btn-active">Discover our tours</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-grey-light py-[20rem] -mt-[20vh] relative -skew-y-6">
        <div className="max-w-[114rem] mx-auto px-[3rem] skew-y-6">
          <div className="text-center mb-[8rem]">
            <h2 className="text-[3.5rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.2rem] transition-all duration-200 hover:skew-y-[2deg] hover:skew-x-[15deg] hover:shadow-[0.5rem_1rem_2rem_rgba(0,0,0,0.2)]">Why Choose TourSphere?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[6rem]">
            <div className="bg-[rgba(255,255,255,0.8)] text-[1.5rem] p-[2.5rem] text-center rounded-[3px] shadow-[0_1.5rem_4rem_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[1.5rem] hover:scale-[1.03]">
              <svg className="h-[6rem] w-[6rem] mb-[2rem] inline-block fill-primary-200">
                <use xlinkHref="/img/icons.svg#icon-map" />
              </svg>
              <h3 className="text-[1.6rem] font-bold uppercase mb-[1.5rem]">Expert Guides</h3>
              <p className="leading-relaxed">Our passionate guides are local experts who bring every destination to life with their stories and knowledge.</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.8)] text-[1.5rem] p-[2.5rem] text-center rounded-[3px] shadow-[0_1.5rem_4rem_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[1.5rem] hover:scale-[1.03]">
              <svg className="h-[6rem] w-[6rem] mb-[2rem] inline-block fill-primary-200">
                <use xlinkHref="/img/icons.svg#icon-compass" />
              </svg>
              <h3 className="text-[1.6rem] font-bold uppercase mb-[1.5rem]">Curated Experiences</h3>
              <p className="leading-relaxed">We meticulously design each tour to ensure a perfect balance of adventure, comfort, and authenticity.</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.8)] text-[1.5rem] p-[2.5rem] text-center rounded-[3px] shadow-[0_1.5rem_4rem_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[1.5rem] hover:scale-[1.03]">
              <svg className="h-[6rem] w-[6rem] mb-[2rem] inline-block fill-primary-200">
                <use xlinkHref="/img/icons.svg#icon-heart" />
              </svg>
              <h3 className="text-[1.6rem] font-bold uppercase mb-[1.5rem]">Sustainable Travel</h3>
              <p className="leading-relaxed">We are committed to protecting the places we visit and supporting local communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[15rem] bg-gradient-to-br from-primary-100 to-primary-300 px-[5rem]">
        <div className="max-w-[114rem] mx-auto bg-white/95 rounded-[3px] shadow-[0_3rem_6rem_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row items-center">
          <div className="p-[6rem] flex-1">
            <h2 className="text-[3.5rem] uppercase font-bold bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent tracking-[0.2rem] mb-[3rem]">Ready to start?</h2>
            <p className="text-[1.8rem] mb-[4rem] text-grey-main leading-relaxed">Join thousands of happy travelers and start your adventure today. The world is yours to explore.</p>
            <Link to="/signup" className="text-[1.6rem] py-[1.5rem] px-[4rem] rounded-[10rem] uppercase no-underline inline-block transition-all duration-200 font-normal cursor-pointer border-none bg-primary-200 text-white hover:-translate-y-[3px] hover:shadow-btn active:-translate-y-[1px] active:shadow-btn-active">Sign Up Now</Link>
          </div>
          <div className="w-full md:w-[40%] h-[35rem] bg-[url('/img/tours/tour-2-cover.jpeg')] bg-cover bg-center"></div>
        </div>
      </section>
    </div>
  );
}
