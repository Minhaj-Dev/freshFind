import React from "react";
import { Link } from "react-router-dom";
import { isMarketOpen, getAssetUrl } from "../utils/engine";
import { useBookmarks } from "../context/BookmarkContext";

export default function MarketCard({ market, distance }) {
  const { isMarketSaved, toggleMarketBookmark } = useBookmarks();
  const isSaved = isMarketSaved(market.id);
  const status = isMarketOpen(market);

  const daysStr = Array.isArray(market.operatingDays)
    ? market.operatingDays.join(" • ")
    : market.day || "Weekly";

  return (
    <div className="quick-market-card market-directory-card">
      <div
        className="quick-card-img"
        style={{ backgroundImage: `url('${getAssetUrl(market.image)}')` }}
      >
        <span className={`status-pill status-${status.code}`}>
          {status.icon} {status.status}
        </span>
        <button
          type="button"
          className={`quick-bookmark-btn ${isSaved ? "bookmarked" : ""}`}
          aria-label={isSaved ? "Remove Bookmark" : "Add Bookmark"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMarketBookmark(market);
          }}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="quick-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="quick-card-area">
            {market.area} {market.neighborhood ? `• ${market.neighborhood}` : ""}
          </span>
          {distance != null && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#2d6547",
                background: "#eef6eb",
                padding: "2px 8px",
                borderRadius: "12px"
              }}
            >
              📍 {distance} km
            </span>
          )}
        </div>

        <h4>{market.name}</h4>
        <p className="quick-card-timing">
          📅 {daysStr} | 🕘 {market.operatingHours || market.time || "See details"}
        </p>
        <Link to={`/markets/${market.id}`} className="quick-card-link">
          View Details →
        </Link>
      </div>
    </div>
  );
}
