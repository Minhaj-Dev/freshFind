import React from "react";
import { Link } from "react-router-dom";
import { useModals } from "../context/ModalContext";

export default function Footer() {
  const { openLogin } = useModals();

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link to="/" className="brand footer-logo">
            <div className="brand-mark">
              <span>F</span>
            </div>
            <div className="brand-text">
              <strong>FreshFind</strong>
              <small>Fresh All Along</small>
            </div>
          </Link>
          <p>Helping communities discover local farmers markets and seasonal fresh produce.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
              f
            </a>
            <a href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
              ◎
            </a>
            <a href="#" aria-label="Twitter" onClick={(e) => e.preventDefault()}>
              𝕏
            </a>
            <a
              href="https://wa.me/"
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Navigation</h4>
          <Link to="/">Home</Link>
          <Link to="/#quick-find">Find Market</Link>
          <Link to="/markets">Market Directory</Link>
          <Link to="/produce">Produce Guide</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <Link to="/bookmarks">Bookmarks</Link>
          <Link to="/produce">Seasonal Picks</Link>
          <Link to="/guide">User Guide</Link>
          <button
            type="button"
            className="footer-link-btn"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "inherit",
              font: "inherit",
              cursor: "pointer",
              textAlign: "left",
              display: "block"
            }}
            onClick={openLogin}
          >
            Account Login
          </button>
        </div>

        <div className="footer-column footer-note">
          <h4>Project Info</h4>
          <p>Frontend-only web application created for discovering local markets and produce.</p>
          <small style={{ color: "#8fa094" }}>No server or API key required.</small>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 FreshFind. Fresh All Along.</p>
        <p>Built with care for local communities.</p>
      </div>
    </footer>
  );
}
