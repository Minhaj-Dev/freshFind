import React from "react";
import { useModals } from "../context/ModalContext";

export default function SignupModal() {
  const { signupOpen, closeSignup, openLogin, showToast } = useModals();

  if (!signupOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    showToast("Login/signup is not part of the current FreshFind implementation.", "warning");
  }

  return (
    <div className="modal-overlay open" onClick={closeSignup}>
      <div className="signup-modal modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeSignup} aria-label="Close modal">
          &times;
        </button>
        <div className="modal-logo">F</div>
        <span className="section-kicker">JOIN FRESHFIND</span>
        <h2>
          Create your <span>Account</span>
        </h2>
        <p>Sign up to start bookmarking your neighborhood markets.</p>
        <form onSubmit={handleSubmit} className="auth-modal-form">
          <label>
            Full Name
            <input type="text" placeholder="Your name" required />
          </label>
          <label>
            Email Address
            <input type="email" placeholder="you@example.com" required autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" required autoComplete="new-password" />
          </label>
          <button type="submit" className="primary-btn modal-submit">
            Create Account
          </button>
        </form>
        <div className="auth-notice-box">
          <span className="notice-icon">ℹ</span>
          <p>Login/signup is not part of the current FreshFind implementation.</p>
        </div>
        <p className="modal-switch-text">
          Already registered?{" "}
          <button
            type="button"
            className="link-switch-btn"
            style={{
              background: "none",
              border: "none",
              color: "#2d6547",
              fontWeight: 700,
              cursor: "pointer",
              padding: 0
            }}
            onClick={(e) => {
              e.preventDefault();
              openLogin();
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
