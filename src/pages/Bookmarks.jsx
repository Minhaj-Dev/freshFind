import React, { useState } from "react";
import { Link } from "react-router-dom";
import marketsData from "../data/markets.json";
import produceData from "../data/produce.json";
import { useBookmarks } from "../context/BookmarkContext";
import { useModals } from "../context/ModalContext";
import { isMarketOpen, getAssetUrl } from "../utils/engine";

export default function Bookmarks() {
  const {
    savedMarkets,
    savedProduce,
    removeMarketBookmark,
    removeProduceBookmark,
    getNote,
    saveNote,
    deleteNote,
    exportBookmarksToFile
  } = useBookmarks();

  const { openShare, openProduceModal } = useModals();

  // State to track editing of note: { type: 'market'|'produce', id: string, text: string }
  const [editingNote, setEditingNote] = useState(null);

  const startEditNote = (type, id) => {
    const currentNote = getNote(type, id);
    setEditingNote({ type, id, text: currentNote });
  };

  const handleSaveNoteSubmit = (e) => {
    e.preventDefault();
    if (editingNote) {
      saveNote(editingNote.type, editingNote.id, editingNote.text);
      setEditingNote(null);
    }
  };

  const cancelEditNote = () => {
    setEditingNote(null);
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav className="site-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep">›</span>
          <strong>Bookmarks</strong>
        </div>
      </nav>

      <main className="bookmarks-page-wrapper">
        {/* HERO SECTION */}
        <section
          className="bookmark-hero"
          style={{
            background: "#eef3eb",
            padding: "48px 0",
            borderBottom: "1px solid #dce8da"
          }}
        >
          <div className="container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: "20px"
              }}
            >
              <div>
                <span className="section-kicker">PERSONAL SHORTLIST & VISIT PLANNER</span>
                <h1
                  style={{
                    fontSize: "42px",
                    color: "#173d2b",
                    fontWeight: 800,
                    margin: "8px 0 12px"
                  }}
                >
                  Your FreshFind Bookmarks
                </h1>
                <p
                  style={{
                    color: "#556b5d",
                    fontSize: "16px",
                    maxWidth: "620px",
                    margin: 0,
                    lineHeight: 1.6
                  }}
                >
                  Keep your favorite farmers markets and seasonal produce handy. Attach temporary session notes for your shopping trips or export your bookmarks to file.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  id="exportBookmarksBtn"
                  className="primary-btn"
                  style={{ padding: "10px 18px" }}
                  onClick={() => exportBookmarksToFile("txt")}
                >
                  <span>📥</span> Export Bookmarks (TXT)
                </button>
                <button
                  type="button"
                  id="exportBookmarksJsonBtn"
                  className="primary-btn-outline"
                  style={{ padding: "10px 18px" }}
                  onClick={() => exportBookmarksToFile("json")}
                >
                  <span>💾</span> Export (JSON)
                </button>
                <button
                  type="button"
                  id="shareBookmarksBtn"
                  className="primary-btn-outline"
                  style={{ padding: "10px 18px" }}
                  onClick={() =>
                    openShare(
                      "My FreshFind Bookmarks",
                      `I've saved ${savedMarkets.length} markets and ${savedProduce.length} produce items on FreshFind!`,
                      window.location.href
                    )
                  }
                >
                  <span>🔗</span> Share List
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SAVED MARKETS SECTION */}
        <section style={{ padding: "40px 0" }}>
          <div className="container">
            <div className="bookmark-section-header">
              <div>
                <span className="section-kicker">SAVED PLACES</span>
                <h2
                  style={{
                    fontSize: "24px",
                    color: "#173d2b",
                    fontWeight: 800,
                    margin: "4px 0 0"
                  }}
                >
                  Saved Farmers Markets
                </h2>
              </div>
              <span
                id="savedMarketsCount"
                style={{
                  background: "#e5eadc",
                  color: "#2d6547",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700
                }}
              >
                {savedMarkets.length} saved
              </span>
            </div>

            {savedMarkets.length === 0 ? (
              <div
                id="emptyMarketsState"
                style={{
                  background: "#ffffff",
                  border: "1px dashed #cfd9cb",
                  borderRadius: "16px",
                  padding: "50px 20px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px"
                }}
              >
                <div style={{ fontSize: "40px" }}>🏪</div>
                <h3
                  style={{
                    fontSize: "20px",
                    color: "#173d2b",
                    fontWeight: 800,
                    margin: 0
                  }}
                >
                  No Saved Markets Yet
                </h3>
                <p style={{ color: "#6a7c6f", fontSize: "14px", maxWidth: "360px", margin: 0 }}>
                  Tap the heart icon (♡) on any market card in the Directory to save it here.
                </p>
                <Link to="/markets" className="primary-btn" style={{ marginTop: "6px" }}>
                  Explore Market Directory →
                </Link>
              </div>
            ) : (
              <div id="savedMarketsList">
                {savedMarkets.map((item) => {
                  const id = typeof item === "object" ? String(item.id) : String(item);
                  const m =
                    marketsData[id] ||
                    (typeof item === "object"
                      ? item
                      : { id, name: `Market #${id}`, area: "Local Area", image: "images/markets/market-1.jpg" });

                  const note = getNote("market", id);
                  const status = isMarketOpen(m);
                  const daysStr = Array.isArray(m.operatingDays)
                    ? m.operatingDays.join(", ")
                    : m.day || "Weekly";

                  const isCurrentlyEditing =
                    editingNote &&
                    editingNote.type === "market" &&
                    editingNote.id === id;

                  return (
                    <div key={id} className="bookmark-item-card" data-id={id}>
                      <div className="bookmark-card-left">
                        <div
                          className="bookmark-thumbnail"
                          style={{
                            backgroundImage: `url('${getAssetUrl(m.image)}')`
                          }}
                        />
                        <div className="bookmark-info">
                          <div className="bookmark-meta-row">
                            <span className="bookmark-area">
                              {m.area} {m.neighborhood ? `• ${m.neighborhood}` : ""}
                            </span>
                            <span className={`status-pill status-${status.code}`}>
                              {status.status}
                            </span>
                          </div>
                          <h3>{m.name}</h3>
                          <p className="bookmark-timing">
                            📅 {daysStr} • 🕘 {m.operatingHours || m.time || "See details"}
                          </p>

                          {/* Session Note Display Area */}
                          <div
                            className={`session-note-box ${
                              note ? "has-note" : "no-note"
                            }`}
                          >
                            <div className="note-header">
                              <span className="note-label">📝 Session Note (Temporary):</span>
                              <div className="note-actions">
                                <button
                                  type="button"
                                  className="note-action-btn edit-note-btn"
                                  onClick={() => startEditNote("market", id)}
                                >
                                  {note ? "Edit Note" : "+ Add Note"}
                                </button>
                                {note && (
                                  <button
                                    type="button"
                                    className="note-action-btn delete-note-btn"
                                    onClick={() => deleteNote("market", id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>

                            {isCurrentlyEditing ? (
                              <form
                                onSubmit={handleSaveNoteSubmit}
                                style={{ marginTop: "8px" }}
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingNote.text}
                                  placeholder="e.g. Buy 2kg heirloom tomatoes..."
                                  onChange={(e) =>
                                    setEditingNote((prev) => ({
                                      ...prev,
                                      text: e.target.value
                                    }))
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #2d6547",
                                    borderRadius: "6px",
                                    fontSize: "13px"
                                  }}
                                />
                                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                                  <button
                                    type="submit"
                                    className="primary-btn small"
                                    style={{ padding: "4px 10px", fontSize: "12px" }}
                                  >
                                    Save Note
                                  </button>
                                  <button
                                    type="button"
                                    className="primary-btn-outline small"
                                    style={{ padding: "4px 10px", fontSize: "12px" }}
                                    onClick={cancelEditNote}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <p className="note-text">
                                {note ? `"${note}"` : "No session note added yet."}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bookmark-card-actions">
                        <Link
                          to={`/markets/${id}`}
                          className="primary-btn-outline small"
                        >
                          View Details
                        </Link>
                        <button
                          type="button"
                          className="remove-bookmark-btn"
                          title="Remove Bookmark"
                          onClick={() => removeMarketBookmark(id)}
                        >
                          Remove ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SAVED PRODUCE SECTION */}
        <section style={{ padding: "20px 0 60px" }}>
          <div className="container">
            <div className="bookmark-section-header">
              <div>
                <span className="section-kicker">SAVED ITEMS</span>
                <h2
                  style={{
                    fontSize: "24px",
                    color: "#173d2b",
                    fontWeight: 800,
                    margin: "4px 0 0"
                  }}
                >
                  Saved Fresh Produce
                </h2>
              </div>
              <span
                id="savedProduceCount"
                style={{
                  background: "#e5eadc",
                  color: "#2d6547",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700
                }}
              >
                {savedProduce.length} saved
              </span>
            </div>

            {savedProduce.length === 0 ? (
              <div
                id="emptyProduceState"
                style={{
                  background: "#ffffff",
                  border: "1px dashed #cfd9cb",
                  borderRadius: "16px",
                  padding: "50px 20px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px"
                }}
              >
                <div style={{ fontSize: "40px" }}>🍎</div>
                <h3
                  style={{
                    fontSize: "20px",
                    color: "#173d2b",
                    fontWeight: 800,
                    margin: 0
                  }}
                >
                  No Saved Produce Yet
                </h3>
                <p style={{ color: "#6a7c6f", fontSize: "14px", maxWidth: "360px", margin: 0 }}>
                  Save your favorite fruits, herbs, and vegetables directly from the Produce Guide.
                </p>
                <Link to="/produce" className="primary-btn" style={{ marginTop: "6px" }}>
                  Explore Produce Guide →
                </Link>
              </div>
            ) : (
              <div id="savedProduceList">
                {savedProduce.map((item) => {
                  const id = typeof item === "object" ? String(item.id) : String(item);
                  const p =
                    produceData.find((prod) => prod.id === id) ||
                    (typeof item === "object"
                      ? item
                      : {
                          id,
                          name: id.charAt(0).toUpperCase() + id.slice(1),
                          category: "Produce",
                          season: "All Seasons",
                          image: "🌱"
                        });

                  const note = getNote("produce", id);
                  const marketsCount = Array.isArray(p.marketIds) ? p.marketIds.length : 0;

                  const isCurrentlyEditing =
                    editingNote &&
                    editingNote.type === "produce" &&
                    editingNote.id === id;

                  return (
                    <div key={id} className="bookmark-item-card" data-id={id}>
                      <div className="bookmark-card-left">
                        <div className="bookmark-thumbnail produce-thumb">
                          <span className="produce-thumb-emoji">{p.image || "🌱"}</span>
                        </div>
                        <div className="bookmark-info">
                          <div className="bookmark-meta-row">
                            <span className="bookmark-area">
                              {p.category} • {p.season}
                            </span>
                            <span className="status-pill open">
                              Available at {marketsCount} {marketsCount === 1 ? "market" : "markets"}
                            </span>
                          </div>
                          <h3>{p.name}</h3>
                          <p className="bookmark-timing">
                            {p.shortDescription || p.description || "Fresh local harvest"}
                          </p>

                          {/* Session Note Display Area */}
                          <div
                            className={`session-note-box ${
                              note ? "has-note" : "no-note"
                            }`}
                          >
                            <div className="note-header">
                              <span className="note-label">📝 Session Note (Temporary):</span>
                              <div className="note-actions">
                                <button
                                  type="button"
                                  className="note-action-btn edit-note-btn"
                                  onClick={() => startEditNote("produce", id)}
                                >
                                  {note ? "Edit Note" : "+ Add Note"}
                                </button>
                                {note && (
                                  <button
                                    type="button"
                                    className="note-action-btn delete-note-btn"
                                    onClick={() => deleteNote("produce", id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>

                            {isCurrentlyEditing ? (
                              <form
                                onSubmit={handleSaveNoteSubmit}
                                style={{ marginTop: "8px" }}
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingNote.text}
                                  placeholder="e.g. Check for organic strawberries..."
                                  onChange={(e) =>
                                    setEditingNote((prev) => ({
                                      ...prev,
                                      text: e.target.value
                                    }))
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #2d6547",
                                    borderRadius: "6px",
                                    fontSize: "13px"
                                  }}
                                />
                                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                                  <button
                                    type="submit"
                                    className="primary-btn small"
                                    style={{ padding: "4px 10px", fontSize: "12px" }}
                                  >
                                    Save Note
                                  </button>
                                  <button
                                    type="button"
                                    className="primary-btn-outline small"
                                    style={{ padding: "4px 10px", fontSize: "12px" }}
                                    onClick={cancelEditNote}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <p className="note-text">
                                {note ? `"${note}"` : "No session note added yet."}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bookmark-card-actions">
                        <button
                          type="button"
                          className="primary-btn-outline small"
                          onClick={() => openProduceModal(p)}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          className="remove-bookmark-btn"
                          title="Remove Bookmark"
                          onClick={() => removeProduceBookmark(id)}
                        >
                          Remove ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SESSION NOTES INFO BANNER */}
        <section style={{ paddingBottom: "60px" }}>
          <div className="container">
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e1dcce",
                borderRadius: "16px",
                padding: "24px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    fontSize: "28px",
                    background: "#eef5eb",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  📝
                </div>
                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "15px",
                      color: "#173d2b"
                    }}
                  >
                    About Session Notes (Client-Side Memory)
                  </strong>
                  <p style={{ color: "#617568", fontSize: "13px", margin: "2px 0 0" }}>
                    Notes added to saved markets or produce are stored in temporary browser session memory. No private data is ever sent to a server.
                  </p>
                </div>
              </div>
              <Link to="/markets" className="primary-btn-outline" style={{ whiteSpace: "nowrap" }}>
                Discover More Markets
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
