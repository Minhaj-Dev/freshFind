import React from "react";
import { Link } from "react-router-dom";
import { useModals } from "../context/ModalContext";
import { useBookmarks } from "../context/BookmarkContext";
import marketsData from "../data/markets.json";
import { isMarketOpen, getAssetUrl } from "../utils/engine";

export default function ProduceModal() {
  const { produceModalItem, closeProduceModal, openShare } = useModals();
  const { isProduceSaved, toggleProduceBookmark } = useBookmarks();

  if (!produceModalItem) return null;

  const p = produceModalItem;
  const isSaved = isProduceSaved(p.id);
  const marketIds = Array.isArray(p.marketIds) ? p.marketIds : [];

  return (
    <div
      className="modal-overlay open"
      onClick={closeProduceModal}
      id="produceDetailModal"
    >
      <div
        className="produce-modal-box modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={closeProduceModal}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="produce-modal-breadcrumb">
          <Link to="/" onClick={closeProduceModal}>
            Home
          </Link>{" "}
          <span>›</span>{" "}
          <Link to="/produce" onClick={closeProduceModal}>
            Produce Guide
          </Link>{" "}
          <span>›</span> <strong>{p.name}</strong>
        </div>

        <div className="produce-modal-header">
          <div className="produce-modal-avatar">{p.image || "🌱"}</div>
          <div className="produce-modal-header-info">
            <div className="produce-pill-row">
              <span className="produce-pill-category">{p.category}</span>
              <span className="produce-pill-season">{p.season}</span>
            </div>
            <h2>{p.name}</h2>
            <div className="modal-actions-bar">
              <button
                type="button"
                className={`primary-btn-outline ${isSaved ? "active" : ""}`}
                onClick={() => toggleProduceBookmark(p)}
              >
                <span>{isSaved ? "♥" : "♡"}</span>{" "}
                {isSaved ? "Bookmarked" : "Bookmark"}
              </button>
              <button
                type="button"
                className="primary-btn-outline"
                onClick={() =>
                  openShare(
                    `Fresh ${p.name} on FreshFind`,
                    `Find fresh ${p.name} at local community markets!`,
                    window.location.origin + `/produce?item=${p.id}`
                  )
                }
              >
                <span>🔗</span> Share
              </button>
            </div>
          </div>
        </div>

        <div className="produce-modal-body">
          <div className="produce-modal-section">
            <h4>Description & Harvest Notes</h4>
            <p>{p.description || p.shortDescription || "Fresh locally grown harvest."}</p>
          </div>

          <div className="produce-modal-section">
            <h4>Nutritional Highlights</h4>
            <p className="nutrition-highlight-text">
              {p.nutrition ||
                "100% natural, farm-fresh produce rich in essential vitamins, minerals, and dietary fiber."}
            </p>
          </div>

          <div className="produce-modal-section">
            <h4>Available At These Local Markets</h4>
            <p className="modal-market-sub">
              Click any market to view its weekly schedule and map location:
            </p>
            <div className="modal-markets-list">
              {marketIds.length === 0 ? (
                <p className="no-market-found">
                  Check market schedule for weekly arrival announcements.
                </p>
              ) : (
                marketIds.map((mId) => {
                  const m = marketsData[mId];
                  if (!m) return null;
                  const status = isMarketOpen(m);

                  return (
                    <Link
                      key={m.id}
                      to={`/markets/${m.id}`}
                      className="modal-market-item"
                      onClick={closeProduceModal}
                    >
                      <div
                        className="modal-market-avatar"
                        style={{
                          backgroundImage: `url('${getAssetUrl(m.image)}')`
                        }}
                      />
                      <div className="modal-market-info">
                        <strong>{m.name}</strong>
                        <small>
                          {m.area} {m.neighborhood ? `• ${m.neighborhood}` : ""}
                        </small>
                        <span className={`modal-market-status status-${status.code}`}>
                          {status.status}
                        </span>
                      </div>
                      <span className="modal-market-arrow">→</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
