import React, { useState } from "react";
import { Link } from "react-router-dom";
import { calculateDistance } from "../utils/engine";
import { useModals } from "../context/ModalContext";

export default function Contact() {
  const { showToast } = useModals();

  const HUB_LAT = 24.8607;
  const HUB_LON = 67.0011;

  const [locationStatus, setLocationStatus] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "market",
    message: ""
  });

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      const msg = "Location is not supported by your browser.";
      setLocationStatus(msg);
      showToast(msg, "warning");
      return;
    }

    setIsDetecting(true);
    setLocationStatus("Detecting your coordinates...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        const dist = calculateDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          HUB_LAT,
          HUB_LON
        );
        const msg = `You are approximately ${dist} km from the FreshFind Community Hub!`;
        setLocationStatus(msg);
        showToast(msg, "success");
      },
      (err) => {
        setIsDetecting(false);
        console.warn("Geolocation error:", err);
        const fallbackMsg = "Could not access location. Community Hub is located in Central Civic Square, Downtown.";
        setLocationStatus(fallbackMsg);
        showToast("Location access declined or unavailable.", "info");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    showToast(
      `Thank you, ${formData.name}! Your message has been received. Our community team will respond soon.`,
      "success"
    );

    setFormData({
      name: "",
      email: "",
      topic: "market",
      message: ""
    });
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav className="site-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep">›</span>
          <strong>Contact Us</strong>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section
          className="contact-hero"
          style={{
            background: "#eef3eb",
            padding: "48px 0",
            borderBottom: "1px solid #dce8da"
          }}
        >
          <div className="container" style={{ maxWidth: "800px", textAlign: "center" }}>
            <span className="section-kicker">GET IN TOUCH</span>
            <h1
              style={{
                fontSize: "42px",
                color: "#173d2b",
                fontWeight: 800,
                margin: "8px 0 14px"
              }}
            >
              We'd Love to Hear From You
            </h1>
            <p
              style={{
                color: "#556b5d",
                fontSize: "16px",
                margin: 0,
                lineHeight: 1.6
              }}
            >
              Have questions about a farmers market, want to recommend a fresh produce addition, or have suggestions for the platform? Reach out to our community team.
            </p>
          </div>
        </section>

        {/* CONTACT DETAILS & FORM */}
        <section style={{ padding: "50px 0 70px" }}>
          <div
            className="container contact-grid-wrap"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.2fr",
              gap: "40px",
              alignItems: "flex-start"
            }}
          >
            {/* CONTACT INFORMATION */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e1dcce",
                borderRadius: "18px",
                padding: "32px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.02)"
              }}
            >
              <span className="section-kicker">COMMUNITY HUB</span>
              <h2
                style={{
                  fontSize: "24px",
                  color: "#173d2b",
                  fontWeight: 800,
                  marginBottom: "20px"
                }}
              >
                Contact Information
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "#eef5eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0
                    }}
                  >
                    📍
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: "14px", color: "#173d2b" }}>
                      Physical Address
                    </strong>
                    <p style={{ color: "#556b5d", fontSize: "13px", margin: "2px 0 0" }}>
                      FreshFind Community Hub, 14 Civic Boulevard, Downtown
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "#eef5eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0
                    }}
                  >
                    📞
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: "14px", color: "#173d2b" }}>
                      Phone
                    </strong>
                    <p style={{ color: "#556b5d", fontSize: "13px", margin: "2px 0 0" }}>
                      +92 (021) 3456-7890
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "#eef5eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0
                    }}
                  >
                    ✉
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: "14px", color: "#173d2b" }}>
                      Email
                    </strong>
                    <p style={{ color: "#556b5d", fontSize: "13px", margin: "2px 0 0" }}>
                      hello@freshfind.local
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "#eef5eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0
                    }}
                  >
                    🕘
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: "14px", color: "#173d2b" }}>
                      Contact Hours
                    </strong>
                    <p style={{ color: "#556b5d", fontSize: "13px", margin: "2px 0 0" }}>
                      Monday – Saturday: 08:00 AM – 06:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Geolocation Feature */}
              <div
                style={{
                  marginTop: "30px",
                  paddingTop: "24px",
                  borderTop: "1px solid #eef2ec"
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "#173d2b",
                    marginBottom: "6px"
                  }}
                >
                  Your Location Distance Check
                </strong>
                <p style={{ color: "#6a7c6f", fontSize: "12px", marginBottom: "12px" }}>
                  Detect your approximate coordinates to verify distance to the FreshFind Hub.
                </p>
                <button
                  type="button"
                  className="location-btn"
                  id="contactLocationBtn"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={handleDetectLocation}
                >
                  <span>⌖</span> {isDetecting ? "Detecting..." : "Detect My Location"}
                </button>
                {locationStatus && (
                  <div
                    id="contactLocationResult"
                    style={{
                      fontSize: "12px",
                      color: "#2d6547",
                      fontWeight: 700,
                      marginTop: "8px"
                    }}
                  >
                    {locationStatus}
                  </div>
                )}
              </div>
            </div>

            {/* CONTACT FORM */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e1dcce",
                borderRadius: "18px",
                padding: "36px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.02)"
              }}
            >
              <span className="section-kicker">SEND US A MESSAGE</span>
              <h2
                style={{
                  fontSize: "24px",
                  color: "#173d2b",
                  fontWeight: 800,
                  marginBottom: "8px"
                }}
              >
                Direct Inquiry
              </h2>
              <p
                style={{
                  color: "#556b5d",
                  fontSize: "14px",
                  marginBottom: "24px"
                }}
              >
                Please fill out the form below. We respond to all community inquiries within 24 hours.
              </p>

              <form id="contactPageForm" onSubmit={handleFormSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px"
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
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="cName"
                      required
                      placeholder="Ahmad Khan"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
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
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="cEmail"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: "1px solid #ced7c9",
                        borderRadius: "8px",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#3b5042",
                      marginBottom: "6px"
                    }}
                  >
                    Inquiry Topic
                  </label>
                  <select
                    id="cTopic"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, topic: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #ced7c9",
                      borderRadius: "8px",
                      fontSize: "14px",
                      background: "#fff"
                    }}
                  >
                    <option value="market">Market Information / Suggest a New Market</option>
                    <option value="produce">Produce Guide Correction / Addition</option>
                    <option value="general">General Support / Question</option>
                    <option value="feedback">Platform Feedback</option>
                  </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#3b5042",
                      marginBottom: "6px"
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="cMessage"
                    rows="5"
                    required
                    placeholder="Write your question, suggestion or feedback..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #ced7c9",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      resize: "vertical"
                    }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="primary-btn"
                  style={{
                    padding: "12px 28px",
                    width: "100%",
                    justifyContent: "center"
                  }}
                >
                  Send Message <span>→</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* INTERACTIVE MAP SECTION */}
        <section style={{ padding: "0 0 70px" }}>
          <div className="container">
            <div style={{ marginBottom: "16px" }}>
              <span className="section-kicker">INTERACTIVE MAP</span>
              <h2 style={{ fontSize: "24px", color: "#173d2b", fontWeight: 800, margin: 0 }}>
                FreshFind Community Hub Location
              </h2>
            </div>

            <div
              style={{
                height: "380px",
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid #d5decb",
                position: "relative"
              }}
            >
              <iframe
                title="FreshFind Hub Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src="https://www.openstreetmap.org/export/embed.html?bbox=66.98%2C24.84%2C67.03%2C24.88&layer=mapnik&marker=24.8607%2C67.0011"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
