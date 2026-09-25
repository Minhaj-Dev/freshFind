import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import marketsData from "../data/markets.json";
import produceData from "../data/produce.json";
import MarketCard from "../components/MarketCard";
import { calculateDistance, isMarketOpen } from "../utils/engine";
import { useModals } from "../context/ModalContext";

export default function Markets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useModals();

  const allMarkets = useMemo(() => Object.values(marketsData), []);
  const allProduce = useMemo(() => produceData, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedArea, setSelectedArea] = useState(searchParams.get("area") || "all");
  const [selectedDay, setSelectedDay] = useState(searchParams.get("day") || "all");
  const [selectedProduce, setSelectedProduce] = useState(searchParams.get("produce") || "all");
  const [sortBy, setSortBy] = useState("default");

  // Geolocation state
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const areasList = useMemo(() => {
    return Array.from(new Set(allMarkets.map((m) => m.area))).filter(Boolean).sort();
  }, [allMarkets]);

  // Handle Geolocation
  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      const msg = "Location is not supported by your browser.";
      setLocationStatus(msg);
      showToast(msg, "warning");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Detecting nearby coordinates...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        setUserCoords(coords);
        setLocationStatus(`Location active (${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)})`);
        setSortBy("nearest");
        showToast("Location detected! Sorted by nearest markets.", "success");
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        const msg = "Location access is required for distance-based features.";
        setLocationStatus(msg);
        showToast(msg, "info");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedArea("all");
    setSelectedDay("all");
    setSelectedProduce("all");
    setSortBy("default");
    setSearchParams({});
  };

  // Filter and Sort Logic
  const filteredMarkets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    let list = allMarkets.filter((m) => {
      // Search Match
      if (q) {
        const nameMatch = m.name?.toLowerCase().includes(q);
        const areaMatch = m.area?.toLowerCase().includes(q);
        const neighMatch = m.neighborhood?.toLowerCase().includes(q);
        const descMatch = m.description?.toLowerCase().includes(q);
        const prodMatch =
          Array.isArray(m.produceIds) &&
          m.produceIds.some((pId) => {
            const pObj = allProduce.find((p) => p.id === pId);
            return (
              pId.toLowerCase().includes(q) ||
              (pObj && pObj.name.toLowerCase().includes(q))
            );
          });

        if (!nameMatch && !areaMatch && !neighMatch && !descMatch && !prodMatch) {
          return false;
        }
      }

      // Area Filter
      if (selectedArea !== "all" && m.area?.toLowerCase() !== selectedArea.toLowerCase()) {
        return false;
      }

      // Day Filter
      if (selectedDay !== "all") {
        const inOperatingDays =
          Array.isArray(m.operatingDays) &&
          m.operatingDays.some((d) => d.toLowerCase() === selectedDay.toLowerCase());
        const inSchedule =
          Array.isArray(m.schedule) &&
          m.schedule.some((s) => s.day?.toLowerCase() === selectedDay.toLowerCase() && s.isOpen);
        if (!inOperatingDays && !inSchedule) {
          return false;
        }
      }

      // Produce Filter
      if (selectedProduce !== "all") {
        if (!Array.isArray(m.produceIds) || !m.produceIds.includes(selectedProduce)) {
          return false;
        }
      }

      return true;
    });

    // Distance Calculation
    const listWithDistance = list.map((m) => {
      const dist =
        userCoords != null
          ? calculateDistance(userCoords.lat, userCoords.lon, m.latitude, m.longitude)
          : null;
      return { ...m, _distance: dist };
    });

    // Sorting
    if (sortBy === "az") {
      listWithDistance.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "za") {
      listWithDistance.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "nearest") {
      listWithDistance.sort((a, b) => {
        if (a._distance == null) return 1;
        if (b._distance == null) return -1;
        return a._distance - b._distance;
      });
    } else if (sortBy === "next_open") {
      const order = { open: 0, soon: 1, closed: 2, closed_today: 3 };
      listWithDistance.sort((a, b) => {
        const sa = isMarketOpen(a).code;
        const sb = isMarketOpen(b).code;
        return (order[sa] || 9) - (order[sb] || 9);
      });
    }

    return listWithDistance;
  }, [allMarkets, allProduce, searchQuery, selectedArea, selectedDay, selectedProduce, sortBy, userCoords]);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="site-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep">›</span>
          <strong>Market Directory</strong>
        </div>
      </nav>

      <main>
        {/* HERO HEADER */}
        <section
          className="markets-hero"
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
                gap: "24px"
              }}
            >
              <div>
                <span className="section-kicker">LOCAL FARMERS MARKETS</span>
                <h1
                  style={{
                    fontSize: "42px",
                    color: "#173d2b",
                    fontWeight: 800,
                    margin: "8px 0 12px"
                  }}
                >
                  Farmers Market Directory
                </h1>
                <p
                  style={{
                    color: "#556b5d",
                    fontSize: "16px",
                    maxWidth: "600px",
                    margin: 0
                  }}
                >
                  Browse all community markets, check live operating hours and days, and find local fresh harvests near you.
                </p>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  padding: "16px 24px",
                  borderRadius: "16px",
                  border: "1px solid #d3e2d0",
                  textAlign: "center",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)"
                }}
              >
                <strong
                  id="marketResultCount"
                  style={{
                    fontSize: "36px",
                    color: "#173d2b",
                    fontFamily: "monospace",
                    display: "block",
                    lineHeight: 1
                  }}
                >
                  {allMarkets.length}
                </strong>
                <small
                  style={{
                    fontSize: "12px",
                    color: "#6a8c6f",
                    fontWeight: 700,
                    textTransform: "uppercase"
                  }}
                >
                  Markets Listed
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* DIRECTORY CONTROLS & GRID */}
        <section style={{ padding: "40px 0 70px" }}>
          <div className="container">
            {/* SEARCH BOX */}
            <div className="market-search-box">
              <input
                type="text"
                id="marketSearch"
                placeholder="Search market name, area, neighborhood, produce or description..."
                autoComplete="off"
                aria-label="Search markets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                id="marketSearchBtn"
                className="primary-btn"
                style={{ borderRadius: "12px" }}
              >
                Search <span>⌕</span>
              </button>
            </div>

            {/* FILTERS & GEOLOCATION BAR */}
            <div className="market-filter-area">
              <div className="filter-item">
                <label htmlFor="areaFilter">Area</label>
                <select
                  id="areaFilter"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="all">All Areas</option>
                  {areasList.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="dayFilter">Market Day</label>
                <select
                  id="dayFilter"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  <option value="all">All Days</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="produceFilter">Produce Available</label>
                <select
                  id="produceFilter"
                  value={selectedProduce}
                  onChange={(e) => setSelectedProduce(e.target.value)}
                >
                  <option value="all">All Produce</option>
                  {allProduce.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.image || "🌱"} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="sortMarkets">Sort By</label>
                <select
                  id="sortMarkets"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="az">A–Z (Name)</option>
                  <option value="za">Z–A (Name)</option>
                  <option value="nearest">Nearest First</option>
                  <option value="next_open">Next Open / Status</option>
                </select>
              </div>

              <div className="location-btn-item">
                <button
                  type="button"
                  className={`location-btn ${isLocating ? "loading" : ""} ${userCoords ? "active" : ""}`}
                  id="useLocationBtn"
                  onClick={handleLocationClick}
                >
                  <span>{userCoords ? "✓" : "📍"}</span>{" "}
                  {userCoords ? "Location Active" : "Use My Location"}
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="button"
                  className="btn-clear-filters"
                  id="clearFiltersBtn"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Location Status Message */}
            {locationStatus && (
              <div
                id="locationStatusText"
                style={{
                  fontSize: "13px",
                  color: "#5e7867",
                  marginBottom: "20px",
                  fontWeight: 600
                }}
              >
                {locationStatus}
              </div>
            )}

            {/* Result Count Headline */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
              }}
            >
              <span
                id="marketResultLabel"
                style={{ fontSize: "14px", fontWeight: 700, color: "#3b5a45" }}
              >
                Showing {filteredMarkets.length} of {allMarkets.length} Farmers Markets
              </span>
            </div>

            {/* MARKET CARDS DIRECTORY */}
            {filteredMarkets.length === 0 ? (
              <div
                id="noMarketsFound"
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "#ffffff",
                  border: "1px dashed #cfd9cb",
                  borderRadius: "16px",
                  marginTop: "30px"
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧺</div>
                <h3
                  style={{
                    fontSize: "22px",
                    color: "#173d2b",
                    fontWeight: 800,
                    marginBottom: "6px"
                  }}
                >
                  No Markets Found
                </h3>
                <p style={{ color: "#6a7c6f", fontSize: "14px", marginBottom: "20px" }}>
                  No farmers markets match your currently selected search and filter criteria.
                </p>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleClearAll}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="market-directory-grid" id="marketDirectory">
                {filteredMarkets.map((m) => (
                  <MarketCard key={m.id} market={m} distance={m._distance} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
