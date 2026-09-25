import React from "react";
import { Link } from "react-router-dom";
import { useModals } from "../context/ModalContext";

export default function SignIn() {
  const { showToast } = useModals();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    showToast("Login/signup is not part of the current FreshFind implementation.", "warning");
  };

  return (
    <main
      style={{
        padding: "70px 20px",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fbfaf6"
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e1dcce",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "440px",
          width: "100%",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          textAlign: "center"
        }}
      >
        <div className="modal-logo" style={{ margin: "0 auto 16px" }}>
          F
        </div>
        <span className="section-kicker">DEMO AUTHENTICATION</span>
        <h1
          style={{
            fontSize: "28px",
            color: "#173d2b",
            fontWeight: 800,
            marginBottom: "8px"
          }}
        >
          Sign in to FreshFind
        </h1>
        <p style={{ color: "#556b5d", fontSize: "14px", marginBottom: "24px" }}>
          Login to manage bookmarks and personalized community recommendations.
        </p>

        <form
          id="standaloneLoginForm"
          onSubmit={handleLoginSubmit}
          style={{
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "#3b5042",
                marginBottom: "6px"
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid #ced7c9",
                borderRadius: "8px",
                fontSize: "14px"
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "#3b5042",
                marginBottom: "6px"
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid #ced7c9",
                borderRadius: "8px",
                fontSize: "14px"
              }}
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
          >
            Login
          </button>
        </form>

        {/* Required Notice */}
        <div className="auth-notice-box" style={{ marginTop: "24px" }}>
          <span className="notice-icon">ℹ</span>
          <p>Login/signup is not part of the current FreshFind implementation.</p>
        </div>

        <p style={{ fontSize: "13px", color: "#6a7c6f", marginTop: "16px" }}>
          Return to{" "}
          <Link to="/" style={{ color: "#2d6547", fontWeight: 700 }}>
            Home Page
          </Link>{" "}
          or browse the{" "}
          <Link to="/markets" style={{ color: "#2d6547", fontWeight: 700 }}>
            Market Directory
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
