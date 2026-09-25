/**
 * FreshFind - Main Application & Home Page Controller
 * Manages:
 * - Quick Find Interactive Search & Filter System
 * - Featured Markets Carousel (Auto-rotation, indicators, pause-on-hover, keyboard arrows)
 * - Dynamic Seasonal Picks (Calculated via JavaScript Date)
 * - Simulated Visitor Counter (12,458+ Visitors Exploring FreshFind)
 * - Geolocation quick trigger
 * - Animated Stats & Scroll Reveal
 */

(function (window) {
  "use strict";

  const FreshFind = window.FreshFind || (window.FreshFind = {});

  let marketsList = [];
  let produceList = [];
  let carouselIndex = 0;
  let carouselTimer = null;

  async function initHomePage() {
    try {
      const [mRes, pRes] = await Promise.all([
        fetch("data/markets.json"),
        fetch("data/produce.json")
      ]);
      const mData = await mRes.json();
      marketsList = Object.values(mData);
      produceList = await pRes.json();

      setupQuickFindControls();
      setupFeaturedCarousel();
      setupSeasonalPicks();
      setupOpenMarketsBadge();
    } catch (e) {
      console.warn("Could not load dynamic Home Page data:", e);
    }

    setupSimulatedVisitorCounter();
    setupAnimatedStats();
    setupScrollReveal();
  }

  /* =========================================================
     1. QUICK FIND SEARCH & FILTER SYSTEM (SECTION 4)
  ========================================================= */
  function setupQuickFindControls() {
    const searchInput = document.getElementById("homeSearch");
    const areaSelect = document.getElementById("homeAreaFilter");
    const daySelect = document.getElementById("homeDayFilter");
    const produceSelect = document.getElementById("homeProduceFilter");
    const applyBtn = document.getElementById("homeApplyFiltersBtn");
    const clearBtn = document.getElementById("homeClearFiltersBtn");
    const resultsContainer = document.getElementById("quickFindResults");

    // Populate Produce Dropdown dynamically from JSON
    if (produceSelect && produceList.length) {
      produceSelect.innerHTML = `<option value="">All Produce</option>`;
      produceList.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.image || "🌱"} ${p.name}`;
        produceSelect.appendChild(opt);
      });
    }

    // Populate Area Dropdown
    if (areaSelect && marketsList.length) {
      const areas = Array.from(new Set(marketsList.map((m) => m.area))).filter(Boolean).sort();
      areaSelect.innerHTML = `<option value="">All Areas</option>`;
      areas.forEach((a) => {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        areaSelect.appendChild(opt);
      });
    }

    // Popular Quick Filter Chips
    document.querySelectorAll(".popular-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        const query = btn.dataset.search || btn.textContent.trim();
        if (searchInput) searchInput.value = query;
        runQuickFindFilter();
      });
    });

    if (applyBtn) applyBtn.addEventListener("click", runQuickFindFilter);
    if (searchInput) {
      searchInput.addEventListener("input", debounce(runQuickFindFilter, 300));
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") runQuickFindFilter();
      });
    }
    if (areaSelect) areaSelect.addEventListener("change", runQuickFindFilter);
    if (daySelect) daySelect.addEventListener("change", runQuickFindFilter);
    if (produceSelect) produceSelect.addEventListener("change", runQuickFindFilter);

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (areaSelect) areaSelect.value = "";
        if (daySelect) daySelect.value = "";
        if (produceSelect) produceSelect.value = "";
        runQuickFindFilter();
      });
    }

    // Initial render of Quick Find
    runQuickFindFilter();
  }

  function runQuickFindFilter() {
    const resultsContainer = document.getElementById("quickFindResults");
    if (!resultsContainer) return;

    const query = (document.getElementById("homeSearch")?.value || "").toLowerCase().trim();
    const area = document.getElementById("homeAreaFilter")?.value || "";
    const day = document.getElementById("homeDayFilter")?.value || "";
    const produce = document.getElementById("homeProduceFilter")?.value || "";

    const filtered = marketsList.filter((m) => {
      // Search
      if (query) {
        const matchName = m.name?.toLowerCase().includes(query);
        const matchArea = m.area?.toLowerCase().includes(query);
        const matchNeigh = m.neighborhood?.toLowerCase().includes(query);
        const matchDesc = m.description?.toLowerCase().includes(query);
        const matchProduce = Array.isArray(m.produceIds) && m.produceIds.some((pId) => {
          const pObj = produceList.find((p) => p.id === pId);
          return pId.toLowerCase().includes(query) || (pObj && pObj.name.toLowerCase().includes(query));
        });
        if (!matchName && !matchArea && !matchNeigh && !matchDesc && !matchProduce) return false;
      }

      // Area
      if (area && m.area?.toLowerCase() !== area.toLowerCase()) return false;

      // Day
      if (day) {
        const inDays = Array.isArray(m.operatingDays) && m.operatingDays.some((d) => d.toLowerCase() === day.toLowerCase());
        const inSchedule = Array.isArray(m.schedule) && m.schedule.some((s) => s.day?.toLowerCase() === day.toLowerCase() && s.isOpen);
        if (!inDays && !inSchedule) return false;
      }

      // Produce
      if (produce) {
        if (!Array.isArray(m.produceIds) || !m.produceIds.includes(produce)) return false;
      }

      return true;
    });

    resultsContainer.innerHTML = "";

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="quick-find-empty">
          <p>No markets match your selected filters. Try broadening your criteria or click Clear All.</p>
        </div>
      `;
      return;
    }

    // Show up to 4 quick cards with link to directory
    filtered.slice(0, 4).forEach((m) => {
      const card = createHomeMarketCard(m);
      resultsContainer.appendChild(card);
    });

    if (filtered.length > 4) {
      const moreCard = document.createElement("div");
      moreCard.className = "quick-find-more-card";
      moreCard.innerHTML = `
        <div class="more-card-content">
          <h4>+${filtered.length - 4} More Markets Found</h4>
          <p>View the full interactive list in our Market Directory.</p>
          <a href="markets.html" class="primary-btn">View All Matching Markets →</a>
        </div>
      `;
      resultsContainer.appendChild(moreCard);
    }
  }

  function createHomeMarketCard(m) {
    const card = document.createElement("div");
    card.className = "quick-market-card";

    let status = { status: "OPEN TODAY", code: "open", icon: "🟢" };
    if (FreshFind.isMarketOpen) {
      status = FreshFind.isMarketOpen(m);
    }

    const isSaved = FreshFind.isBookmarked ? FreshFind.isBookmarked("market", m.id) : false;
    const daysStr = Array.isArray(m.operatingDays) ? m.operatingDays.join(" • ") : (m.day || "Weekly");

    card.innerHTML = `
      <div class="quick-card-img" style="background-image: url('${m.image}');">
        <span class="status-pill status-${status.code}">${status.icon} ${status.status}</span>
        <button class="quick-bookmark-btn ${isSaved ? "bookmarked" : ""}" data-id="${m.id}" aria-label="Bookmark">
          ${isSaved ? "♥" : "♡"}
        </button>
      </div>
      <div class="quick-card-body">
        <span class="quick-card-area">${m.area} ${m.neighborhood ? `• ${m.neighborhood}` : ""}</span>
        <h4>${m.name}</h4>
        <p class="quick-card-timing">📅 ${daysStr} | 🕘 ${m.operatingHours || m.time || "See details"}</p>
        <a href="market-details.html?id=${m.id}" class="quick-card-link">View Details →</a>
      </div>
    `;

    card.querySelector(".quick-bookmark-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (FreshFind.toggleBookmark) {
        const saved = FreshFind.toggleBookmark("market", m);
        e.target.classList.toggle("bookmarked", saved);
        e.target.innerHTML = saved ? "♥" : "♡";
      }
    });

    return card;
  }

  /* =========================================================
     2. FEATURED MARKETS CAROUSEL / SLIDER (SECTION 5)
  ========================================================= */
  function setupFeaturedCarousel() {
    const carouselContainer = document.getElementById("featuredCarouselTrack");
    const prevBtn = document.getElementById("carouselPrevBtn");
    const nextBtn = document.getElementById("carouselNextBtn");
    const dotsContainer = document.getElementById("carouselIndicators");
    const carouselWrapper = document.getElementById("featuredCarouselWrapper");

    if (!carouselContainer || !marketsList.length) return;

    carouselContainer.innerHTML = "";
    if (dotsContainer) dotsContainer.innerHTML = "";

    // Featured set: pick 6 diverse markets
    const featured = marketsList.slice(0, 6);

    featured.forEach((m, idx) => {
      const slide = document.createElement("div");
      slide.className = `carousel-slide ${idx === 0 ? "active" : ""}`;

      let status = { status: "OPEN TODAY", code: "open", icon: "🟢" };
      if (FreshFind.isMarketOpen) {
        status = FreshFind.isMarketOpen(m);
      }

      const isSaved = FreshFind.isBookmarked ? FreshFind.isBookmarked("market", m.id) : false;
      const daysStr = Array.isArray(m.operatingDays) ? m.operatingDays.join(", ") : (m.day || "Weekly");

      slide.innerHTML = `
        <div class="featured-slide-card">
          <div class="slide-image-col" style="background-image: url('${m.image}');">
            <span class="status-badge status-${status.code}">
              <span class="status-icon">${status.icon}</span> ${status.status}
            </span>
            <button class="slide-bookmark-btn ${isSaved ? "bookmarked" : ""}" data-id="${m.id}" aria-label="Bookmark">
              ${isSaved ? "♥" : "♡"}
            </button>
          </div>
          <div class="slide-content-col">
            <span class="slide-area">${m.area} ${m.neighborhood ? `• ${m.neighborhood}` : ""}</span>
            <h3 class="slide-title">${m.name}</h3>
            <p class="slide-desc">${m.description || ""}</p>
            <div class="slide-timing-grid">
              <div class="slide-timing-item">
                <span class="timing-icon">📅</span>
                <div>
                  <small>Operating Day</small>
                  <strong>${daysStr}</strong>
                </div>
              </div>
              <div class="slide-timing-item">
                <span class="timing-icon">🕘</span>
                <div>
                  <small>Operating Time</small>
                  <strong>${m.operatingHours || m.time || "Morning"}</strong>
                </div>
              </div>
            </div>
            <div class="slide-actions">
              <a href="market-details.html?id=${m.id}" class="primary-btn">
                View Details <span>→</span>
              </a>
              <button class="primary-btn-outline slide-save-btn">
                ${isSaved ? "♥ Saved" : "♡ Bookmark"}
              </button>
            </div>
          </div>
        </div>
      `;

      // Save button inside slide
      const saveBtn = slide.querySelector(".slide-save-btn");
      const heartBtn = slide.querySelector(".slide-bookmark-btn");

      const toggleAction = (e) => {
        e.stopPropagation();
        if (FreshFind.toggleBookmark) {
          const saved = FreshFind.toggleBookmark("market", m);
          heartBtn.classList.toggle("bookmarked", saved);
          heartBtn.innerHTML = saved ? "♥" : "♡";
          saveBtn.innerHTML = saved ? "♥ Saved" : "♡ Bookmark";
        }
      };

      saveBtn.addEventListener("click", toggleAction);
      heartBtn.addEventListener("click", toggleAction);

      carouselContainer.appendChild(slide);

      // Indicator Dot
      if (dotsContainer) {
        const dot = document.createElement("button");
        dot.className = `carousel-dot ${idx === 0 ? "active" : ""}`;
        dot.setAttribute("aria-label", `Slide ${idx + 1}`);
        dot.addEventListener("click", () => goToCarouselSlide(idx));
        dotsContainer.appendChild(dot);
      }
    });

    const totalSlides = featured.length;

    function goToCarouselSlide(idx) {
      carouselIndex = (idx + totalSlides) % totalSlides;
      const slides = carouselContainer.querySelectorAll(".carousel-slide");
      const dots = dotsContainer?.querySelectorAll(".carousel-dot");

      slides.forEach((s, i) => {
        s.classList.toggle("active", i === carouselIndex);
      });
      dots?.forEach((d, i) => {
        d.classList.toggle("active", i === carouselIndex);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToCarouselSlide(carouselIndex - 1);
        resetCarouselTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToCarouselSlide(carouselIndex + 1);
        resetCarouselTimer();
      });
    }

    // Auto Rotation (every 5 seconds)
    function startCarouselTimer() {
      carouselTimer = setInterval(() => {
        goToCarouselSlide(carouselIndex + 1);
      }, 5000);
    }

    function resetCarouselTimer() {
      clearInterval(carouselTimer);
      startCarouselTimer();
    }

    startCarouselTimer();

    // Pause on Hover
    if (carouselWrapper) {
      carouselWrapper.addEventListener("mouseenter", () => clearInterval(carouselTimer));
      carouselWrapper.addEventListener("mouseleave", () => startCarouselTimer());
    }

    // Keyboard Arrow Support (Left / Right)
    document.addEventListener("keydown", (e) => {
      // Only if carousel is roughly in view
      const rect = carouselWrapper?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === "ArrowLeft") {
          goToCarouselSlide(carouselIndex - 1);
          resetCarouselTimer();
        } else if (e.key === "ArrowRight") {
          goToCarouselSlide(carouselIndex + 1);
          resetCarouselTimer();
        }
      }
    });
  }

  /* =========================================================
     3. SEASONAL PICKS (SECTION 6)
  ========================================================= */
  function setupSeasonalPicks() {
    const container = document.getElementById("seasonalPicksContainer");
    const seasonHeading = document.getElementById("currentSeasonHeading");
    const seasonBadge = document.getElementById("currentSeasonBadge");

    if (!container || !produceList.length) return;

    // Calculate current season dynamically
    const season = FreshFind.getCurrentSeason ? FreshFind.getCurrentSeason() : { name: "Summer", icon: "☀️", color: "#d77a3e" };

    if (seasonHeading) {
      seasonHeading.innerHTML = `Fresh Picks This Season <span>(${season.name.toUpperCase()})</span>`;
    }

    if (seasonBadge) {
      seasonBadge.textContent = `${season.icon} ${season.name}`;
      seasonBadge.style.background = season.color;
      seasonBadge.style.color = "#ffffff";
    }

    // Filter produce for this season or all seasons
    let seasonalItems = produceList.filter(
      (p) => p.season.toLowerCase() === season.name.toLowerCase() || p.season.toLowerCase() === "all seasons"
    );

    if (seasonalItems.length === 0) {
      seasonalItems = produceList.slice(0, 4);
    }

    container.innerHTML = "";

    seasonalItems.slice(0, 4).forEach((p) => {
      const marketsCount = Array.isArray(p.marketIds) ? p.marketIds.length : 0;
      const card = document.createElement("div");
      card.className = "season-pick-card";
      card.innerHTML = `
        <div class="season-pick-emoji">${p.image || "🌱"}</div>
        <div class="season-pick-info">
          <span class="season-pick-cat">${p.category}</span>
          <h4>${p.name}</h4>
          <p>${p.shortDescription || p.description}</p>
          <div class="season-pick-meta">
            <span>📍 Available at <strong>${marketsCount}</strong> ${marketsCount === 1 ? "market" : "markets"}</span>
          </div>
          <a href="produce.html?highlight=${p.id}" class="season-view-link">
            View Details →
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  /* =========================================================
     4. OPEN MARKETS LIVE BADGE ON HERO
  ========================================================= */
  function setupOpenMarketsBadge() {
    const openCountEl = document.getElementById("openMarketCount");
    if (!openCountEl || !marketsList.length) return;

    let openNow = 0;
    marketsList.forEach((m) => {
      const status = FreshFind.isMarketOpen ? FreshFind.isMarketOpen(m) : { code: "closed" };
      if (status.code === "open" || status.code === "soon") {
        openNow += 1;
      }
    });

    openCountEl.textContent = `${openNow} ${openNow === 1 ? "market" : "markets"} open or opening today`;
  }

  /* =========================================================
     5. SIMULATED VISITOR COUNTER (SECTION 9)
  ========================================================= */
  function setupSimulatedVisitorCounter() {
    const counter = document.getElementById("visitorCounterNumber");
    if (!counter) return;

    let count = parseInt(localStorage.getItem("freshfind_simulated_visitors"), 10);
    if (isNaN(count) || count < 12458) {
      count = 12458 + Math.floor(Math.random() * 45);
    } else {
      count += Math.floor(Math.random() * 3) + 1;
    }
    localStorage.setItem("freshfind_simulated_visitors", count);

    counter.textContent = `${count.toLocaleString()}+`;
  }

  /* =========================================================
     6. ANIMATED STAT NUMBERS
  ========================================================= */
  function setupAnimatedStats() {
    const numbers = document.querySelectorAll(".stat-number[data-count]");
    if (!numbers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            animateSingleNumber(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    numbers.forEach((el) => observer.observe(el));
  }

  function animateSingleNumber(el, target) {
    let current = 0;
    const duration = 1200;
    const increment = Math.max(1, Math.ceil(target / (duration / 25)));

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current;
    }, 25);
  }

  /* =========================================================
     7. SCROLL REVEAL ANIMATIONS
  ========================================================= */
  function setupScrollReveal() {
    const elements = document.querySelectorAll(".step-card, .benefit-card, .section-heading, .center-heading");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => {
      el.classList.add("reveal-on-scroll");
      observer.observe(el);
    });
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  document.addEventListener("DOMContentLoaded", initHomePage);

})(window);
