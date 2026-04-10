import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faFacebook } from '@fortawesome/free-brands-svg-icons';
import mailBox from '../../assets/mail.png';

const Footer = () => {
  return (
    <footer className="bg-base-200 text-base-content p-10">
      <section className="footer sm:footer-horizontal border-b-2 border-gray-300 pb-26">
        <aside>
          <h1 className="text-2xl font-bold">CS - Ticket System</h1>
          <p className="text-gray-500">
            A ticket system helps customers submit issues as tickets,
            <br />
            while support teams organize, track, comment on,
            <br />
            and resolve requests with clear status and priority control.
          </p>
        </aside>

        <nav>
          <h1 className="text-2xl font-bold">Company</h1>
          <a className="link link-hover text-gray-400">About us</a>
          <a className="link link-hover text-gray-400">Our Mission</a>
          <a className="link link-hover text-gray-400">Contact Sales</a>
        </nav>

        <nav>
          <h1 className="text-2xl font-bold">Services</h1>
          <a className="link link-hover text-gray-400">Products and Services</a>
          <a className="link link-hover text-gray-400">Customer Stories</a>
          <a className="link link-hover text-gray-400">Download Apps</a>
        </nav>

        <nav>
          <h1 className="text-2xl font-bold">Information</h1>
          <a className="link link-hover text-gray-400">Privacy Policy</a>
          <a className="link link-hover text-gray-400">Terms and Conditions</a>
          <a className="link link-hover text-gray-400">Join Us</a>
        </nav>

        <nav>
          <h1 className="text-2xl font-bold">Social Links</h1>
          <a className="link link-hover text-gray-400 gap-2">
            <FontAwesomeIcon className="bg-white rounded-full text-black" icon={faXTwitter} />
            <span className="pl-2">@CS Ticket System</span>
          </a>
          <a className="link link-hover text-gray-400">
            <FontAwesomeIcon className="bg-white rounded-full text-black" icon={faLinkedin} />
            <span className="pl-2">@CS Ticket System</span>
          </a>
          <a className="link link-hover text-gray-400">
            <FontAwesomeIcon className="bg-white rounded-full text-black" icon={faFacebook} />
            <span className="pl-2">@CS Ticket System</span>
          </a>
          <a className="link link-hover text-gray-400 flex items-center justify-center">
            <img className="rounded-full w-auto h-auto" src={mailBox} alt="" />
            <span className="pl-2">support@cst.com</span>
          </a>
        </nav>
      </section>

      <section className="text-center text-2xl font-semibold">
        <h1 className="mt-7">Copyright 2026 CS - Ticket System. All rights reserved.</h1>
      </section>
    </footer>
  );
};

export default Footer;
