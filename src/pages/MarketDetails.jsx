import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import marketsData from "../data/markets.json";
import produceData from "../data/produce.json";
import { isMarketOpen, getNextOpenTime, DAYS_ORDER, getAssetUrl } from "../utils/engine";
import { useBookmarks } from "../context/BookmarkContext";
import { useModals } from "../context/ModalContext";

export default function MarketDetails() {
  const { id } = useParams();
  const { isMarketSaved, toggleMarketBookmark, isProduceSaved, toggleProduceBookmark } = useBookmarks();
  const { openShare, openProduceModal } = useModals();

  const market = marketsData[id] || Object.values(marketsData).find((m) => m.id === id);

  if (!market) {
    return (
      <main>
        <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
          <h2>Market Information Not Available</h2>
          <p>We couldn't retrieve information for this market. Please return to the directory.</p>
          <Link
            to="/markets"
            className="primary-btn"
            style={{ display: "inline-block", marginTop: "20px" }}
          >
            Back to Market Directory
          </Link>
        </div>
      </main>
    );
  }

  const status = isMarketOpen(market);
  const nextOpen = getNextOpenTime(market);
  const isSaved = isMarketSaved(market.id);

  const daysStr = Array.isArray(market.operatingDays)
    ? market.operatingDays.join(", ")
    : market.day || "Scheduled Days";

  const todayName = DAYS_ORDER[new Date().getDay()];

  // Weekly Schedule rows
  const scheduleRows = Array.isArray(market.schedule) && market.schedule.length === 7
    ? market.schedule
    : [
        { day: "Monday", open: "08:00 AM", close: "02:00 PM", isOpen: true },
        { day: "Tuesday", open: "—", close: "—", isOpen: false },
        { day: "Wednesday", open: "08:00 AM", close: "02:00 PM", isOpen: true },
        { day: "Thursday", open: "—", close: "—", isOpen: false },
        { day: "Friday", open: "—", close: "—", isOpen: false },
        { day: "Saturday", open: "08:00 AM", close: "03:00 PM", isOpen: true },
        { day: "Sunday", open: "—", close: "—", isOpen: false }
      ];

  // Available Produce
  const availableProduce = (market.produceIds || [])
    .map((pId) => produceData.find((p) => p.id === pId))
    .filter(Boolean);

  // Map Embed URL
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${market.longitude - 0.015}%2C${market.latitude - 0.015}%2C${market.longitude + 0.015}%2C${market.latitude + 0.015}&layer=mapnik&marker=${market.latitude}%2C${market.longitude}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${market.latitude},${market.longitude}`;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="site-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep">›</span>
          <Link to="/markets">Market Directory</Link>
          <span className="sep">›</span>
          <strong id="breadcrumbMarketName">{market.name}</strong>
        </div>
      </nav>

      <main>
        <section className="market-details-page" style={{ padding: "40px 0 70px" }}>
          <div className="container">
            <Link
              to="/markets"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#2d6547",
                fontWeight: 700,
                textDecoration: "none",
                marginBottom: "24px",
                fontSize: "14px"
              }}
            >
              ← Back to Market Directory
            </Link>

            {/* 18.1 MARKET HEADER CARD */}
            <div
              className="market-details-card"
              style={{
                background: "#ffffff",
                border: "1px solid #e2ddd0",
                borderRadius: "20px",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                marginBottom: "40px"
              }}
            >
              {/* Large Image */}
              <div
                className="market-details-image"
                id="marketImage"
                style={{
                  minHeight: "380px",
                  backgroundImage: `url('${getAssetUrl(market.image)}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    width: "100%"
                  }}
                >
                  <span className={`status-badge status-${status.code}`} id="marketBadge">
                    <span className="status-icon">{status.icon}</span> <span>{status.status}</span>
                  </span>
                </div>
                {status.code !== "open" && (
                  <div
                    id="marketNextOpenText"
                    style={{
                      background: "rgba(0,0,0,0.75)",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      backdropFilter: "blur(4px)",
                      alignSelf: "flex-start"
                    }}
                  >
                    Schedule: {nextOpen}
                  </div>
                )}
              </div>

              {/* Header Content */}
              <div
                className="market-details-content"
                style={{
                  padding: "40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}
              >
                <span
                  className="market-area"
                  id="marketArea"
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#6a8c6f",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px"
                  }}
                >
                  {market.area} {market.neighborhood ? `• ${market.neighborhood}` : ""}
                </span>
                <h1
                  id="marketName"
                  style={{
                    fontSize: "34px",
                    color: "#173d2b",
                    fontWeight: 800,
                    margin: "0 0 14px",
                    lineHeight: 1.2
                  }}
                >
                  {market.name}
                </h1>

                <p
                  className="market-description"
                  id="marketDescription"
                  style={{
                    fontSize: "15px",
                    color: "#556b5d",
                    lineHeight: 1.6,
                    marginBottom: "20px"
                  }}
                >
                  {market.description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                    padding: "14px",
                    background: "#f7faf5",
                    borderRadius: "12px",
                    marginBottom: "24px"
                  }}
                >
                  <div>
                    <small
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "#7a8c80",
                        textTransform: "uppercase"
                      }}
                    >
                      Primary Day(s)
                    </small>
                    <strong id="marketDay" style={{ fontSize: "14px", color: "#173d2b" }}>
                      {daysStr}
                    </strong>
                  </div>
                  <div>
                    <small
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "#7a8c80",
                        textTransform: "uppercase"
                      }}
                    >
                      Operating Hours
                    </small>
                    <strong id="marketTime" style={{ fontSize: "14px", color: "#173d2b" }}>
                      {market.operatingHours || market.time || "See details"}
                    </strong>
                  </div>
                </div>

                {/* Action Buttons: Bookmark & Share */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className={`primary-btn-outline ${isSaved ? "active" : ""}`}
                    id="detailBookmarkBtn"
                    style={{ padding: "10px 20px" }}
                    onClick={() => toggleMarketBookmark(market)}
                  >
                    <span>{isSaved ? "♥" : "♡"}</span> {isSaved ? "Bookmarked" : "Bookmark"}
                  </button>
                  <button
                    type="button"
                    className="primary-btn-outline"
                    id="detailShareBtn"
                    style={{ padding: "10px 20px" }}
                    onClick={() =>
                      openShare(
                        market.name,
                        `Explore ${market.name} in ${market.area} on FreshFind!`,
                        window.location.href
                      )
                    }
                  >
                    <span>🔗</span> Share Market
                  </button>
                  <a href="#scheduleSection" className="primary-btn" style={{ padding: "10px 20px" }}>
                    View Weekly Schedule ↓
                  </a>
                </div>
              </div>
            </div>

            {/* LOCATION & MAP SECTION */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr",
                gap: "30px",
                marginBottom: "40px"
              }}
              className="location-map-grid"
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e1dcce",
                  borderRadius: "16px",
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}
              >
                <span className="section-kicker">MARKET LOCATION</span>
                <h2
                  style={{
                    fontSize: "24px",
                    color: "#173d2b",
                    fontWeight: 800,
                    marginBottom: "18px"
                  }}
                >
                  Address & Coordinates
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <small
                      style={{
                        fontSize: "11px",
                        color: "#7a8c80",
                        textTransform: "uppercase",
                        fontWeight: 700
                      }}
                    >
                      Full Street Address
                    </small>
                    <p
                      id="detailFullAddress"
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#173d2b",
                        margin: "2px 0 0"
                      }}
                    >
                      {market.address || `${market.name}, ${market.area}`}
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <small
                        style={{
                          fontSize: "11px",
                          color: "#7a8c80",
                          textTransform: "uppercase",
                          fontWeight: 700
                        }}
                      >
                        Area
                      </small>
                      <p
                        id="detailArea"
                        style={{
                          fontSize: "14px",
                          color: "#2d6547",
                          fontWeight: 700,
                          margin: "2px 0 0"
                        }}
                      >
                        {market.area}
                      </p>
                    </div>
                    <div>
                      <small
                        style={{
                          fontSize: "11px",
                          color: "#7a8c80",
                          textTransform: "uppercase",
                          fontWeight: 700
                        }}
                      >
                        Neighborhood
                      </small>
                      <p
                        id="detailNeighborhood"
                        style={{
                          fontSize: "14px",
                          color: "#2d6547",
                          fontWeight: 700,
                          margin: "2px 0 0"
                        }}
                      >
                        {market.neighborhood || "District"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <small
                      style={{
                        fontSize: "11px",
                        color: "#7a8c80",
                        textTransform: "uppercase",
                        fontWeight: 700
                      }}
                    >
                      Coordinates
                    </small>
                    <p
                      id="detailCoordinates"
                      style={{
                        fontFamily: "monospace",
                        fontSize: "13px",
                        color: "#4b6653",
                        margin: "2px 0 0"
                      }}
                    >
                      {market.latitude.toFixed(4)}° N, {market.longitude.toFixed(4)}° E
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "20px",
                    borderTop: "1px solid #eef2ec"
                  }}
                >
                  <h3 style={{ fontSize: "16px", color: "#173d2b", marginBottom: "8px" }}>
                    About This Market
                  </h3>
                  <p
                    id="marketAbout"
                    style={{
                      fontSize: "13px",
                      color: "#556b5d",
                      lineHeight: 1.6,
                      margin: 0
                    }}
                  >
                    {market.about || market.description}
                  </p>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-btn-outline"
                    style={{ fontSize: "13px", padding: "8px 16px" }}
                  >
                    Get Directions in Google Maps ↗
                  </a>
                </div>
              </div>

              {/* Interactive Coordinates Map */}
              <div
                className="market-map-container"
                id="marketMap"
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #dce2d9",
                  minHeight: "360px",
                  background: "#e8ede6"
                }}
              >
                <iframe
                  title={`Map location for ${market.name}`}
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "360px" }}
                  loading="lazy"
                />
              </div>
            </div>

            {/* WEEKLY SCHEDULE SECTION */}
            <section
              id="scheduleSection"
              style={{
                background: "#ffffff",
                border: "1px solid #e1dcce",
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "40px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <span className="section-kicker">7-DAY OPERATING SCHEDULE</span>
                  <h2
                    style={{
                      fontSize: "24px",
                      color: "#173d2b",
                      fontWeight: 800,
                      margin: "4px 0 0"
                    }}
                  >
                    Weekly Market Timings
                  </h2>
                  <p style={{ color: "#687d6e", fontSize: "13px", margin: "4px 0 0" }}>
                    Today's schedule is highlighted automatically based on current device date and time.
                  </p>
                </div>
              </div>

              <div className="schedule-table-wrap">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Day of Week</th>
                      <th>Opening Time</th>
                      <th>Closing Time</th>
                      <th>Operating Status</th>
                    </tr>
                  </thead>
                  <tbody id="scheduleTableBody">
                    {scheduleRows.map((row) => {
                      const isToday = row.day.toLowerCase() === todayName.toLowerCase();
                      return (
                        <tr key={row.day} className={isToday ? "today-highlight" : ""}>
                          <td>
                            <strong>{row.day}</strong>
                            {isToday && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: "11px",
                                  background: "#2d6547",
                                  color: "#ffffff",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontWeight: 700
                                }}
                              >
                                TODAY
                              </span>
                            )}
                          </td>
                          <td>{row.open || "—"}</td>
                          <td>{row.close || "—"}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                row.isOpen ? "status-open" : "status-closed"
                              }`}
                              style={{
                                padding: "3px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 700,
                                background: row.isOpen ? "#eaf6ea" : "#fdf0ed",
                                color: row.isOpen ? "#20633b" : "#99291b"
                              }}
                            >
                              {row.isOpen ? "🟢 Open" : "⚪ Closed"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* AVAILABLE PRODUCE SECTION */}
            <section
              style={{
                background: "#fbfaf6",
                border: "1px solid #e1dcce",
                borderRadius: "16px",
                padding: "32px"
              }}
            >
              <div style={{ marginBottom: "24px" }}>
                <span className="section-kicker">WHAT YOU'LL FIND HERE</span>
                <h2
                  style={{
                    fontSize: "24px",
                    color: "#173d2b",
                    fontWeight: 800,
                    margin: "4px 0 6px"
                  }}
                >
                  Available Fresh Produce
                </h2>
                <p style={{ color: "#687d6e", fontSize: "14px", margin: 0 }}>
                  Explore fruits, vegetables, dairy, and herbs traditionally available at this community market. Click any item for details.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "20px"
                }}
                id="marketProduceGrid"
              >
                {availableProduce.map((p) => {
                  const isProdSaved = isProduceSaved(p.id);
                  return (
                    <div
                      key={p.id}
                      className="produce-card"
                      style={{ cursor: "pointer" }}
                      onClick={() => openProduceModal(p)}
                    >
                      <div className="produce-emoji-display">{p.image || "🌱"}</div>
                      <div className="produce-card-content">
                        <span className="produce-tag">{p.category}</span>
                        <h3>{p.name}</h3>
                        <p>{p.shortDescription || p.description}</p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "12px"
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#5a7a63", fontWeight: 700 }}>
                            {p.season}
                          </span>
                          <button
                            type="button"
                            className={`pick-heart-btn ${isProdSaved ? "bookmarked" : ""}`}
                            aria-label="Bookmark produce"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProduceBookmark(p);
                            }}
                          >
                            {isProdSaved ? "♥" : "♡"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
