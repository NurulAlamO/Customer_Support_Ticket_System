import React, { useState } from 'react';
import vectorImg from '../../assets/Vector.png'
const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
         <div className="navbar bg-base-100 shadow-sm max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
      
      {/* Left */}
      <div className="flex-1">
        <a className="text-xl font-bold sm:text-lg md:text-xl lg:text-2xl">
          CS — Ticket System
        </a>
      </div>
      <div className="flex-none">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="sm:hidden relative">
            <button
              className="btn btn-ghost"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-base-100 shadow-lg rounded-lg flex flex-col p-2 z-50">
                <a href="#" className="py-1 px-2 hover:bg-gray-100 rounded">Home</a>
                <a href="#" className="py-1 px-2 hover:bg-gray-100 rounded">FAQ</a>
                <a href="#" className="py-1 px-2 hover:bg-gray-100 rounded">Changelog</a>
                <a href="#" className="py-1 px-2 hover:bg-gray-100 rounded">Blog</a>
                <a href="#" className="py-1 px-2 hover:bg-gray-100 rounded">Download</a>
                <a href="#" className="py-1 px-2 hover:bg-gray-100 rounded">Contact</a>
                {/* New Ticket button inside menu */}
                <button 
                  className="btn btn-info flex items-center gap-2 px-4 py-2 mt-2 text-sm"
                  type="button"
                >
                  <img src={vectorImg} alt="icon" className="w-4 h-4"/>
                  New Ticket
                </button>
              </div>
            )}
          </div>

          {/* Menu links for medium and larger devices */}
          <div className="hidden sm:flex gap-4 text-sm font-medium">
            <a href="#" className="hover:text-info">Home</a>
            <a href="#" className="hover:text-info">FAQ</a>
            <a href="#" className="hover:text-info">Changelog</a>
            <a href="#" className="hover:text-info">Blog</a>
            <a href="#" className="hover:text-info">Download</a>
            <a href="#" className="hover:text-info">Contact</a>
          </div>

          {/* New Ticket button for medium+ screens */}
          <div className="hidden sm:block">
            <button 
              className="btn btn-info flex items-center gap-2 px-4 py-2 text-sm sm:text-base"
              type="button"
            >
              <img src={vectorImg} alt="icon" className="w-4 h-4"/>
              New Ticket
            </button>
          </div>

        </div>
      </div>

    </div>
    // <div className="flex justify-between p-4 bg-gray-800 text-white">
    //   <h1 className="text-xl font-bold">Support Zone</h1>
    //   <button className="bg-purple-500 px-4 py-2 rounded">
    //     New Ticket
    //   </button>
    // </div>
    );
};
export default Navbar;