import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import produceData from "../data/produce.json";
import { getCurrentSeason } from "../utils/engine";
import { useBookmarks } from "../context/BookmarkContext";
import { useModals } from "../context/ModalContext";

export default function Produce() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isProduceSaved, toggleProduceBookmark } = useBookmarks();
  const { openProduceModal } = useModals();

  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );

  const season = useMemo(() => getCurrentSeason(), []);

  // Check URL param for direct item modal opening
  useEffect(() => {
    const itemId = searchParams.get("item");
    if (itemId) {
      const found = produceData.find((p) => p.id === itemId);
      if (found) {
        openProduceModal(found);
      }
    }
  }, [searchParams, openProduceModal]);

  const seasonalItems = useMemo(() => {
    return produceData.filter(
      (p) =>
        p.season.toLowerCase() === season.name.toLowerCase() ||
        p.season.toLowerCase() === "all seasons"
    );
  }, [season]);

  const filteredProduce = useMemo(() => {
    const q = searchVal.toLowerCase().trim();
    const cat = selectedCategory.toLowerCase();

    return produceData.filter((p) => {
      // Category filter
      if (cat !== "all") {
        if (p.category.toLowerCase() !== cat && !p.category.toLowerCase().includes(cat)) {
          return false;
        }
      }

      // Search query
      if (q) {
        const nameMatch = p.name.toLowerCase().includes(q);
        const descMatch =
          (p.description || "").toLowerCase().includes(q) ||
          (p.shortDescription || "").toLowerCase().includes(q);
        const catMatch = p.category.toLowerCase().includes(q);
        const seasonMatch = p.season.toLowerCase().includes(q);

        if (!nameMatch && !descMatch && !catMatch && !seasonMatch) {
          return false;
        }
      }

      return true;
    });
  }, [searchVal, selectedCategory]);

  const handleResetFilters = () => {
    setSearchVal("");
    setSelectedCategory("all");
    setSearchParams({});
  };

  const categories = ["all", "Fruits", "Vegetables", "Herbs", "Dairy", "Other"];

  return (
    <>
      {/* Breadcrumb */}
      <nav className="site-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep">›</span>
          <strong>Produce Guide</strong>
        </div>
      </nav>

      <main>
        {/* PRODUCE HERO */}
        <section
          className="produce-hero"
          style={{
            background: "#eef3eb",
            padding: "48px 0",
            borderBottom: "1px solid #dce8da"
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "30px"
            }}
          >
            <div style={{ maxWidth: "650px" }}>
              <span className="section-kicker">SEASONAL PRODUCE CATALOGUE</span>
              <h1
                style={{
                  fontSize: "42px",
                  color: "#173d2b",
                  fontWeight: 800,
                  margin: "8px 0 14px"
                }}
              >
                Fresh Produce Guide
              </h1>
              <p
                style={{
                  color: "#556b5d",
                  fontSize: "16px",
                  margin: 0,
                  lineHeight: 1.6
                }}
              >
                Know what is currently in season, explore nutritional benefits, and easily identify which community farmers markets carry each item.
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "20px",
                borderRadius: "20px",
                border: "1px solid #d5e5cf",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.03)"
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  textAlign: "center"
                }}
              >
                <span>🍅</span>
                <span>🥭</span>
                <span>🍎</span>
                <span>🌿</span>
              </div>
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "16px",
                    color: "#173d2b"
                  }}
                >
                  Farm to Table
                </strong>
                <small
                  style={{
                    color: "#6a8c6f",
                    fontWeight: 700,
                    textTransform: "uppercase"
                  }}
                >
                  100% Local Variety
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* DYNAMIC SEASONAL RECOMMENDATIONS BANNER */}
        <section
          style={{
            padding: "24px 0",
            background: "#ffffff",
            borderBottom: "1px solid #eef2ec"
          }}
        >
          <div className="container" id="seasonalRecommendationBanner">
            <div
              className="seasonal-banner-inner"
              style={{ borderLeft: `5px solid ${season.color}` }}
            >
              <div className="season-badge-pill">
                <span className="season-icon">{season.icon}</span>
                <strong>CURRENT SEASON: {season.name.toUpperCase()}</strong>
              </div>
              <p className="season-desc">
                {season.description}. Locally harvested at peak sweetness right now.
              </p>
              <div className="season-quick-tags">
                {seasonalItems.map((p) => (
                  <span
                    key={p.id}
                    className="season-item-tag"
                    onClick={() => openProduceModal(p)}
                  >
                    {p.image || "🌱"} {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH & CATEGORY FILTERS */}
        <section style={{ padding: "40px 0 70px" }}>
          <div className="container">
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e1dcce",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.02)",
                marginBottom: "36px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                  flexWrap: "wrap"
                }}
              >
                <input
                  type="text"
                  id="produceSearch"
                  placeholder="Search produce by name, description, season or category..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "260px",
                    padding: "12px 18px",
                    border: "1px solid #cdd7c8",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <button
                  type="button"
                  id="produceSearchBtn"
                  className="primary-btn"
                  style={{ borderRadius: "10px" }}
                >
                  Search Produce <span>⌕</span>
                </button>
              </div>

              {/* Category Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  alignItems: "center"
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#6a7c6e",
                    textTransform: "uppercase",
                    marginRight: "6px"
                  }}
                >
                  Category:
                </span>
                {categories.map((cat) => {
                  const isActive =
                    selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`produce-category-btn filter-btn ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === "all" ? "All" : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  color: "#173d2b",
                  fontWeight: 800,
                  margin: 0
                }}
              >
                Fresh Produce Catalogue
              </h2>
              <span
                id="produceCount"
                style={{
                  background: "#eef5eb",
                  color: "#2d6547",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700
                }}
              >
                {filteredProduce.length}{" "}
                {filteredProduce.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* PRODUCE CARDS GRID */}
            {filteredProduce.length === 0 ? (
              <div
                id="noProduceFound"
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "#ffffff",
                  border: "1px dashed #d5d1c5",
                  borderRadius: "16px",
                  marginTop: "30px"
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🥗</div>
                <h3
                  style={{
                    fontSize: "22px",
                    color: "#173d2b",
                    fontWeight: 800,
                    marginBottom: "6px"
                  }}
                >
                  No Produce Found
                </h3>
                <p
                  style={{
                    color: "#6a7c6f",
                    fontSize: "14px",
                    marginBottom: "20px"
                  }}
                >
                  No produce items matched your search or category filter.
                </p>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="produce-grid-catalogue" id="produceGrid">
                {filteredProduce.map((p) => {
                  const isSaved = isProduceSaved(p.id);
                  return (
                    <div
                      key={p.id}
                      className="produce-card"
                      onClick={() => openProduceModal(p)}
                    >
                      <div className="produce-card-top">
                        <span className="produce-card-emoji">
                          {p.image || "🌱"}
                        </span>
                        <button
                          type="button"
                          className={`produce-card-bookmark ${
                            isSaved ? "bookmarked" : ""
                          }`}
                          aria-label="Bookmark produce"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProduceBookmark(p);
                          }}
                        >
                          {isSaved ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="produce-card-body">
                        <div className="produce-badges-row">
                          <span className="badge-category">{p.category}</span>
                          <span className="badge-season">{p.season}</span>
                        </div>
                        <h3>{p.name}</h3>
                        <p>{p.shortDescription || p.description}</p>

                        <div className="produce-card-actions">
                          <button
                            type="button"
                            className="primary-btn-outline small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openProduceModal(p);
                            }}
                          >
                            Quick View
                          </button>
                          <span className="produce-market-count">
                            {p.marketIds?.length || 0} markets
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
