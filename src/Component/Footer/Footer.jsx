import React from 'react';

const Footer = () => {
    return (
      <footer className="bg-base-200 text-base-content p-10">
        <section className="footer sm:footer-horizontal border-b-2 border-gray-300 pb-26">
        <aside>
          <h1 className='text-2xl font-bold'>CS — Ticket System</h1>
          <p className='text-gray-300'>
            A Ticket System is a platform where users submit
            <br />issues as tickets, and support teams manage, 
            <br />track,and resolve them efficiently using 
            <br />status and priority controls.
          </p>
          </aside>
          <nav>
            <h1 className="text-2xl font-bold">Company</h1>
            <a className="link link-hover text-gray-400">About us</a>
            <a className="link link-hover text-gray-400">Our Mission</a>
            <a className="link link-hover text-gray-400">Contact Saled</a>
          </nav>
          <nav>
            <h1 className="text-2xl font-bold">Services</h1>
            <a className="link link-hover text-gray-400">Products & Services</a>
            <a className="link link-hover text-gray-400">Customer Stories</a>
            <a className="link link-hover text-gray-400">Download Apps</a>
          </nav>
          <nav>
            <h1 className="text-2xl font-bold">Information</h1>
            <a className="link link-hover text-gray-400">Privacy Policy</a>
            <a className="link link-hover text-gray-400">Terms & Conditions</a>
            <a className="link link-hover text-gray-400">Join Us</a>
          </nav>
          <nav>
            <h1 className="text-2xl font-bold">Social Links</h1>
            <a className="link link-hover text-gray-400">@CS — Ticket System</a>
            <a className="link link-hover text-gray-400">@CS — Ticket System</a>
            <a className="link link-hover text-gray-400">@CS — Ticket System</a>
            <a className="link link-hover text-gray-400">support@cst.com</a>
          </nav>
        </section>
        <section className='text-center text-2xl font-semibold'>
          <h1 className='mt-7'>© 2026 CS — Ticket System. All rights reserved.</h1>
        </section>
      </footer>

    );
};

export default Footer;