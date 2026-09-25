import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import marketsData from "../data/markets.json";
import produceData from "../data/produce.json";
import { isMarketOpen, getCurrentSeason, getAssetUrl } from "../utils/engine";
import { useBookmarks } from "../context/BookmarkContext";
import { useModals } from "../context/ModalContext";

export default function Home() {
  const { isMarketSaved, toggleMarketBookmark, isProduceSaved, toggleProduceBookmark } = useBookmarks();
  const { openProduceModal } = useModals();

  const marketsList = useMemo(() => Object.values(marketsData), []);
  const produceList = useMemo(() => produceData, []);

  // Live Open Market Count in Hero
  const openMarketsCount = useMemo(() => {
    return marketsList.filter((m) => {
      const status = isMarketOpen(m);
      return status.code === "open" || status.code === "soon";
    }).length;
  }, [marketsList]);

  // Current Season
  const currentSeason = useMemo(() => getCurrentSeason(), []);
  const seasonalProduce = useMemo(() => {
    return produceList.filter(
      (p) =>
        p.season.toLowerCase() === currentSeason.name.toLowerCase() ||
        p.season.toLowerCase() === "all seasons"
    );
  }, [produceList, currentSeason]);

  // Quick Find State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedProduce, setSelectedProduce] = useState("");

  const areasList = useMemo(() => {
    return Array.from(new Set(marketsList.map((m) => m.area))).filter(Boolean).sort();
  }, [marketsList]);

  // Filtered Markets for Quick Find
  const filteredQuickMarkets = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return marketsList.filter((m) => {
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

      if (selectedArea && m.area?.toLowerCase() !== selectedArea.toLowerCase()) return false;

      if (selectedDay) {
        const inDays = Array.isArray(m.operatingDays) && m.operatingDays.some((d) => d.toLowerCase() === selectedDay.toLowerCase());
        const inSchedule = Array.isArray(m.schedule) && m.schedule.some((s) => s.day?.toLowerCase() === selectedDay.toLowerCase() && s.isOpen);
        if (!inDays && !inSchedule) return false;
      }

      if (selectedProduce) {
        if (!Array.isArray(m.produceIds) || !m.produceIds.includes(selectedProduce)) return false;
      }

      return true;
    });
  }, [marketsList, produceList, searchTerm, selectedArea, selectedDay, selectedProduce]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedArea("");
    setSelectedDay("");
    setSelectedProduce("");
  };

  // Carousel State
  const featuredMarkets = useMemo(() => marketsList.slice(0, 6), [marketsList]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselWrapperRef = useRef(null);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredMarkets.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, featuredMarkets.length]);

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % featuredMarkets.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + featuredMarkets.length) % featuredMarkets.length);
  };

  // Handle Keyboard Arrows for Carousel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [featuredMarkets.length]);

  // Visitor Counter Animation / Display
  const [visitorCount, setVisitorCount] = useState(12458);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      {/* =========================
           3. HERO SECTION
      ========================== */}
      <section className="hero-section">
        <div className="hero-background-shape shape-one"></div>
        <div className="hero-background-shape shape-two"></div>

        <div className="container hero-grid">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-line"></span>
              LOCAL • SEASONAL • FRESH
            </div>

            <h1>
              Fresh Finds. Local Markets.
              <span>Better Choices.</span>
            </h1>

            <p className="hero-description">
              Fresh local produce aur nearby farmers markets ko easily discover karne ka platform.
              Check operating schedules, live open statuses, and seasonal farm availability before stepping out.
            </p>

            <div className="hero-cta-group" style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px" }}>
              <a href="#quick-find" className="primary-btn" style={{ padding: "13px 26px", fontSize: "15px" }}>
                Find a Market Near You <span>↓</span>
              </a>
              <Link to="/produce" className="primary-btn-outline" style={{ padding: "13px 26px", fontSize: "15px" }}>
                Explore Produce <span>→</span>
              </Link>
            </div>

            <div className="hero-links">
              <span>Popular Searches:</span>
              <button
                type="button"
                className="popular-link"
                onClick={() => setSearchTerm("tomatoes")}
              >
                Tomatoes
              </button>
              <button
                type="button"
                className="popular-link"
                onClick={() => setSearchTerm("mangoes")}
              >
                Mangoes
              </button>
              <button
                type="button"
                className="popular-link"
                onClick={() => setSelectedArea("Downtown")}
              >
                Downtown
              </button>
              <button
                type="button"
                className="popular-link"
                onClick={() => setSelectedDay("Saturday")}
              >
                Saturday
              </button>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="hero-visual">
            <div className="hero-image-card">
              <div className="image-label">
                <span className="label-dot"></span>
                FRESH THIS WEEK
              </div>

              <div className="produce-display">
                <div className="produce-leaf leaf-one"></div>
                <div className="produce-leaf leaf-two"></div>
                <div className="produce-item tomato"><span>🍅</span></div>
                <div className="produce-item orange"><span>🍊</span></div>
                <div className="produce-item apple"><span>🍎</span></div>
                <div className="produce-item carrot"><span>🥕</span></div>
                <div className="produce-item lemon"><span>🥒</span></div>
              </div>

              <div className="image-caption">
                <div>
                  <small>LOCAL FARM HARVEST</small>
                  <h3>Community Produce</h3>
                </div>
                <span className="caption-arrow">↗</span>
              </div>
            </div>

            <div className="floating-card open-card">
              <span className="status-pulse"></span>
              <div>
                <strong>Markets Status</strong>
                <small id="openMarketCount">
                  {openMarketsCount > 0 ? `${openMarketsCount} open or soon today` : "Check weekly schedule"}
                </small>
              </div>
            </div>

            <div className="floating-card season-card">
              <span className="season-icon">{currentSeason.icon}</span>
              <div>
                <strong>In Season: {currentSeason.name}</strong>
                <small>Fresh local picks available</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
           4. QUICK FIND SECTION
      ========================== */}
      <section className="quick-find-section" id="quick-find">
        <div className="container">
          <div className="quick-find-box">
            <div className="quick-find-header">
              <span className="section-kicker">PROMINENT SEARCH SYSTEM</span>
              <h2>Find a Market Near You</h2>
              <p>Search by market name, area, neighborhood, operating day, or fresh produce item. Filter individually or combined.</p>
            </div>

            <div className="quick-find-form-grid">
              <div className="form-field">
                <input
                  type="text"
                  id="homeSearch"
                  placeholder="Search market, area or produce..."
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="form-field">
                <select
                  id="homeAreaFilter"
                  aria-label="Filter by Area"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="">All Areas</option>
                  {areasList.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <select
                  id="homeDayFilter"
                  aria-label="Filter by Day"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  <option value="">All Days</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div className="form-field">
                <select
                  id="homeProduceFilter"
                  aria-label="Filter by Produce"
                  value={selectedProduce}
                  onChange={(e) => setSelectedProduce(e.target.value)}
                >
                  <option value="">All Produce</option>
                  {produceList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.image || "🌱"} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="btn-apply-filters"
                id="homeApplyFiltersBtn"
                onClick={() => {}}
              >
                Apply Filters
              </button>

              <button
                type="button"
                className="btn-clear-filters"
                id="homeClearFiltersBtn"
                onClick={handleClearFilters}
              >
                Clear All
              </button>
            </div>

            {/* Live Matching Results */}
            <div className="quick-find-results-grid" id="quickFindResults">
              {filteredQuickMarkets.length === 0 ? (
                <div className="quick-find-empty">
                  <p>No markets match your selected filters. Try broadening your criteria or click Clear All.</p>
                </div>
              ) : (
                <>
                  {filteredQuickMarkets.slice(0, 4).map((m) => {
                    const status = isMarketOpen(m);
                    const isSaved = isMarketSaved(m.id);
                    const daysStr = Array.isArray(m.operatingDays)
                      ? m.operatingDays.join(" • ")
                      : m.day || "Weekly";

                    return (
                      <div key={m.id} className="quick-market-card">
                        <div
                          className="quick-card-img"
                          style={{ backgroundImage: `url('${getAssetUrl(m.image)}')` }}
                        >
                          <span className={`status-pill status-${status.code}`}>
                            {status.icon} {status.status}
                          </span>
                          <button
                            type="button"
                            className={`quick-bookmark-btn ${isSaved ? "bookmarked" : ""}`}
                            aria-label="Bookmark"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleMarketBookmark(m);
                            }}
                          >
                            {isSaved ? "♥" : "♡"}
                          </button>
                        </div>
                        <div className="quick-card-body">
                          <span className="quick-card-area">
                            {m.area} {m.neighborhood ? `• ${m.neighborhood}` : ""}
                          </span>
                          <h4>{m.name}</h4>
                          <p className="quick-card-timing">
                            📅 {daysStr} | 🕘 {m.operatingHours || m.time || "See details"}
                          </p>
                          <Link to={`/markets/${m.id}`} className="quick-card-link">
                            View Details →
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {filteredQuickMarkets.length > 4 && (
                    <div className="quick-find-more-card">
                      <div className="more-card-content">
                        <h4>+{filteredQuickMarkets.length - 4} More Markets Found</h4>
                        <p>View the full interactive list in our Market Directory.</p>
                        <Link to="/markets" className="primary-btn">
                          View All Matching Markets →
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
           5. FEATURED MARKETS (CAROUSEL)
      ========================== */}
      <section className="featured-carousel-section">
        <div className="container">
          <div
            className="section-heading"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "16px"
            }}
          >
            <div>
              <span className="section-kicker">CURATED SHOWCASE</span>
              <h2>
                Featured <span>Farmers Markets</span>
              </h2>
              <p>Explore highlighted local markets with live open/closed statuses, schedules, and locations.</p>
            </div>
            <Link to="/markets" className="primary-btn-outline">
              View All in Directory <span>→</span>
            </Link>
          </div>

          <div
            className="carousel-wrapper"
            id="featuredCarouselWrapper"
            ref={carouselWrapperRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <button
              type="button"
              className="carousel-nav-btn carousel-prev-btn"
              id="carouselPrevBtn"
              aria-label="Previous market"
              onClick={prevSlide}
            >
              ‹
            </button>

            <div className="carousel-track" id="featuredCarouselTrack">
              {featuredMarkets.map((m, idx) => {
                const isActive = idx === carouselIndex;
                const status = isMarketOpen(m);
                const isSaved = isMarketSaved(m.id);
                const daysStr = Array.isArray(m.operatingDays)
                  ? m.operatingDays.join(", ")
                  : m.day || "Weekly";

                return (
                  <div
                    key={m.id}
                    className={`carousel-slide ${isActive ? "active" : ""}`}
                    style={{ display: isActive ? "block" : "none" }}
                  >
                    <div className="featured-slide-card">
                      <div
                        className="slide-image-col"
                        style={{ backgroundImage: `url('${getAssetUrl(m.image)}')` }}
                      >
                        <span className={`status-badge status-${status.code}`}>
                          <span className="status-icon">{status.icon}</span> {status.status}
                        </span>
                        <button
                          type="button"
                          className={`slide-bookmark-btn ${isSaved ? "bookmarked" : ""}`}
                          aria-label="Bookmark"
                          onClick={() => toggleMarketBookmark(m)}
                        >
                          {isSaved ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="slide-content-col">
                        <span className="slide-area">
                          {m.area} {m.neighborhood ? `• ${m.neighborhood}` : ""}
                        </span>
                        <h3 className="slide-title">{m.name}</h3>
                        <p className="slide-desc">{m.description || ""}</p>

                        <div className="slide-timing-grid">
                          <div className="slide-timing-item">
                            <span className="timing-icon">📅</span>
                            <div>
                              <small>Operating Day</small>
                              <strong>{daysStr}</strong>
                            </div>
                          </div>
                          <div className="slide-timing-item">
                            <span className="timing-icon">🕘</span>
                            <div>
                              <small>Operating Time</small>
                              <strong>{m.operatingHours || m.time || "Morning"}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="slide-actions">
                          <Link to={`/markets/${m.id}`} className="primary-btn">
                            View Details <span>→</span>
                          </Link>
                          <button
                            type="button"
                            className="primary-btn-outline slide-save-btn"
                            onClick={() => toggleMarketBookmark(m)}
                          >
                            {isSaved ? "♥ Saved" : "♡ Bookmark"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="carousel-nav-btn carousel-next-btn"
              id="carouselNextBtn"
              aria-label="Next market"
              onClick={nextSlide}
            >
              ›
            </button>

            <div className="carousel-indicators" id="carouselIndicators">
              {featuredMarkets.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`carousel-dot ${idx === carouselIndex ? "active" : ""}`}
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => setCarouselIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
           6. SEASONAL PICKS
      ========================== */}
      <section className="seasonal-picks-section">
        <div className="container">
          <div className="season-header-row">
            <div>
              <span className="section-kicker">WHAT'S IN SEASON</span>
              <h2 id="currentSeasonHeading">
                Fresh Picks This {currentSeason.name} {currentSeason.icon}
              </h2>
              <p>{currentSeason.description}. Harvested fresh by local growers at peak ripeness.</p>
            </div>
            <span
              className="season-live-badge"
              id="currentSeasonBadge"
              style={{ background: currentSeason.color }}
            >
              {currentSeason.icon} {currentSeason.name.toUpperCase()} PICKS
            </span>
          </div>

          <div className="season-picks-grid" id="seasonalPicksContainer">
            {seasonalProduce.map((p) => {
              const isSaved = isProduceSaved(p.id);
              return (
                <div
                  key={p.id}
                  className="seasonal-pick-card"
                  onClick={() => openProduceModal(p)}
                >
                  <div className="seasonal-pick-emoji">{p.image || "🌱"}</div>
                  <div className="seasonal-pick-info">
                    <span className="seasonal-pick-category">{p.category}</span>
                    <h4>{p.name}</h4>
                    <p>{p.shortDescription || p.description}</p>
                    <div className="seasonal-pick-footer">
                      <span className="seasonal-pick-season">{p.season}</span>
                      <button
                        type="button"
                        className={`pick-heart-btn ${isSaved ? "bookmarked" : ""}`}
                        aria-label="Bookmark"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProduceBookmark(p);
                        }}
                      >
                        {isSaved ? "♥" : "♡"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================
           7. HOW FRESHFIND WORKS
      ========================== */}
      <section className="how-section">
        <div className="container">
          <div
            className="center-heading"
            style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}
          >
            <span className="section-kicker">SIMPLE UX DESIGN</span>
            <h2>
              How <span>FreshFind</span> Works
            </h2>
            <p>Four easy steps to discover and enjoy the freshest produce from local growers.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">⌕</div>
              <h3>Discover</h3>
              <p>Find nearby farmers markets easily by area, neighborhood, or day of the week.</p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">◉</div>
              <h3>Explore</h3>
              <p>Check complete 7-day schedules, live open statuses, and expected seasonal produce.</p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">♡</div>
              <h3>Save</h3>
              <p>Bookmark your favorite markets and produce with temporary session notes for your trip.</p>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon">📍</div>
              <h3>Visit</h3>
              <p>Use coordinates and interactive maps to navigate and enjoy fresh food in person.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
           8. WHY FRESHFIND / BENEFITS
      ========================== */}
      <section className="benefits-section">
        <div className="container">
          <div
            className="center-heading"
            style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 30px" }}
          >
            <span className="section-kicker">WHY CHOOSE US</span>
            <h2>
              A Complete Platform for <span>Local Food Lovers</span>
            </h2>
            <p>Everything you need to support regional agriculture and enjoy high-quality local produce.</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-box">🏡</div>
              <div className="benefit-content">
                <h3>Local Markets</h3>
                <p>Direct access to verified farmers markets within your district and community.</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">🌿</div>
              <div className="benefit-content">
                <h3>Seasonal Produce</h3>
                <p>Understand which crops are at their natural peak of sweetness and nutritional value.</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">⚡</div>
              <div className="benefit-content">
                <h3>Easy Discovery</h3>
                <p>Fast keyword search across market names, descriptions, and fresh farm products.</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">📍</div>
              <div className="benefit-content">
                <h3>Location-Based Search</h3>
                <p>Calculate precise market distances in kilometers using your device's geolocation.</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">♥</div>
              <div className="benefit-content">
                <h3>Save Favorites</h3>
                <p>Keep saved bookmarks and session notes ready with client-side export options.</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box">🕒</div>
              <div className="benefit-content">
                <h3>Fresh Information</h3>
                <p>Real-time open/closed calculations, weekly operating tables, and seasonal calendars.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
           9. VISITOR COUNTER & STATS
      ========================== */}
      <section className="visitor-counter-bar">
        <div className="container visitor-counter-inner">
          <div className="visitor-counter-number" id="visitorCounterNumber">
            {visitorCount.toLocaleString()}+
          </div>
          <div className="visitor-counter-label">Visitors Exploring FreshFind</div>
          <div className="visitor-counter-note">
            (Simulated Visitor Counter — Updates locally via JavaScript)
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Farmers Markets</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Produce Types</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">7</span>
            <span className="stat-label">Days Covered</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Local Focus</span>
          </div>
        </div>
      </section>

      {/* =========================
           10. READY TO FIND CTA
      ========================== */}
      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta-box">
            <span className="section-kicker">START DISCOVERING</span>
            <h2>Ready to Find Something Fresh?</h2>
            <p>Explore your neighborhood markets, learn what's fresh this season, or plan your next market day visit right now.</p>
            <div className="home-cta-buttons">
              <Link to="/markets" className="primary-btn" style={{ padding: "13px 28px" }}>
                Find a Market <span>→</span>
              </Link>
              <Link to="/produce" className="primary-btn-outline" style={{ padding: "13px 28px" }}>
                Explore Produce <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
