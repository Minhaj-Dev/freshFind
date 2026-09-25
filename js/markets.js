/**
 * FreshFind - Market Directory & Filtering Engine
 * Manages loading markets, geolocation, filtering (search, area, day, produce),
 * sorting (A-Z, Z-A, Nearest, Next Open), card rendering, and bookmark toggling.
 */

(function (window) {
  "use strict";

  const FreshFind = window.FreshFind || (window.FreshFind = {});

  let allMarkets = [];
  let allProduce = [];
  let userCoords = null; // { lat, lon }

  async function initMarketDirectory() {
    const directoryContainer = document.getElementById("marketDirectory");
    if (!directoryContainer) return;

    try {
      const [mRes, pRes] = await Promise.all([
        fetch("data/markets.json"),
        fetch("data/produce.json")
      ]);
      const mData = await mRes.json();
      allMarkets = Object.values(mData);
      allProduce = await pRes.json();

      populateProduceDropdown();
      populateAreaDropdown();
      bindDirectoryControls();
      checkURLParams();
      applyFiltersAndRender();
    } catch (e) {
      console.error("Failed to load directory data:", e);
      directoryContainer.innerHTML = `
        <div class="error-state">
          <p>Unable to load markets at this time. Please check back shortly.</p>
        </div>
      `;
    }
  }

  function populateProduceDropdown() {
    const produceSelect = document.getElementById("produceFilter");
    if (!produceSelect || !allProduce.length) return;

    // Keep "All Produce"
    produceSelect.innerHTML = `<option value="all">All Produce</option>`;
    allProduce.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.image || "🌱"} ${p.name}`;
      produceSelect.appendChild(opt);
    });
  }

  function populateAreaDropdown() {
    const areaSelect = document.getElementById("areaFilter");
    if (!areaSelect) return;

    const areas = Array.from(new Set(allMarkets.map((m) => m.area))).filter(Boolean).sort();
    areaSelect.innerHTML = `<option value="all">All Areas</option>`;
    areas.forEach((area) => {
      const opt = document.createElement("option");
      opt.value = area;
      opt.textContent = area;
      areaSelect.appendChild(opt);
    });
  }

  function bindDirectoryControls() {
    const searchInput = document.getElementById("marketSearch");
    const searchBtn = document.getElementById("marketSearchBtn");
    const areaFilter = document.getElementById("areaFilter");
    const dayFilter = document.getElementById("dayFilter");
    const produceFilter = document.getElementById("produceFilter");
    const sortSelect = document.getElementById("sortMarkets");
    const clearBtn = document.getElementById("clearFiltersBtn");
    const locationBtn = document.getElementById("useLocationBtn");

    if (searchInput) {
      searchInput.addEventListener("input", debounce(applyFiltersAndRender, 250));
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") applyFiltersAndRender();
      });
    }

    if (searchBtn) searchBtn.addEventListener("click", applyFiltersAndRender);
    if (areaFilter) areaFilter.addEventListener("change", applyFiltersAndRender);
    if (dayFilter) dayFilter.addEventListener("change", applyFiltersAndRender);
    if (produceFilter) produceFilter.addEventListener("change", applyFiltersAndRender);
    if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndRender);

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (areaFilter) areaFilter.value = "all";
        if (dayFilter) dayFilter.value = "all";
        if (produceFilter) produceFilter.value = "all";
        if (sortSelect) sortSelect.value = "default";
        applyFiltersAndRender();
      });
    }

    if (locationBtn) {
      locationBtn.addEventListener("click", handleGeolocation);
    }
  }

  function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const searchVal = params.get("search");
    const areaVal = params.get("area");
    const dayVal = params.get("day");
    const produceVal = params.get("produce");

    if (searchVal && document.getElementById("marketSearch")) {
      document.getElementById("marketSearch").value = searchVal;
    }
    if (areaVal && document.getElementById("areaFilter")) {
      document.getElementById("areaFilter").value = areaVal;
    }
    if (dayVal && document.getElementById("dayFilter")) {
      document.getElementById("dayFilter").value = dayVal;
    }
    if (produceVal && document.getElementById("produceFilter")) {
      document.getElementById("produceFilter").value = produceVal;
    }
  }

  function handleGeolocation() {
    const locationBtn = document.getElementById("useLocationBtn");
    const statusText = document.getElementById("locationStatusText");

    if (!navigator.geolocation) {
      const msg = "Location is not supported by your browser.";
      if (statusText) statusText.textContent = msg;
      if (FreshFind.showToast) FreshFind.showToast(msg, "warning");
      return;
    }

    if (locationBtn) locationBtn.classList.add("loading");
    if (statusText) statusText.textContent = "Detecting nearby coordinates...";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };

        if (locationBtn) {
          locationBtn.classList.remove("loading");
          locationBtn.classList.add("active");
          locationBtn.innerHTML = `<span>✓</span> Location Active`;
        }

        if (statusText) {
          statusText.textContent = `Location active (${userCoords.lat.toFixed(2)}, ${userCoords.lon.toFixed(2)})`;
        }

        const sortSelect = document.getElementById("sortMarkets");
        if (sortSelect) {
          sortSelect.value = "nearest";
        }

        if (FreshFind.showToast) {
          FreshFind.showToast("Location detected! Sorted by nearest markets.", "success");
        }

        applyFiltersAndRender();
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        if (locationBtn) locationBtn.classList.remove("loading");
        const msg = "Location access is required for distance-based features.";
        if (statusText) statusText.textContent = msg;
        if (FreshFind.showToast) FreshFind.showToast(msg, "info");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }

  function applyFiltersAndRender() {
    const searchVal = (document.getElementById("marketSearch")?.value || "").toLowerCase().trim();
    const areaVal = document.getElementById("areaFilter")?.value || "all";
    const dayVal = document.getElementById("dayFilter")?.value || "all";
    const produceVal = document.getElementById("produceFilter")?.value || "all";
    const sortVal = document.getElementById("sortMarkets")?.value || "default";

    let filtered = allMarkets.filter((m) => {
      // 1. Search Query (name, area, neighborhood, description, produce)
      if (searchVal) {
        const nameMatch = m.name?.toLowerCase().includes(searchVal);
        const areaMatch = m.area?.toLowerCase().includes(searchVal);
        const neighMatch = m.neighborhood?.toLowerCase().includes(searchVal);
        const descMatch = m.description?.toLowerCase().includes(searchVal);
        const prodMatch = Array.isArray(m.produceIds) && m.produceIds.some((pId) => {
          const produceObj = allProduce.find((p) => p.id === pId);
          return (
            pId.toLowerCase().includes(searchVal) ||
            (produceObj && produceObj.name.toLowerCase().includes(searchVal))
          );
        });

        if (!nameMatch && !areaMatch && !neighMatch && !descMatch && !prodMatch) {
          return false;
        }
      }

      // 2. Area Filter
      if (areaVal !== "all" && m.area?.toLowerCase() !== areaVal.toLowerCase()) {
        return false;
      }

      // 3. Day Filter
      if (dayVal !== "all") {
        const inOperatingDays = Array.isArray(m.operatingDays) &&
          m.operatingDays.some((d) => d.toLowerCase() === dayVal.toLowerCase());
        const inSchedule = Array.isArray(m.schedule) &&
          m.schedule.some((s) => s.day?.toLowerCase() === dayVal.toLowerCase() && s.isOpen);
        if (!inOperatingDays && !inSchedule) {
          return false;
        }
      }

      // 4. Produce Filter
      if (produceVal !== "all") {
        if (!Array.isArray(m.produceIds) || !m.produceIds.includes(produceVal)) {
          return false;
        }
      }

      return true;
    });

    // Distance Calculation if user coordinates are known
    if (userCoords && FreshFind.calculateDistance) {
      filtered.forEach((m) => {
        m._distance = FreshFind.calculateDistance(userCoords.lat, userCoords.lon, m.latitude, m.longitude);
      });
    }

    // Sort Visible Markets
    if (sortVal === "az") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === "za") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortVal === "nearest") {
      filtered.sort((a, b) => {
        const distA = a._distance != null ? a._distance : 99999;
        const distB = b._distance != null ? b._distance : 99999;
        return distA - distB;
      });
    } else if (sortVal === "next_open") {
      filtered.sort((a, b) => {
        const statusA = FreshFind.isMarketOpen ? FreshFind.isMarketOpen(a).code : "";
        const statusB = FreshFind.isMarketOpen ? FreshFind.isMarketOpen(b).code : "";
        const rank = { open: 1, soon: 2, closed: 3, closed_today: 4 };
        return (rank[statusA] || 5) - (rank[statusB] || 5);
      });
    }

    renderMarketCards(filtered);
    updateResultCount(filtered.length, allMarkets.length);
  }

  function renderMarketCards(markets) {
    const container = document.getElementById("marketDirectory");
    const noResults = document.getElementById("noMarketsFound");
    if (!container) return;

    container.innerHTML = "";

    if (markets.length === 0) {
      if (noResults) noResults.style.display = "block";
      return;
    }

    if (noResults) noResults.style.display = "none";

    markets.forEach((m) => {
      const card = createMarketCard(m);
      container.appendChild(card);
    });
  }

  function createMarketCard(m) {
    const card = document.createElement("article");
    card.className = "market-card";
    card.dataset.id = m.id;

    // Status engine calculation
    let statusInfo = { status: "CHECK HOURS", code: "closed", icon: "⚪", badgeText: "Check Hours" };
    if (FreshFind.isMarketOpen) {
      statusInfo = FreshFind.isMarketOpen(m);
    }

    // Next open text
    let nextOpenText = "";
    if (statusInfo.code !== "open" && FreshFind.getNextOpenTime) {
      nextOpenText = `<div class="next-open-text">Next: ${FreshFind.getNextOpenTime(m)}</div>`;
    }

    // Distance display
    let distanceBadge = "";
    if (m._distance != null) {
      distanceBadge = `<span class="distance-pill">📍 ${m._distance} km away</span>`;
    }

    // Bookmarked state
    const bookmarked = FreshFind.isBookmarked ? FreshFind.isBookmarked("market", m.id) : false;

    // Operating days string
    const daysStr = Array.isArray(m.operatingDays) ? m.operatingDays.join(" • ") : (m.day || "Weekly");

    // Produce tags preview
    let produceChips = "";
    if (Array.isArray(m.produceIds) && allProduce.length) {
      const topItems = m.produceIds.slice(0, 3).map((id) => {
        const pObj = allProduce.find((p) => p.id === id);
        return pObj ? `${pObj.image || "🌱"} ${pObj.name}` : id;
      });
      produceChips = topItems.map((name) => `<span class="produce-chip">${name}</span>`).join("");
      if (m.produceIds.length > 3) {
        produceChips += `<span class="produce-chip more">+${m.produceIds.length - 3} more</span>`;
      }
    }

    card.innerHTML = `
      <div class="market-card-image" style="background-image: url('${m.image}');">
        <span class="status-badge status-${statusInfo.code}">
          <span class="status-icon">${statusInfo.icon}</span>
          <span class="status-text">${statusInfo.status}</span>
        </span>
        <button class="bookmark-btn ${bookmarked ? "bookmarked" : ""}" aria-label="Bookmark ${m.name}" data-id="${m.id}">
          ${bookmarked ? "♥" : "♡"}
        </button>
      </div>

      <div class="market-card-content">
        <div class="card-meta">
          <span class="market-area">${m.area} ${m.neighborhood ? `• ${m.neighborhood}` : ""}</span>
          ${distanceBadge}
        </div>

        <h3 class="market-title">${m.name}</h3>

        <p class="market-description">${m.description || ""}</p>

        <div class="market-schedule-info">
          <div class="schedule-line">
            <span class="schedule-icon">📅</span>
            <strong>${daysStr}</strong>
          </div>
          <div class="schedule-line">
            <span class="schedule-icon">🕘</span>
            <span>${m.operatingHours || m.time || "See details"}</span>
          </div>
          ${nextOpenText}
        </div>

        ${produceChips ? `<div class="card-produce-chips">${produceChips}</div>` : ""}

        <div class="card-footer">
          <a href="market-details.html?id=${m.id}" class="primary-btn card-cta">
            View Details <span>→</span>
          </a>
        </div>
      </div>
    `;

    // Bookmark toggle listener
    const bBtn = card.querySelector(".bookmark-btn");
    bBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (FreshFind.toggleBookmark) {
        const isNowBookmarked = FreshFind.toggleBookmark("market", m);
        bBtn.classList.toggle("bookmarked", isNowBookmarked);
        bBtn.innerHTML = isNowBookmarked ? "♥" : "♡";
      }
    });

    return card;
  }

  function updateResultCount(visibleCount, totalCount) {
    const countEl = document.getElementById("marketResultCount");
    const countLabel = document.getElementById("marketResultLabel");
    if (countEl) countEl.textContent = visibleCount;
    if (countLabel) {
      countLabel.textContent = `Showing ${visibleCount} of ${totalCount} Farmers Markets`;
    }
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Export functions
  FreshFind.initMarketDirectory = initMarketDirectory;
  FreshFind.allMarkets = () => allMarkets;

  document.addEventListener("DOMContentLoaded", initMarketDirectory);

})(window);