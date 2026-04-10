import React from 'react';
import vectorBg from '../../assets/vector1.png';

const Banner = ({ inProgress, resolved }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1200px] mx-auto">
      <div className="relative bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-6 sm:p-8 md:p-10 lg:p-12 rounded text-center overflow-hidden">
        <img
          src={vectorBg}
          alt=""
          className="absolute left-0 bottom-0 h-full max-w-none -translate-x-1/4 opacity-80 mix-blend-screen"
        />
        <img
          src={vectorBg}
          alt=""
          className="absolute right-0 bottom-0 h-full max-w-none translate-x-1/4 scale-x-[-1] opacity-80 mix-blend-screen"
        />
        <div className="relative">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium">Open Tickets</h2>
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">{inProgress.length}</p>
        </div>
      </div>

      <div className="relative bg-gradient-to-r from-emerald-500 to-lime-500 text-white p-6 sm:p-8 md:p-10 lg:p-12 rounded text-center overflow-hidden">
        <img
          src={vectorBg}
          alt=""
          className="absolute left-0 bottom-0 h-full max-w-none -translate-x-1/4 opacity-80 mix-blend-screen"
        />
        <img
          src={vectorBg}
          alt=""
          className="absolute right-0 bottom-0 h-full max-w-none translate-x-1/4 scale-x-[-1] opacity-80 mix-blend-screen"
        />
        <div className="relative">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium">Closed Tickets</h2>
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">{resolved.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Banner;
