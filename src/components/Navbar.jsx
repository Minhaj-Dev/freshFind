import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useBookmarks } from "../context/BookmarkContext";
import { useModals } from "../context/ModalContext";

export default function Navbar() {
  const { totalBookmarksCount } = useBookmarks();
  const { openLogin, openSignup } = useModals();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clockString, setClockString] = useState("");
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Live real-time clock
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const timeOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
      const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      const timeStr = now.toLocaleTimeString("en-US", timeOptions);
      const dateStr = now.toLocaleDateString("en-US", dateOptions);
      setClockString(`Current Time: ${timeStr} • ${dateStr}`);
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Bar with Live Real-Time Clock */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <span className="top-bar-brand-tag">FreshFind — Fresh All Along</span>
          <span id="liveClock" className="top-bar-clock">
            {clockString || "Current Time: Loading..."}
          </span>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="main-header">
        <Link to="/" className="brand">
          <div className="brand-mark">
            <span>F</span>
          </div>
          <div className="brand-text">
            <strong>FreshFind</strong>
            <small>Fresh All Along</small>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              Home
            </NavLink>
          </li>
          <li>
            <Link to="/#quick-find">Find a Market</Link>
          </li>
          <li>
            <NavLink to="/markets" className={({ isActive }) => (isActive ? "active" : "")}>
              Market Directory
            </NavLink>
          </li>
          <li>
            <NavLink to="/produce" className={({ isActive }) => (isActive ? "active" : "")}>
              Produce Guide
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
              Contact Us
            </NavLink>
          </li>
          <li>
            <NavLink to="/bookmarks" className={({ isActive }) => (isActive ? "active" : "")}>
              Bookmarks{" "}
              <span id="bookmarkCount" className={`badge ${totalBookmarksCount > 0 ? "has-items" : ""}`}>
                {totalBookmarksCount}
              </span>
            </NavLink>
          </li>
        </ul>

        {/* Header Right Actions */}
        <div className="header-right">
          <button className="nav-auth-btn open-login-btn" onClick={openLogin}>
            Login
          </button>
          <button className="nav-auth-btn nav-signup-btn open-signup-btn" onClick={openSignup}>
            Signup
          </button>
          <Link to="/markets" className="btn-find">
            Find a Market
          </Link>
          <button
            className="mobile-hamburger"
            id="menuToggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`} id="mobileNavDrawer">
        <div className="mobile-nav-header">
          <div className="brand">
            <div className="brand-mark"><span>F</span></div>
            <div className="brand-text"><strong>FreshFind</strong></div>
          </div>
          <button
            className="modal-close"
            id="closeMobileNav"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            &times;
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/#quick-find" onClick={() => setMobileMenuOpen(false)}>
              Find a Market
            </Link>
          </li>
          <li>
            <Link to="/markets" onClick={() => setMobileMenuOpen(false)}>
              Market Directory
            </Link>
          </li>
          <li>
            <Link to="/produce" onClick={() => setMobileMenuOpen(false)}>
              Produce Guide
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </li>
          <li>
            <Link to="/bookmarks" onClick={() => setMobileMenuOpen(false)}>
              Bookmarks{" "}
              <span className={`badge bookmark-count-badge ${totalBookmarksCount > 0 ? "has-items" : ""}`}>
                {totalBookmarksCount}
              </span>
            </Link>
          </li>
          <li>
            <button
              className="open-login-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                openLogin();
              }}
            >
              Login
            </button>
          </li>
          <li>
            <button
              className="open-signup-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                openSignup();
              }}
            >
              Signup
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
