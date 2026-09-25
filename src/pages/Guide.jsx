import React from "react";
import { Link } from "react-router-dom";

export default function Guide() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="site-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep">›</span>
          <strong>Platform Guide</strong>
        </div>
      </nav>

      <main>
        {/* GUIDE HERO */}
        <section
          className="guide-hero"
          style={{
            background: "#eef3eb",
            padding: "50px 0",
            borderBottom: "1px solid #dce8da"
          }}
        >
          <div className="container" style={{ maxWidth: "800px", textAlign: "center" }}>
            <span className="section-kicker">FRESHFIND USER GUIDE</span>
            <h1
              style={{
                fontSize: "42px",
                color: "#173d2b",
                fontWeight: 800,
                margin: "8px 0 14px"
              }}
            >
              Your Guide to Local Markets
            </h1>
            <p
              style={{
                color: "#556b5d",
                fontSize: "16px",
                margin: 0,
                lineHeight: 1.6
              }}
            >
              Discover how FreshFind helps you find community markets, check live opening hours, explore seasonal farm produce, and plan your market visits.
            </p>
          </div>
        </section>

        {/* STEP BY STEP GUIDE */}
        <section style={{ padding: "60px 0", background: "#ffffff" }}>
          <div className="container">
            <div
              className="section-heading"
              style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 40px" }}
            >
              <span className="section-kicker">STEP BY STEP</span>
              <h2
                style={{
                  fontSize: "32px",
                  color: "#173d2b",
                  fontWeight: 800,
                  marginBottom: "8px"
                }}
              >
                Explore in Simple Steps
              </h2>
              <p style={{ color: "#556b5d", fontSize: "15px" }}>
                Follow these recommendations to get the most value from FreshFind.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px"
              }}
            >
              <div
                style={{
                  background: "#fbfaf6",
                  border: "1px solid #e1dcce",
                  borderRadius: "16px",
                  padding: "28px"
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🗺</div>
                <h3
                  style={{
                    fontSize: "20px",
                    color: "#173d2b",
                    fontWeight: 800,
                    marginBottom: "8px"
                  }}
                >
                  1. Market Directory
                </h3>
                <p style={{ fontSize: "14px", color: "#556b5d", lineHeight: 1.6, margin: 0 }}>
                  Use the Directory to search by Area (Downtown, Clifton, Gulshan, etc.), filter by Day of the week, or sort by Nearest using browser geolocation.
                </p>
              </div>

              <div
                style={{
                  background: "#fbfaf6",
                  border: "1px solid #e1dcce",
                  borderRadius: "16px",
                  padding: "28px"
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🍎</div>
                <h3
                  style={{
                    fontSize: "20px",
                    color: "#173d2b",
                    fontWeight: 800,
                    marginBottom: "8px"
                  }}
                >
                  2. Produce Guide
                </h3>
                <p style={{ fontSize: "14px", color: "#556b5d", lineHeight: 1.6, margin: 0 }}>
                  Browse fruits, vegetables, dairy, and herbs. Click any item to see which markets have it and learn its peak harvest season and nutritional benefits.
                </p>
              </div>

              <div
                style={{
                  background: "#fbfaf6",
                  border: "1px solid #e1dcce",
                  borderRadius: "16px",
                  padding: "28px"
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>📝</div>
                <h3
                  style={{
                    fontSize: "20px",
                    color: "#173d2b",
                    fontWeight: 800,
                    marginBottom: "8px"
                  }}
                >
                  3. Bookmarks & Notes
                </h3>
                <p style={{ fontSize: "14px", color: "#556b5d", lineHeight: 1.6, margin: 0 }}>
                  Tap the heart icon (♡) to bookmark favorites. Write temporary session notes for your shopping list and export your bookmarks to a text or JSON file.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK CTA BANNER */}
        <section style={{ padding: "0 0 70px" }}>
          <div className="container">
            <div
              style={{
                background: "#f1f7ed",
                border: "1px solid #d3e5cd",
                borderRadius: "20px",
                padding: "40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px"
              }}
            >
              <div>
                <span className="section-kicker">READY TO EXPLORE?</span>
                <h2
                  style={{
                    fontSize: "28px",
                    color: "#173d2b",
                    fontWeight: 800,
                    margin: "4px 0 6px"
                  }}
                >
                  Find your next fresh market stop
                </h2>
                <p style={{ color: "#4f6b57", fontSize: "15px", margin: 0 }}>
                  Start discovering fresh local options in your community today.
                </p>
              </div>
              <Link to="/markets" className="primary-btn" style={{ padding: "12px 24px" }}>
                Explore Directory →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
