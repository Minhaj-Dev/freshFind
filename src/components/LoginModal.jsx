import React from "react";
import { useModals } from "../context/ModalContext";

export default function LoginModal() {
  const { loginOpen, closeLogin, openSignup, showToast } = useModals();

  if (!loginOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    showToast("Login/signup is not part of the current FreshFind implementation.", "warning");
  }

  return (
    <div className="modal-overlay open" onClick={closeLogin}>
      <div className="login-modal modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeLogin} aria-label="Close modal">
          &times;
        </button>
        <div className="modal-logo">F</div>
        <span className="section-kicker">WELCOME TO FRESHFIND</span>
        <h2>
          Sign in to your <span>FreshFind</span>
        </h2>
        <p>Login to view your saved markets and personalized recommendations.</p>
        <form onSubmit={handleSubmit} className="auth-modal-form">
          <label>
            Email Address
            <input type="email" placeholder="you@example.com" required autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" required autoComplete="current-password" />
          </label>
          <button type="submit" className="primary-btn modal-submit">
            Login
          </button>
        </form>
        <div className="auth-notice-box">
          <span className="notice-icon">ℹ</span>
          <p>Login/signup is not part of the current FreshFind implementation.</p>
        </div>
        <p className="modal-switch-text">
          Don't have an account?{" "}
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
              openSignup();
            }}
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
