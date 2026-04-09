export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[40rem] animate-fade-in">
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-primary-50 rounded-full"></div>
        {/* Spinning Gradient Ring */}
        <div className="absolute inset-0 border-4 border-t-primary-200 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        {/* Pulsing Inner Core */}
        <div className="absolute inset-4 bg-gradient-to-br from-primary-100 to-primary-300 rounded-full animate-pulse opacity-80 shadow-lg"></div>
      </div>
      <p className="mt-8 text-[1.8rem] font-bold uppercase tracking-widest bg-gradient-to-r from-primary-100 to-primary-300 [background-clip:text] text-transparent animate-pulse">
        TourSphere
      </p>
      <p className="mt-2 text-[1.4rem] text-grey-500 font-medium">Preparing your adventure...</p>
    </div>
  );
}
