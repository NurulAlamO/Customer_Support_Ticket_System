import React, { useState } from 'react';
import vectorImg from '../../assets/Vector.png';

const links = ['Home', 'FAQ', 'Changelog', 'Blog', 'Download', 'Contact'];

const Navbar = ({
  onCreateClick,
  currentUser,
  onAuthClick,
  onLogout,
  onAccountClick,
  onAdminClick,
  onHomeClick,
  canCreateTicket = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = currentUser?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="navbar bg-base-100 shadow-sm max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="flex-1">
        <button
          type="button"
          className="text-left text-xl font-bold sm:text-lg md:text-xl lg:text-2xl"
          onClick={onHomeClick}
        >
          CS - Ticket System
        </button>
      </div>

      <div className="flex-none">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="sm:hidden relative">
            <button className="btn btn-ghost" onClick={() => setMenuOpen(!menuOpen)} type="button">
              Menu
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-base-100 shadow-lg rounded-lg flex flex-col p-2 z-50">
                {links.map((link) => (
                  <a key={link} href="#" className="py-1 px-2 hover:bg-gray-100 rounded">
                    {link}
                  </a>
                ))}

                {currentUser ? (
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left"
                      onClick={() => setProfileOpen((current) => !current)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 font-semibold text-white">
                        {initials || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{currentUser.name}</p>
                        <p className="truncate text-xs text-slate-500">{currentUser.role}</p>
                      </div>
                    </button>

                    {profileOpen ? (
                      <div className="mt-2 space-y-2">
                        <button
                          className="btn w-full text-sm rounded-2xl"
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            setMenuOpen(false);
                            onAccountClick();
                          }}
                        >
                          Account Settings
                        </button>
                        {currentUser?.role === 'Admin' ? (
                          <button
                            className="btn w-full text-sm rounded-2xl"
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              setMenuOpen(false);
                              onAdminClick();
                            }}
                          >
                            Admin Panel
                          </button>
                        ) : null}
                        <button className="btn w-full text-sm rounded-2xl" type="button" onClick={onLogout}>
                          Logout
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {canCreateTicket ? (
                  <button
                    className="btn btn-info mt-2 flex items-center gap-2 px-4 py-2 text-sm"
                    type="button"
                    onClick={onCreateClick}
                  >
                    <img src={vectorImg} alt="icon" className="h-4 w-4" />
                    New Ticket
                  </button>
                ) : null}

                {currentUser ? (
                  null
                ) : (
                  <button className="btn btn-outline mt-2 text-sm" type="button" onClick={onAuthClick}>
                    Login / Register
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="hidden sm:flex gap-4 text-sm font-medium">
            {links.map((link) => (
              <a key={link} href="#" className="hover:text-info">
                {link}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            {canCreateTicket ? (
              <button
                className="btn btn-info flex items-center gap-2 px-4 py-2 text-sm sm:text-base"
                type="button"
                onClick={onCreateClick}
              >
                <img src={vectorImg} alt="icon" className="h-4 w-4" />
                New Ticket
              </button>
            ) : null}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-sky-300"
                  onClick={() => setProfileOpen((current) => !current)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 font-semibold text-white">
                    {initials || 'U'}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-slate-500">{currentUser.role}</p>
                  </div>
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                    <p className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400">User Profile</p>
                    <p className="px-3 text-sm font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="px-3 pb-2 text-xs text-slate-500">{currentUser.email}</p>
                    <button
                      className="btn mb-2 w-full rounded-2xl"
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onAccountClick();
                      }}
                    >
                      Account Settings
                    </button>
                    {currentUser?.role === 'Admin' ? (
                      <button
                        className="btn mb-2 w-full rounded-2xl"
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onAdminClick();
                        }}
                      >
                        Admin Panel
                      </button>
                    ) : null}
                    <button className="btn w-full rounded-2xl" type="button" onClick={onLogout}>
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentUser ? (
              null
            ) : (
              <button className="btn btn-outline" type="button" onClick={onAuthClick}>
                Login / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
