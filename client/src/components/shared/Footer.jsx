import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="enhanced-footer">
      <div className="container">
        <div className="row g-5 mb-5">
          <div className="col-lg-4">
            <img src="/tripshare-logo.png" alt="TripShare AI" style={{ width: "120px", height: "auto" }} className="mb-3" />
            <p className="text-secondary mb-4" style={{ fontSize: "0.95rem", maxWidth: "300px" }}>
              The world's smartest AI-powered travel ecosystem. Plan, collaborate, and explore together.
            </p>
            <div className="footer-social-icons">
              <a href="https://github.com" aria-label="GitHub"><i className="fab fa-github"></i></a>
              <a href="https://linkedin.com" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              <a href="https://instagram.com" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="https://twitter.com" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-4 col-6">
            <h5 className="footer-col-title">Product</h5>
            <ul className="footer-links">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/">Pricing <span className="badge bg-secondary ms-1" style={{ fontSize: "0.6rem" }}>Soon</span></Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h5 className="footer-col-title">Support</h5>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/contact">FAQ</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Terms</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 col-12">
            <h5 className="footer-col-title">Resources</h5>
            <ul className="footer-links">
              <li><Link to="/">GitHub</Link></li>
              <li><Link to="/">LinkedIn</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-top border-secondary pt-4 text-center">
          <p className="text-secondary mb-1" style={{ fontSize: "0.9rem" }}>TripShare AI © 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
