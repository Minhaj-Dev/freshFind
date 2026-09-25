import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="site-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep">›</span>
          <strong>About Us</strong>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section
          className="about-hero"
          style={{
            background: "#eef3eb",
            padding: "50px 0",
            borderBottom: "1px solid #dce8da"
          }}
        >
          <div
            className="container"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "40px",
              alignItems: "center"
            }}
          >
            <div>
              <span className="section-kicker">OUR PURPOSE & PHILOSOPHY</span>
              <h1
                style={{
                  fontSize: "42px",
                  color: "#173d2b",
                  fontWeight: 800,
                  margin: "8px 0 16px"
                }}
              >
                Fresh food should be <span>easy to find.</span>
              </h1>
              <p
                style={{
                  color: "#556b5d",
                  fontSize: "16px",
                  lineHeight: 1.6,
                  marginBottom: "24px"
                }}
              >
                FreshFind is a dedicated digital discovery platform designed to help people discover local farmers markets, explore seasonal produce, and find wholesome farm options right in their neighborhoods.
              </p>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <Link to="/markets" className="primary-btn">
                  Explore Directory →
                </Link>
                <Link to="/produce" className="primary-btn-outline">
                  Produce Guide →
                </Link>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px solid #d5decb",
                padding: "28px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🌱</div>
              <h3
                style={{
                  fontSize: "20px",
                  color: "#173d2b",
                  fontWeight: 800,
                  marginBottom: "8px"
                }}
              >
                Fresh All Along
              </h3>
              <p style={{ color: "#6a7c6f", fontSize: "13px", margin: 0 }}>
                Empowering local growers, healthy families, and sustainable food chains.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: OUR MISSION */}
        <section style={{ padding: "60px 0", background: "#ffffff" }}>
          <div className="container" style={{ maxWidth: "860px" }}>
            <span className="section-kicker">OUR MISSION</span>
            <h2
              style={{
                fontSize: "32px",
                color: "#173d2b",
                fontWeight: 800,
                marginBottom: "16px"
              }}
            >
              Making Local Farmers Markets Effortless to Discover
            </h2>
            <p
              style={{
                color: "#556b5d",
                fontSize: "16px",
                lineHeight: 1.7,
                marginBottom: "20px"
              }}
            >
              Instead of sifting through fragmented social posts, outdated bulletin boards, or unverified word-of-mouth tips, FreshFind brings verified schedules, real coordinates, and produce associations together into one seamless web experience.
            </p>
            <p style={{ color: "#556b5d", fontSize: "16px", lineHeight: 1.7 }}>
              Our goal is to make local food shopping as modern and convenient as any mainstream supermarket, while keeping money and community vitality right where it belongs: with our local farming families.
            </p>
          </div>
        </section>

        {/* SECTION: HOW PLATFORM WORKS (PIPELINE) */}
        <section
          style={{
            padding: "60px 0",
            background: "#f7faf5",
            borderTop: "1px solid #e2ebd9",
            borderBottom: "1px solid #e2ebd9"
          }}
        >
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 40px" }}>
              <span className="section-kicker">ARCHITECTURE & UX WORKFLOW</span>
              <h2
                style={{
                  fontSize: "32px",
                  color: "#173d2b",
                  fontWeight: 800,
                  marginBottom: "8px"
                }}
              >
                How the Platform Works
              </h2>
              <p style={{ color: "#556b5d", fontSize: "15px" }}>
                Follow the complete 6-stage visitor journey from inquiry to in-person visit.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "16px",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  padding: "24px 16px",
                  borderRadius: "14px",
                  border: "1px solid #dbe6d5"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>⌕</div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "16px",
                    color: "#173d2b",
                    marginBottom: "4px"
                  }}
                >
                  1. Discover
                </strong>
                <small style={{ color: "#6a7c6f", fontSize: "12px" }}>
                  Discover nearby markets across all city districts.
                </small>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px 16px",
                  borderRadius: "14px",
                  border: "1px solid #dbe6d5"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>⌨</div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "16px",
                    color: "#173d2b",
                    marginBottom: "4px"
                  }}
                >
                  2. Search
                </strong>
                <small style={{ color: "#6a7c6f", fontSize: "12px" }}>
                  Query by name, produce type, neighborhood or keywords.
                </small>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px 16px",
                  borderRadius: "14px",
                  border: "1px solid #dbe6d5"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚙</div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "16px",
                    color: "#173d2b",
                    marginBottom: "4px"
                  }}
                >
                  3. Filter
                </strong>
                <small style={{ color: "#6a7c6f", fontSize: "12px" }}>
                  Refine by operating day, area, or specific crops.
                </small>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px 16px",
                  borderRadius: "14px",
                  border: "1px solid #dbe6d5"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>◉</div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "16px",
                    color: "#173d2b",
                    marginBottom: "4px"
                  }}
                >
                  4. Explore
                </strong>
                <small style={{ color: "#6a7c6f", fontSize: "12px" }}>
                  Check weekly operating tables, today's status, and map location.
                </small>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px 16px",
                  borderRadius: "14px",
                  border: "1px solid #dbe6d5"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>♡</div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "16px",
                    color: "#173d2b",
                    marginBottom: "4px"
                  }}
                >
                  5. Save
                </strong>
                <small style={{ color: "#6a7c6f", fontSize: "12px" }}>
                  Bookmark picks with session notes and export to file.
                </small>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px 16px",
                  borderRadius: "14px",
                  border: "1px solid #dbe6d5"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📍</div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "16px",
                    color: "#173d2b",
                    marginBottom: "4px"
                  }}
                >
                  6. Visit
                </strong>
                <small style={{ color: "#6a7c6f", fontSize: "12px" }}>
                  Navigate directly using geolocation and map markers.
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: PROJECT INFORMATION */}
        <section style={{ padding: "60px 0", background: "#ffffff" }}>
          <div className="container">
            <span className="section-kicker">PROJECT SPECIFICATION</span>
            <h2
              style={{
                fontSize: "30px",
                color: "#173d2b",
                fontWeight: 800,
                marginBottom: "24px"
              }}
            >
              Project Information
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px"
              }}
            >
              <div
                style={{
                  background: "#fbfaf6",
                  border: "1px solid #e1dcce",
                  borderRadius: "14px",
                  padding: "22px"
                }}
              >
                <small
                  style={{
                    color: "#7b8f80",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    fontWeight: 800
                  }}
                >
                  Project Name
                </small>
                <h4 style={{ fontSize: "18px", color: "#173d2b", margin: "4px 0 6px" }}>
                  FreshFind
                </h4>
                <p style={{ fontSize: "13px", color: "#556b5d", margin: 0 }}>
                  Tagline: "Fresh All Along" • React Web Application
                </p>
              </div>

              <div
                style={{
                  background: "#fbfaf6",
                  border: "1px solid #e1dcce",
                  borderRadius: "14px",
                  padding: "22px"
                }}
              >
                <small
                  style={{
                    color: "#7b8f80",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    fontWeight: 800
                  }}
                >
                  Theme
                </small>
                <h4 style={{ fontSize: "18px", color: "#173d2b", margin: "4px 0 6px" }}>
                  Farmers Market & Produce Discovery
                </h4>
                <p style={{ fontSize: "13px", color: "#556b5d", margin: 0 }}>
                  Encouraging seasonal eating, local community markets, and transparent food systems.
                </p>
              </div>

              <div
                style={{
                  background: "#fbfaf6",
                  border: "1px solid #e1dcce",
                  borderRadius: "14px",
                  padding: "22px"
                }}
              >
                <small
                  style={{
                    color: "#7b8f80",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    fontWeight: 800
                  }}
                >
                  Technology
                </small>
                <h4 style={{ fontSize: "18px", color: "#173d2b", margin: "4px 0 6px" }}>
                  React.js Architecture
                </h4>
                <p style={{ fontSize: "13px", color: "#556b5d", margin: 0 }}>
                  React 18, JSX, React Router DOM, Vite, Vanilla CSS Design System, Local JSON Datasets.
                </p>
              </div>

              <div
                style={{
                  background: "#fbfaf6",
                  border: "1px solid #e1dcce",
                  borderRadius: "14px",
                  padding: "22px"
                }}
              >
                <small
                  style={{
                    color: "#7b8f80",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    fontWeight: 800
                  }}
                >
                  Purpose
                </small>
                <h4 style={{ fontSize: "18px", color: "#173d2b", margin: "4px 0 6px" }}>
                  Civic Wellness & Local Empowerment
                </h4>
                <p style={{ fontSize: "13px", color: "#556b5d", margin: 0 }}>
                  Bridge the gap between regional agricultural producers and urban conscious consumers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: TEAM */}
        <section
          style={{
            padding: "60px 0 80px",
            background: "#f8faf6",
            borderTop: "1px solid #e2ebd9"
          }}
        >
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
              <span className="section-kicker">PASSIONATE STEWARDS</span>
              <h2
                style={{
                  fontSize: "32px",
                  color: "#173d2b",
                  fontWeight: 800,
                  marginBottom: "8px"
                }}
              >
                The FreshFind Team
              </h2>
              <p style={{ color: "#556b5d", fontSize: "15px" }}>
                Meet the dedicated community members behind the FreshFind discovery initiative.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "24px"
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #dbe6d5",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center"
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    background: "#eef5eb",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px"
                  }}
                >
                  👩‍🌾
                </div>
                <h4 style={{ fontSize: "18px", color: "#173d2b", margin: "0 0 4px" }}>
                  Amina Raza
                </h4>
                <small
                  style={{
                    color: "#2d6547",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "8px"
                  }}
                >
                  Project Lead & Research
                </small>
                <p style={{ fontSize: "12px", color: "#6a7c6f", lineHeight: 1.5, margin: 0 }}>
                  Agricultural advocate focusing on smallholder connections and community market logistics.
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #dbe6d5",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center"
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    background: "#eef5eb",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px"
                  }}
                >
                  👨‍💻
                </div>
                <h4 style={{ fontSize: "18px", color: "#173d2b", margin: "0 0 4px" }}>
                  Bilal Tariq
                </h4>
                <small
                  style={{
                    color: "#2d6547",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "8px"
                  }}
                >
                  Frontend Architecture
                </small>
                <p style={{ fontSize: "12px", color: "#6a7c6f", lineHeight: 1.5, margin: 0 }}>
                  Specializing in accessible responsive design, interactive maps, and client-side logic.
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #dbe6d5",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center"
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    background: "#eef5eb",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px"
                  }}
                >
                  🍎
                </div>
                <h4 style={{ fontSize: "18px", color: "#173d2b", margin: "0 0 4px" }}>
                  Zainab Sheikh
                </h4>
                <small
                  style={{
                    color: "#2d6547",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "8px"
                  }}
                >
                  Produce & Seasonal Content
                </small>
                <p style={{ fontSize: "12px", color: "#6a7c6f", lineHeight: 1.5, margin: 0 }}>
                  Nutritionist and food writer curating produce guidance and seasonal peak charts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
