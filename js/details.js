/**
 * FreshFind - Market Detail Controller
 * Handles loading market details by ID, 7-day schedule with current day highlighted,
 * status calculation via FreshFind.isMarketOpen, interactive OpenStreetMap/Google embed,
 * available produce cards with direct links, bookmark toggle, and sharing.
 */

(function (window) {
  "use strict";

  const FreshFind = window.FreshFind || (window.FreshFind = {});

  let currentMarket = null;
  let allProduce = [];

  async function initMarketDetails() {
    const detailContainer = document.querySelector(".market-details-page");
    if (!detailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const marketId = urlParams.get("id") || "1";

    try {
      const [mRes, pRes] = await Promise.all([
        fetch("data/markets.json"),
        fetch("data/produce.json")
      ]);
      const marketsData = await mRes.json();
      allProduce = await pRes.json();

      currentMarket = marketsData[marketId] || marketsData["1"];
      if (!currentMarket) {
        throw new Error("Market data not found");
      }

      renderMarketHeader();
      renderLocationInfo();
      renderWeeklySchedule();
      renderAvailableProduce();
      initMap();
      setupActionButtons();
    } catch (e) {
      console.error("Error loading market details:", e);
      const main = document.querySelector("main");
      if (main) {
        main.innerHTML = `
          <div class="container" style="padding: 80px 20px; text-align: center;">
            <h2>Market Information Not Available</h2>
            <p>We couldn't retrieve information for this market. Please return to the directory.</p>
            <a href="markets.html" class="primary-btn" style="display: inline-block; margin-top: 20px;">
              Back to Market Directory
            </a>
          </div>
        `;
      }
    }
  }

  function renderMarketHeader() {
    const m = currentMarket;

    // Breadcrumb
    const breadcrumbName = document.getElementById("breadcrumbMarketName");
    if (breadcrumbName) breadcrumbName.textContent = m.name;

    // Document Title
    document.title = `${m.name} | FreshFind Directory`;

    // Title & Meta
    const nameEl = document.getElementById("marketName");
    const areaEl = document.getElementById("marketArea");
    const descEl = document.getElementById("marketDescription");
    const aboutEl = document.getElementById("marketAbout");
    const imgEl = document.getElementById("marketImgTag");
    const imgContainer = document.getElementById("marketImage");

    if (nameEl) nameEl.textContent = m.name;
    if (areaEl) areaEl.textContent = `${m.area} ${m.neighborhood ? `• ${m.neighborhood}` : ""}`;
    if (descEl) descEl.textContent = m.description || "";
    if (aboutEl) aboutEl.textContent = m.about || m.description || "";

    if (imgEl) {
      imgEl.src = m.image;
      imgEl.alt = m.name;
    }
    if (imgContainer) {
      imgContainer.style.backgroundImage = `url('${m.image}')`;
    }

    // Status calculation using central engine
    let status = { status: "OPEN TODAY", code: "open", icon: "🟢", badgeText: "Open Today" };
    if (FreshFind.isMarketOpen) {
      status = FreshFind.isMarketOpen(m);
    }

    const badgeEl = document.getElementById("marketBadge");
    if (badgeEl) {
      badgeEl.className = `status-badge status-${status.code}`;
      badgeEl.innerHTML = `<span class="status-icon">${status.icon}</span> <span>${status.status}</span>`;
    }

    // Next open text if closed
    const nextOpenEl = document.getElementById("marketNextOpenText");
    if (nextOpenEl) {
      if (status.code !== "open" && FreshFind.getNextOpenTime) {
        nextOpenEl.textContent = `Schedule: ${FreshFind.getNextOpenTime(m)}`;
        nextOpenEl.style.display = "block";
      } else {
        nextOpenEl.style.display = "none";
      }
    }

    // Days & Hours quick pills
    const dayEl = document.getElementById("marketDay");
    const timeEl = document.getElementById("marketTime");
    const locationEl = document.getElementById("marketLocation");

    const daysStr = Array.isArray(m.operatingDays) ? m.operatingDays.join(", ") : (m.day || "Scheduled Days");
    if (dayEl) dayEl.textContent = daysStr;
    if (timeEl) timeEl.textContent = m.operatingHours || m.time || "See Weekly Schedule";
    if (locationEl) locationEl.textContent = m.address || m.area || "Local Area";
  }

  function renderLocationInfo() {
    const m = currentMarket;
    const addressEl = document.getElementById("detailFullAddress");
    const areaEl = document.getElementById("detailArea");
    const neighEl = document.getElementById("detailNeighborhood");
    const coordsEl = document.getElementById("detailCoordinates");

    if (addressEl) addressEl.textContent = m.address || `${m.name}, ${m.area}`;
    if (areaEl) areaEl.textContent = m.area || "City";
    if (neighEl) neighEl.textContent = m.neighborhood || "District";
    if (coordsEl) coordsEl.textContent = `${m.latitude.toFixed(4)}° N, ${m.longitude.toFixed(4)}° E`;
  }

  function renderWeeklySchedule() {
    const tableBody = document.getElementById("scheduleTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = daysOrder[new Date().getDay()];

    const schedule = Array.isArray(currentMarket.schedule) && currentMarket.schedule.length === 7
      ? currentMarket.schedule
      : [
          { day: "Monday", open: "08:00 AM", close: "02:00 PM", isOpen: true },
          { day: "Tuesday", open: "—", close: "—", isOpen: false },
          { day: "Wednesday", open: "08:00 AM", close: "02:00 PM", isOpen: true },
          { day: "Thursday", open: "—", close: "—", isOpen: false },
          { day: "Friday", open: "—", close: "—", isOpen: false },
          { day: "Saturday", open: "08:00 AM", close: "03:00 PM", isOpen: true },
          { day: "Sunday", open: "—", close: "—", isOpen: false }
        ];

    schedule.forEach((item) => {
      const isToday = item.day.toLowerCase() === todayName.toLowerCase();
      const tr = document.createElement("tr");
      if (isToday) tr.className = "schedule-row-today";

      const statusBadge = item.isOpen
        ? `<span class="schedule-pill open">Open</span>`
        : `<span class="schedule-pill closed">Closed</span>`;

      tr.innerHTML = `
        <td class="day-col">
          <strong>${item.day}</strong>
          ${isToday ? `<span class="today-tag">TODAY</span>` : ""}
        </td>
        <td>${item.isOpen ? item.open : "—"}</td>
        <td>${item.isOpen ? item.close : "—"}</td>
        <td>${statusBadge}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function renderAvailableProduce() {
    const container = document.getElementById("marketProduceGrid");
    if (!container) return;

    container.innerHTML = "";

    const produceIds = currentMarket.produceIds || [];
    if (produceIds.length === 0) {
      container.innerHTML = `<p class="no-produce-msg">Fresh seasonal produce updates are posted on market morning.</p>`;
      return;
    }

    produceIds.forEach((pId) => {
      const p = allProduce.find((item) => item.id === pId) || {
        id: pId,
        name: pId.charAt(0).toUpperCase() + pId.slice(1),
        category: "Produce",
        season: "In Season",
        image: "🌱",
        shortDescription: "Fresh local harvest available at this market."
      };

      const card = document.createElement("div");
      card.className = "market-produce-card";
      card.innerHTML = `
        <div class="produce-card-icon">${p.image || "🌱"}</div>
        <div class="produce-card-body">
          <div class="produce-tags">
            <span class="produce-category-tag">${p.category}</span>
            <span class="produce-season-tag">${p.season}</span>
          </div>
          <h4>${p.name}</h4>
          <p>${p.shortDescription || p.description || ""}</p>
          <a href="produce.html?highlight=${p.id}" class="produce-link-btn">
            View Produce <span>→</span>
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function initMap() {
    const mapContainer = document.getElementById("marketMap");
    if (!mapContainer || !currentMarket) return;

    const lat = currentMarket.latitude || 24.8607;
    const lon = currentMarket.longitude || 67.0011;
    const name = encodeURIComponent(currentMarket.name);

    // Embed OpenStreetMap interactive iframe with pinned marker
    mapContainer.innerHTML = `
      <iframe
        title="Interactive Map for ${currentMarket.name}"
        width="100%"
        height="100%"
        frameborder="0"
        scrolling="no"
        marginheight="0"
        marginwidth="0"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.015}%2C${lat - 0.012}%2C${lon + 0.015}%2C${lat + 0.012}&layer=mapnik&marker=${lat}%2C${lon}"
        style="border: 0; border-radius: 12px; min-height: 320px;"
      ></iframe>
      <div class="map-overlay-card">
        <strong>📍 ${currentMarket.name}</strong>
        <p>${currentMarket.address || currentMarket.area}</p>
        <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lon}" target="_blank" rel="noopener" class="map-directions-link">
          Open in Google Maps ↗
        </a>
      </div>
    `;
  }

  function setupActionButtons() {
    const bookmarkBtn = document.getElementById("detailBookmarkBtn");
    const shareBtn = document.getElementById("detailShareBtn");

    if (bookmarkBtn) {
      const updateBtnState = () => {
        const isSaved = FreshFind.isBookmarked ? FreshFind.isBookmarked("market", currentMarket.id) : false;
        bookmarkBtn.classList.toggle("active", isSaved);
        bookmarkBtn.innerHTML = isSaved ? `<span>♥</span> Bookmarked` : `<span>♡</span> Bookmark`;
      };

      updateBtnState();

      bookmarkBtn.addEventListener("click", () => {
        if (FreshFind.toggleBookmark) {
          FreshFind.toggleBookmark("market", currentMarket);
          updateBtnState();
        }
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        if (FreshFind.shareContent) {
          FreshFind.shareContent(
            currentMarket.name,
            `Discover fresh local produce at ${currentMarket.name} in ${currentMarket.area}!`,
            window.location.href
          );
        }
      });
    }
  }

  FreshFind.initMarketDetails = initMarketDetails;

  document.addEventListener("DOMContentLoaded", initMarketDetails);

})(window);
