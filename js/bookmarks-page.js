/**
 * FreshFind - Bookmarks Page Controller
 * Renders Saved Markets and Saved Produce from localStorage.
 * Manages Session-Only Notes (stored in sessionStorage).
 * Handles note adding, editing, deleting, bookmark removal, and export.
 */

(function (window) {
  "use strict";

  const FreshFind = window.FreshFind || (window.FreshFind = {});

  let allMarketsMap = {};
  let allProduceMap = {};

  async function initBookmarksPage() {
    const page = document.querySelector(".bookmarks-page-wrapper, .bookmarks-page");
    if (!page && !document.getElementById("savedMarketsList")) return;

    try {
      const [mRes, pRes] = await Promise.all([
        fetch("data/markets.json"),
        fetch("data/produce.json")
      ]);
      const mData = await mRes.json();
      allMarketsMap = mData;

      const pData = await pRes.json();
      pData.forEach((p) => {
        allProduceMap[p.id] = p;
      });

      renderSavedMarkets();
      renderSavedProduce();
      bindExportAndShare();
    } catch (e) {
      console.error("Failed to load bookmark reference data:", e);
      renderSavedMarkets();
      renderSavedProduce();
    }
  }

  function renderSavedMarkets() {
    const container = document.getElementById("savedMarketsList");
    const countBadge = document.getElementById("savedMarketsCount");
    const emptyState = document.getElementById("emptyMarketsState");
    if (!container) return;

    const saved = FreshFind.getBookmarks ? FreshFind.getBookmarks("market") : [];
    if (countBadge) countBadge.textContent = `${saved.length} saved`;

    container.innerHTML = "";

    if (saved.length === 0) {
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    saved.forEach((item) => {
      const id = typeof item === "object" ? String(item.id) : String(item);
      const m = allMarketsMap[id] || (typeof item === "object" ? item : { id, name: `Market #${id}`, area: "Local Area", image: "images/markets/market-1.jpg" });

      const note = FreshFind.getNote ? FreshFind.getNote("market", id) : "";
      const status = FreshFind.isMarketOpen ? FreshFind.isMarketOpen(m) : { status: "CHECK SCHEDULE", code: "open" };

      const card = document.createElement("div");
      card.className = "bookmark-item-card";
      card.dataset.id = id;
      card.innerHTML = `
        <div class="bookmark-card-left">
          <div class="bookmark-thumbnail" style="background-image: url('${m.image}');"></div>
          <div class="bookmark-info">
            <div class="bookmark-meta-row">
              <span class="bookmark-area">${m.area} ${m.neighborhood ? `• ${m.neighborhood}` : ""}</span>
              <span class="status-pill status-${status.code}">${status.status}</span>
            </div>
            <h3>${m.name}</h3>
            <p class="bookmark-timing">📅 ${Array.isArray(m.operatingDays) ? m.operatingDays.join(", ") : (m.day || "Weekly")} • 🕘 ${m.operatingHours || m.time || "See details"}</p>
            
            <!-- Session Note Display Area -->
            <div class="session-note-box ${note ? "has-note" : "no-note"}" id="noteBox_market_${id}">
              <div class="note-header">
                <span class="note-label">📝 Session Note (Temporary):</span>
                <div class="note-actions">
                  <button class="note-action-btn edit-note-btn" data-type="market" data-id="${id}">${note ? "Edit Note" : "+ Add Note"}</button>
                  ${note ? `<button class="note-action-btn delete-note-btn" data-type="market" data-id="${id}">Delete</button>` : ""}
                </div>
              </div>
              <p class="note-text" id="noteText_market_${id}">${note ? `"${note}"` : "No session note added yet."}</p>
            </div>
          </div>
        </div>

        <div class="bookmark-card-actions">
          <a href="market-details.html?id=${id}" class="primary-btn-outline small">View Details</a>
          <button class="remove-bookmark-btn" data-type="market" data-id="${id}" title="Remove Bookmark">
            Remove ✕
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    bindNoteButtons(container);
  }

  function renderSavedProduce() {
    const container = document.getElementById("savedProduceList");
    const countBadge = document.getElementById("savedProduceCount");
    const emptyState = document.getElementById("emptyProduceState");
    if (!container) return;

    const saved = FreshFind.getBookmarks ? FreshFind.getBookmarks("produce") : [];
    if (countBadge) countBadge.textContent = `${saved.length} saved`;

    container.innerHTML = "";

    if (saved.length === 0) {
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    saved.forEach((item) => {
      const id = typeof item === "object" ? String(item.id) : String(item);
      const p = allProduceMap[id] || (typeof item === "object" ? item : { id, name: id.charAt(0).toUpperCase() + id.slice(1), category: "Produce", season: "All Seasons", image: "🌱" });

      const note = FreshFind.getNote ? FreshFind.getNote("produce", id) : "";
      const marketsCount = Array.isArray(p.marketIds) ? p.marketIds.length : 0;

      const card = document.createElement("div");
      card.className = "bookmark-item-card";
      card.dataset.id = id;
      card.innerHTML = `
        <div class="bookmark-card-left">
          <div class="bookmark-thumbnail produce-thumb">
            <span class="produce-thumb-emoji">${p.image || "🌱"}</span>
          </div>
          <div class="bookmark-info">
            <div class="bookmark-meta-row">
              <span class="bookmark-area">${p.category} • ${p.season}</span>
              <span class="status-pill open">Available at ${marketsCount} ${marketsCount === 1 ? "market" : "markets"}</span>
            </div>
            <h3>${p.name}</h3>
            <p class="bookmark-timing">${p.shortDescription || p.description || "Fresh local harvest"}</p>
            
            <!-- Session Note Display Area -->
            <div class="session-note-box ${note ? "has-note" : "no-note"}" id="noteBox_produce_${id}">
              <div class="note-header">
                <span class="note-label">📝 Session Note (Temporary):</span>
                <div class="note-actions">
                  <button class="note-action-btn edit-note-btn" data-type="produce" data-id="${id}">${note ? "Edit Note" : "+ Add Note"}</button>
                  ${note ? `<button class="note-action-btn delete-note-btn" data-type="produce" data-id="${id}">Delete</button>` : ""}
                </div>
              </div>
              <p class="note-text" id="noteText_produce_${id}">${note ? `"${note}"` : "No session note added yet."}</p>
            </div>
          </div>
        </div>

        <div class="bookmark-card-actions">
          <a href="produce.html?highlight=${id}" class="primary-btn-outline small">View in Guide</a>
          <button class="remove-bookmark-btn" data-type="produce" data-id="${id}" title="Remove Bookmark">
            Remove ✕
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    bindNoteButtons(container);
  }

  function bindNoteButtons(container) {
    // Note edit / add
    container.querySelectorAll(".edit-note-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        const id = btn.dataset.id;
        const currentNote = FreshFind.getNote ? FreshFind.getNote(type, id) : "";
        const newNote = prompt(`Enter session note for this ${type} (stored in temporary browser memory):`, currentNote);

        if (newNote !== null) {
          if (FreshFind.saveNote) {
            FreshFind.saveNote(type, id, newNote);
            if (type === "market") renderSavedMarkets();
            else renderSavedProduce();
            if (FreshFind.showToast) {
              FreshFind.showToast(newNote ? "Session note updated!" : "Session note cleared.", "info");
            }
          }
        }
      });
    });

    // Note delete
    container.querySelectorAll(".delete-note-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        const id = btn.dataset.id;
        if (confirm("Delete this temporary session note?")) {
          if (FreshFind.deleteNote) {
            FreshFind.deleteNote(type, id);
            if (type === "market") renderSavedMarkets();
            else renderSavedProduce();
            if (FreshFind.showToast) FreshFind.showToast("Session note deleted.", "info");
          }
        }
      });
    });

    // Remove bookmark
    container.querySelectorAll(".remove-bookmark-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        const id = btn.dataset.id;
        if (FreshFind.removeBookmark) {
          FreshFind.removeBookmark(type, id);
          if (type === "market") renderSavedMarkets();
          else renderSavedProduce();
          if (FreshFind.updateBookmarkBadges) FreshFind.updateBookmarkBadges();
          if (FreshFind.showToast) FreshFind.showToast("Removed from bookmarks.", "info");
        }
      });
    });
  }

  function bindExportAndShare() {
    const exportBtn = document.getElementById("exportBookmarksBtn");
    const exportJsonBtn = document.getElementById("exportBookmarksJsonBtn");
    const shareBtn = document.getElementById("shareBookmarksBtn");

    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        if (FreshFind.exportBookmarksToFile) {
          FreshFind.exportBookmarksToFile("txt");
        }
      });
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener("click", () => {
        if (FreshFind.exportBookmarksToFile) {
          FreshFind.exportBookmarksToFile("json");
        }
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        if (FreshFind.shareContent) {
          FreshFind.shareContent(
            "My FreshFind Bookmarks",
            "Here are my favorite farmers markets and fresh seasonal produce on FreshFind!",
            window.location.href
          );
        }
      });
    }
  }

  FreshFind.initBookmarksPage = initBookmarksPage;

  document.addEventListener("DOMContentLoaded", initBookmarksPage);

})(window);
