/**
 * FreshFind - Produce Guide Controller
 * Manages produce catalogue loading, category & text search filtering,
 * seasonal picks recommendations, bookmark toggling, and Produce Detail Modal
 * with direct clickable links to all available farmers markets.
 */

(function (window) {
  "use strict";

  const FreshFind = window.FreshFind || (window.FreshFind = {});

  let allProduce = [];
  let allMarkets = {};

  async function initProduceGuide() {
    const produceGrid = document.getElementById("produceGrid");
    if (!produceGrid) return;

    try {
      const [pRes, mRes] = await Promise.all([
        fetch("data/produce.json"),
        fetch("data/markets.json")
      ]);
      allProduce = await pRes.json();
      allMarkets = await mRes.json();

      setupSeasonalBanner();
      bindFilterEvents();
      renderProduceCards(allProduce);
      checkUrlParams();
    } catch (e) {
      console.error("Error loading produce catalogue:", e);
      produceGrid.innerHTML = `
        <div class="error-state">
          <p>Unable to load produce catalogue. Please refresh or try again later.</p>
        </div>
      `;
    }
  }

  function setupSeasonalBanner() {
    const banner = document.getElementById("seasonalRecommendationBanner");
    if (!banner) return;

    const season = FreshFind.getCurrentSeason ? FreshFind.getCurrentSeason() : { name: "Summer", icon: "☀️", color: "#d77a3e", description: "Fresh summer harvest" };

    const seasonalItems = allProduce.filter(
      (p) => p.season.toLowerCase() === season.name.toLowerCase() || p.season.toLowerCase() === "all seasons"
    );

    banner.innerHTML = `
      <div class="seasonal-banner-inner" style="border-left: 5px solid ${season.color};">
        <div class="season-badge-pill">
          <span class="season-icon">${season.icon}</span>
          <strong>CURRENT SEASON: ${season.name.toUpperCase()}</strong>
        </div>
        <p class="season-desc">${season.description}. Locally harvested at peak sweetness right now.</p>
        <div class="season-quick-tags">
          ${seasonalItems.map((p) => `<span class="season-item-tag" data-id="${p.id}">${p.image || "🌱"} ${p.name}</span>`).join("")}
        </div>
      </div>
    `;

    banner.querySelectorAll(".season-item-tag").forEach((tag) => {
      tag.addEventListener("click", () => {
        const id = tag.dataset.id;
        const pObj = allProduce.find((p) => p.id === id);
        if (pObj) openProduceModal(pObj);
      });
    });
  }

  function bindFilterEvents() {
    const searchInput = document.getElementById("produceSearch");
    const searchBtn = document.getElementById("produceSearchBtn");
    const filterButtons = document.querySelectorAll(".produce-category-btn, .filter-btn");

    if (searchInput) {
      searchInput.addEventListener("input", debounce(filterProduce, 250));
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") filterProduce();
      });
    }

    if (searchBtn) searchBtn.addEventListener("click", filterProduce);

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        filterProduce();
      });
    });
  }

  function filterProduce() {
    const searchVal = (document.getElementById("produceSearch")?.value || "").toLowerCase().trim();
    const activeBtn = document.querySelector(".produce-category-btn.active, .filter-btn.active");
    const category = activeBtn ? (activeBtn.dataset.filter || activeBtn.dataset.category || "all").toLowerCase() : "all";

    const filtered = allProduce.filter((p) => {
      // Category match
      if (category !== "all") {
        if (p.category.toLowerCase() !== category && !p.category.toLowerCase().includes(category)) {
          return false;
        }
      }

      // Search match (name, description, category, season)
      if (searchVal) {
        const nameMatch = p.name.toLowerCase().includes(searchVal);
        const descMatch = (p.description || "").toLowerCase().includes(searchVal) || (p.shortDescription || "").toLowerCase().includes(searchVal);
        const catMatch = p.category.toLowerCase().includes(searchVal);
        const seasonMatch = p.season.toLowerCase().includes(searchVal);

        if (!nameMatch && !descMatch && !catMatch && !seasonMatch) {
          return false;
        }
      }

      return true;
    });

    renderProduceCards(filtered);
  }

  function renderProduceCards(items) {
    const grid = document.getElementById("produceGrid");
    const emptyState = document.getElementById("noProduceFound");
    const countEl = document.getElementById("produceCount");

    if (!grid) return;
    grid.innerHTML = "";

    if (countEl) {
      countEl.textContent = `${items.length} ${items.length === 1 ? "Item" : "Items"}`;
    }

    if (items.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    items.forEach((p) => {
      const card = createProduceCard(p);
      grid.appendChild(card);
    });
  }

  function createProduceCard(p) {
    const card = document.createElement("div");
    card.className = "produce-card";
    card.dataset.id = p.id;
    card.dataset.category = p.category.toLowerCase();

    const bookmarked = FreshFind.isBookmarked ? FreshFind.isBookmarked("produce", p.id) : false;
    const marketsCount = Array.isArray(p.marketIds) ? p.marketIds.length : 0;

    card.innerHTML = `
      <div class="produce-card-header">
        <span class="produce-emoji-large">${p.image || "🌱"}</span>
        <button class="produce-bookmark-btn ${bookmarked ? "bookmarked" : ""}" aria-label="Bookmark ${p.name}">
          ${bookmarked ? "♥" : "♡"}
        </button>
      </div>

      <div class="produce-card-content">
        <div class="produce-pill-row">
          <span class="produce-pill-category">${p.category}</span>
          <span class="produce-pill-season">${p.season}</span>
        </div>

        <h3 class="produce-title">${p.name}</h3>

        <p class="produce-desc">${p.shortDescription || p.description}</p>

        <div class="produce-market-count">
          <span>📍 Available at <strong>${marketsCount}</strong> ${marketsCount === 1 ? "market" : "markets"}</span>
        </div>

        <button class="view-produce-detail-btn primary-btn">
          View Details <span>→</span>
        </button>
      </div>
    `;

    // Bookmark Toggle
    const bBtn = card.querySelector(".produce-bookmark-btn");
    bBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (FreshFind.toggleBookmark) {
        const isSaved = FreshFind.toggleBookmark("produce", p);
        bBtn.classList.toggle("bookmarked", isSaved);
        bBtn.innerHTML = isSaved ? "♥" : "♡";
      }
    });

    // View Details Click
    card.querySelector(".view-produce-detail-btn").addEventListener("click", () => {
      openProduceModal(p);
    });

    return card;
  }

  function openProduceModal(p) {
    let modal = document.getElementById("produceDetailModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "produceDetailModal";
      modal.className = "modal-overlay";
      modal.innerHTML = `
        <div class="produce-modal-box modal-box">
          <button class="modal-close" id="closeProduceModal" aria-label="Close modal">&times;</button>
          
          <div class="produce-modal-breadcrumb">
            <a href="index.html">Home</a> <span>›</span> <a href="produce.html">Produce Guide</a> <span>›</span> <strong id="modalBreadcrumbName">${p.name}</strong>
          </div>

          <div class="produce-modal-header">
            <div class="produce-modal-avatar" id="modalProduceAvatar">🍅</div>
            <div class="produce-modal-header-info">
              <div class="produce-pill-row">
                <span class="produce-pill-category" id="modalCategory">Vegetables</span>
                <span class="produce-pill-season" id="modalSeason">Summer</span>
              </div>
              <h2 id="modalProduceName">${p.name}</h2>
              <div class="modal-actions-bar">
                <button class="primary-btn-outline" id="modalBookmarkBtn">
                  <span>♡</span> Bookmark
                </button>
                <button class="primary-btn-outline" id="modalShareBtn">
                  <span>🔗</span> Share
                </button>
              </div>
            </div>
          </div>

          <div class="produce-modal-body">
            <div class="produce-modal-section">
              <h4>Description & Harvest Notes</h4>
              <p id="modalDescription"></p>
            </div>

            <div class="produce-modal-section">
              <h4>Nutritional Highlights</h4>
              <p id="modalNutrition" class="nutrition-highlight-text"></p>
            </div>

            <div class="produce-modal-section">
              <h4>Available At These Local Markets</h4>
              <p class="modal-market-sub">Click any market to view its weekly schedule and map location:</p>
              <div class="modal-markets-list" id="modalMarketsList"></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector("#closeProduceModal").addEventListener("click", () => {
        modal.classList.remove("open");
        document.body.style.overflow = "";
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("open");
          document.body.style.overflow = "";
        }
      });
    }

    // Populate Modal Fields
    modal.querySelector("#modalBreadcrumbName").textContent = p.name;
    modal.querySelector("#modalProduceAvatar").textContent = p.image || "🌱";
    modal.querySelector("#modalCategory").textContent = p.category;
    modal.querySelector("#modalSeason").textContent = p.season;
    modal.querySelector("#modalProduceName").textContent = p.name;
    modal.querySelector("#modalDescription").textContent = p.description || p.shortDescription || "";
    modal.querySelector("#modalNutrition").textContent = p.nutrition || "100% natural, farm-fresh produce rich in essential vitamins and fiber.";

    // Render Clickable Available Markets
    const marketsList = modal.querySelector("#modalMarketsList");
    marketsList.innerHTML = "";

    const marketIds = Array.isArray(p.marketIds) ? p.marketIds : [];
    if (marketIds.length === 0) {
      marketsList.innerHTML = `<p class="no-market-found">Check market schedule for weekly arrival announcements.</p>`;
    } else {
      marketIds.forEach((mId) => {
        const m = allMarkets[mId];
        if (!m) return;

        const status = FreshFind.isMarketOpen ? FreshFind.isMarketOpen(m) : { status: "VIEW SCHEDULE", code: "open" };

        const item = document.createElement("a");
        item.href = `market-details.html?id=${m.id}`;
        item.className = "modal-market-item";
        item.innerHTML = `
          <div class="modal-market-avatar" style="background-image: url('${m.image}');"></div>
          <div class="modal-market-info">
            <strong>${m.name}</strong>
            <small>${m.area} ${m.neighborhood ? `• ${m.neighborhood}` : ""}</small>
            <span class="modal-market-status status-${status.code}">${status.status}</span>
          </div>
          <span class="modal-market-arrow">→</span>
        `;
        marketsList.appendChild(item);
      });
    }

    // Modal Bookmark Button State
    const bBtn = modal.querySelector("#modalBookmarkBtn");
    const updateModalBookmark = () => {
      const isSaved = FreshFind.isBookmarked ? FreshFind.isBookmarked("produce", p.id) : false;
      bBtn.innerHTML = isSaved ? `<span>♥</span> Bookmarked` : `<span>♡</span> Bookmark`;
      bBtn.classList.toggle("active", isSaved);
    };
    updateModalBookmark();

    // Replace click listener
    const newBBtn = bBtn.cloneNode(true);
    bBtn.parentNode.replaceChild(newBBtn, bBtn);
    newBBtn.addEventListener("click", () => {
      if (FreshFind.toggleBookmark) {
        FreshFind.toggleBookmark("produce", p);
        const isSaved = FreshFind.isBookmarked("produce", p.id);
        newBBtn.innerHTML = isSaved ? `<span>♥</span> Bookmarked` : `<span>♡</span> Bookmark`;
        newBBtn.classList.toggle("active", isSaved);

        // Update card in grid if visible
        const cardBtn = document.querySelector(`.produce-card[data-id="${p.id}"] .produce-bookmark-btn`);
        if (cardBtn) {
          cardBtn.classList.toggle("bookmarked", isSaved);
          cardBtn.innerHTML = isSaved ? "♥" : "♡";
        }
      }
    });

    // Share button
    const shareBtn = modal.querySelector("#modalShareBtn");
    const newShareBtn = shareBtn.cloneNode(true);
    shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
    newShareBtn.addEventListener("click", () => {
      if (FreshFind.shareContent) {
        FreshFind.shareContent(
          `${p.name} - FreshFind Produce Guide`,
          `Check out fresh seasonal ${p.name} on FreshFind!`,
          `${window.location.origin}${window.location.pathname}?highlight=${p.id}`
        );
      }
    });

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const highlightId = params.get("highlight");
    const category = params.get("category");

    if (category) {
      const btn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
      if (btn) btn.click();
    }

    if (highlightId) {
      const target = allProduce.find((p) => p.id === highlightId);
      if (target) {
        setTimeout(() => openProduceModal(target), 300);
      }
    }
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  FreshFind.initProduceGuide = initProduceGuide;
  FreshFind.openProduceModal = openProduceModal;

  document.addEventListener("DOMContentLoaded", initProduceGuide);

})(window);
