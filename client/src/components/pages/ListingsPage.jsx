import { useState } from "react";

export default function ListingsPage({
  onCampusHousing = [],
  offCampusListings = [],
  housingTypes = [],
  priceRanges = [],
  bedOptions = [],
  preferences = {},
  setPreferences,
}) {
  const [search, setSearch] = useState("");
  const [selectedOnCampusType, setSelectedOnCampusType] = useState("All");
  const [selectedOffCampusType, setSelectedOffCampusType] = useState("All");
  const [selectedOnCampusPrice, setSelectedOnCampusPrice] = useState(0);
  const [selectedOffCampusPrice, setSelectedOffCampusPrice] = useState(0);
  const [selectedOnCampusBeds, setSelectedOnCampusBeds] = useState("Any");
  const [selectedOffCampusBeds, setSelectedOffCampusBeds] = useState("Any");
  const [expandedId, setExpandedId] = useState(null);

  // Derive placement from the single global preference
  const placement = preferences.housingPlacement || "both";
  const showOnCampus = placement === "both" || placement === "onCampus";
  const showOffCampus = placement === "both" || placement === "offCampus";
  const isBoth = placement === "both";

// Derive on-campus types from data, off-campus types from config (since data may be empty)
  const onCampusTypes = ["All", ...new Set(onCampusHousing.map((l) => l.type).filter(Boolean))];
  const offCampusTypes = housingTypes.length > 0 ? housingTypes : ["All", ...new Set(offCampusListings.map((l) => l.type).filter(Boolean))];

  // ── On-campus filters ──
  const filteredOnCampus = onCampusHousing.filter((listing) => {
    const q = search.toLowerCase();
    const matchesSearch =
      listing.title.toLowerCase().includes(q) ||
      listing.area.toLowerCase().includes(q) ||
      (listing.description || "").toLowerCase().includes(q);
    const matchesType = selectedOnCampusType === "All" || listing.type === selectedOnCampusType;
    const range = priceRanges[selectedOnCampusPrice];
    if (!range) return false;
    const matchesPrice = listing.price >= range.min && listing.price <= range.max;
    const matchesBeds =
      selectedOnCampusBeds === "Any" ||
      (selectedOnCampusBeds === "4+"
        ? listing.beds >= 4
        : listing.beds === Number(selectedOnCampusBeds));
    return matchesSearch && matchesType && matchesPrice && matchesBeds;
  });

  // Separate sublease listings for the dedicated hub section
  const subleaseListings = offCampusListings.filter((l) => l.type === "Sublease");

  // ── Off-campus filters ──
  const filteredOffCampus = offCampusListings.filter((listing) => {
    const q = search.toLowerCase();
    const matchesSearch =
      listing.title.toLowerCase().includes(q) ||
      listing.area.toLowerCase().includes(q) ||
      (listing.description || "").toLowerCase().includes(q);
    const matchesType = selectedOffCampusType === "All" || listing.type === selectedOffCampusType;
    const range = priceRanges[selectedOffCampusPrice];
    if (!range) return false;
    const matchesPrice = listing.price >= range.min && listing.price <= range.max;
    const matchesBeds =
      selectedOffCampusBeds === "Any" ||
      (selectedOffCampusBeds === "4+"
        ? listing.beds >= 4
        : listing.beds === Number(selectedOffCampusBeds));
    return matchesSearch && matchesType && matchesPrice && matchesBeds;
  });

  function handlePlacementChange(value) {
    if (setPreferences) {
      setPreferences((c) => ({ ...c, housingPlacement: value }));
    }
  }

  return (
    <>
      {/* ── Red Banner ── */}
      <div className="page-banner listings-page-banner">
        <div className="page-banner-inner">
          <p className="eyebrow">SDSU Housing Hub</p>
          <h2>Browse Listings</h2>
          <p>Explore on-campus residence halls and off-campus housing near San Diego State University.</p>
        </div>
      </div>

      <main className="page-content">
        {/* ── Placement Toggle Bar ── */}
        <div className="placement-toggle-bar">
          <button
            type="button"
            className={`placement-toggle-btn${showOnCampus && !showOffCampus ? " active" : ""}`}
            onClick={() => handlePlacementChange("onCampus")}
          >
            On-Campus Housing
          </button>
          <button
            type="button"
            className={`placement-toggle-btn${showOnCampus && showOffCampus ? " active" : ""}`}
            onClick={() => handlePlacementChange("both")}
          >
            Both
          </button>
          <button
            type="button"
            className={`placement-toggle-btn${!showOnCampus && showOffCampus ? " active" : ""}`}
            onClick={() => handlePlacementChange("offCampus")}
          >
            Off-Campus Housing
          </button>
        </div>

        {/* ── Shared Search Bar ── */}
        <div className="filters-bar">
          <div className="filter-search-row">
            <div className="filter-search-col">
              <div className="search-header">Search</div>
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, area, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Listing Panels ── */}
        <div className={`listings-split-layout${isBoth ? " both" : ""}`}>
          {/* ── On-Campus Housing ── */}
          {showOnCampus && (
            <div className={`on-campus-panel${isBoth ? " half" : " full"}`}>
              <div className="on-campus-header">
                <h3>SDSU On-Campus Housing</h3>
                <p className="housing-note">
                  Browse all {filteredOnCampus.length} residence community
                  {filteredOnCampus.length !== 1 ? "s" : ""} managed by SDSU Housing.
                </p>
              </div>

              {/* On-Campus Filters */}
              <div className="panel-filters">
                <div className="filter-group">
                  <div className="search-header">Type</div>
                  <div className="filter-chips">
                    {onCampusTypes.map((type) => (
                      <button
                        key={type}
                        className={`filter-chip-btn${selectedOnCampusType === type ? " active" : ""}`}
                        onClick={() => setSelectedOnCampusType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-row">
                  <div className="filter-group">
                    <label>Price Range</label>
                    <select
                      className="filter-select"
                      value={selectedOnCampusPrice}
                      onChange={(e) => setSelectedOnCampusPrice(Number(e.target.value))}
                    >
                      {priceRanges.map((range, i) => (
                        <option key={range.label} value={i}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Bedrooms</label>
                    <div className="filter-chips">
                      {bedOptions.map((bed) => (
                        <button
                          key={bed}
                          className={`filter-chip-btn${
                            selectedOnCampusBeds === bed ? " active" : ""
                          }`}
                          onClick={() => setSelectedOnCampusBeds(bed)}
                        >
                          {bed === "Any" ? "Any" : `${bed} Bed`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {filteredOnCampus.length === 0 ? (
                <div className="no-results">
                  <p>
                    {search || selectedOnCampusType !== "All"
                      ? "No on-campus listings match your filters."
                      : "No on-campus listings available."}
                  </p>
                </div>
              ) : (
                <div className="listing-grid">
                  {filteredOnCampus.map((listing) => (
                    <article className="listing-card" key={listing.id}>
                      <div className="card-type-badge">{listing.type || "On-Campus"}</div>
                      <h4>{listing.title}</h4>
                      <p className="card-meta">{listing.area}</p>
                      <p className="card-meta">
                        {listing.beds} Bed / {listing.baths} Bath
                      </p>
                      <a
                        href={
                          listing.url || "https://housing.sdsu.edu/communities"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-btn"
                        style={{ marginTop: "0.5rem", display: "inline-block" }}
                      >
                        View on SDSU Housing &#8599;
                      </a>
                    </article>
                  ))}
                </div>
              )}

              <div className="on-campus-footer">
                <a
                  className="sdsu-link"
                  href="https://housing.sdsu.edu/communities"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View All SDSU Communities &#8599;
                </a>
              </div>
            </div>
          )}

          {/* ── Off-Campus Listings ── */}
          {showOffCampus && (
            <div className={`off-campus-panel${isBoth ? " half" : " full"}`}>
              <div className="off-campus-header">
                <h3>Off-Campus Listings</h3>
                <p className="housing-note">
                  {filteredOffCampus.length} housing option
                  {filteredOffCampus.length !== 1 ? "s" : ""} near SDSU
                </p>
              </div>

              {/* Off-Campus Filters */}
              <div className="panel-filters">
                <div className="filter-group">
                  <div className="search-header">Type</div>
                  <div className="filter-chips">
                    {offCampusTypes.map((type) => (
                      <button
                        key={type}
                        className={`filter-chip-btn${selectedOffCampusType === type ? " active" : ""}`}
                        onClick={() => setSelectedOffCampusType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-row">
                  <div className="filter-group">
                    <label>Price Range</label>
                    <select
                      className="filter-select"
                      value={selectedOffCampusPrice}
                      onChange={(e) => setSelectedOffCampusPrice(Number(e.target.value))}
                    >
                      {priceRanges.map((range, i) => (
                        <option key={range.label} value={i}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Bedrooms</label>
                    <div className="filter-chips">
                      {bedOptions.map((bed) => (
                        <button
                          key={bed}
                          className={`filter-chip-btn${
                            selectedOffCampusBeds === bed ? " active" : ""
                          }`}
                          onClick={() => setSelectedOffCampusBeds(bed)}
                        >
                          {bed === "Any" ? "Any" : `${bed} Bed`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {subleaseListings.length > 0 && (
                <div className="sublease-hub">
                  <h4>Sublease Hub</h4>
                  <p className="listings-page-subtitle">
                    {subleaseListings.length} student sublease post
                    {subleaseListings.length !== 1 ? "s" : ""} in one place
                  </p>
                  <div className="listing-grid">
                    {subleaseListings.map((listing) => (
                      <article className="listing-card" key={listing.id}>
                        <div className="card-type-badge">Sublease</div>
                        <h4>{listing.title}</h4>
                        <p className="card-meta">
                          {listing.area} &bull; {listing.distance} mi from campus
                        </p>
                        <p className="card-meta">
                          {listing.beds} Bed / {listing.baths} Bath
                        </p>
                        <p className="card-description">{listing.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {filteredOffCampus.length === 0 ? (
                <div className="no-results">
                  <p>No listings match your filters. Try broadening your search.</p>
                </div>
              ) : (
                <div className="listing-grid">
                  {filteredOffCampus.map((listing) => (
                    <article
                      className="listing-card"
                      key={listing.id}
                      onClick={() =>
                        setExpandedId(
                          expandedId === listing.id ? null : listing.id
                        )
                      }
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${listing.title}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedId(
                            expandedId === listing.id ? null : listing.id
                          );
                        }
                      }}
                    >
                      <div className="card-type-badge">{listing.type}</div>
                      <h4>{listing.title}</h4>
                      <p className="card-meta">
                        {listing.area} &bull; {listing.distance} mi from campus
                      </p>
                      <p className="card-meta">
                        {listing.beds} Bed / {listing.baths} Bath
                      </p>

                      {expandedId === listing.id && (
                        <div className="card-expanded">
                          <p className="card-description">
                            {listing.description}
                          </p>
                          <button
                            className="contact-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert("Contact feature coming in Sprint 2!");
                            }}
                          >
                            Contact Lister
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}