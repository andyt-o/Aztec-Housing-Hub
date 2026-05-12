import { useState } from "react";
import { ContactListerPopup } from "../popups";

export default function ListingsPage({
  onCampusHousing = [],
  offCampusListings = [],
  housingTypes = [],
  priceRanges = [],
  bedOptions = [],
  preferences = {},
  setPreferences,
  currentUser,
}) {
  // ── Independent search state per panel ──
  const [onCampusSearch, setOnCampusSearch] = useState("");
  const [offCampusSearch, setOffCampusSearch] = useState("");

  // ── Independent filter state per panel ──
  const [selectedOnCampusType, setSelectedOnCampusType] = useState("All");
  const [selectedOffCampusType, setSelectedOffCampusType] = useState("All");
  const [selectedOnCampusPrice, setSelectedOnCampusPrice] = useState(0);
  const [selectedOffCampusPrice, setSelectedOffCampusPrice] = useState(0);
  const [selectedOnCampusBeds, setSelectedOnCampusBeds] = useState("Any");
  const [selectedOffCampusBeds, setSelectedOffCampusBeds] = useState("Any");

  // ── Modal state ──
  const [selectedListing, setSelectedListing] = useState(null);

  // ── Placement from global preference ──
  const placement = preferences.housingPlacement || "both";
  const showOnCampus = placement === "both" || placement === "onCampus";
  const showOffCampus = placement === "both" || placement === "offCampus";
  const isBoth = placement === "both";

  // ── Type lists ──
  const onCampusTypes = ["All", ...new Set(onCampusHousing.map((l) => l.type).filter(Boolean))];
  const offCampusTypes =
    housingTypes.length > 0 ? housingTypes : ["All", ...new Set(offCampusListings.map((l) => l.type).filter(Boolean))];

  // ── Filtered results ──
  const filteredOnCampus = onCampusHousing.filter((listing) => {
    const q = onCampusSearch.toLowerCase();
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
      (selectedOnCampusBeds === "4+" ? listing.beds >= 4 : listing.beds === Number(selectedOnCampusBeds));
    return matchesSearch && matchesType && matchesPrice && matchesBeds;
  });

  const subleaseListings = offCampusListings.filter((l) => l.type === "Sublease");

  const filteredOffCampus = offCampusListings.filter((listing) => {
    const q = offCampusSearch.toLowerCase();
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
      (selectedOffCampusBeds === "4+" ? listing.beds >= 4 : listing.beds === Number(selectedOffCampusBeds));
    return matchesSearch && matchesType && matchesPrice && matchesBeds;
  });

  function handlePlacementChange(value) {
    if (setPreferences) {
      setPreferences((c) => ({ ...c, housingPlacement: value }));
    }
  }

  // ── FilterSection ──
  function FilterSection({ typeLabel, types, selectedType, onTypeChange, priceKey, bedKey }) {
    const isOnCampus = priceKey === "onCampus";
    const price = isOnCampus ? selectedOnCampusPrice : selectedOffCampusPrice;
    const setPrice = isOnCampus ? setSelectedOnCampusPrice : setSelectedOffCampusPrice;
    const beds = isOnCampus ? selectedOnCampusBeds : selectedOffCampusBeds;
    const setBeds = isOnCampus ? setSelectedOnCampusBeds : setSelectedOffCampusBeds;

    return (
      <div className="panel-filters">
        <div className="filter-group">
          <div className="search-header">Type</div>
          <div className="filter-chips">
            {types.map((t) => (
              <button
                key={t}
                className={`filter-chip-btn${selectedType === t ? " active" : ""}`}
                onClick={() => onTypeChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Price Range</label>
            <select
              className="filter-select"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
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
                  className={`filter-chip-btn${beds === bed ? " active" : ""}`}
                  onClick={() => setBeds(bed)}
                >
                  {bed === "Any" ? "Any" : `${bed} Bed`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function OnCampusPanel() {
    return (
      <div className={`on-campus-panel${isBoth ? " half" : " full"}`}>
        <div className="on-campus-header">
          <h3>SDSU On-Campus Housing</h3>
          <p className="housing-note">
            Browse all {filteredOnCampus.length} residence community
            {filteredOnCampus.length !== 1 ? "s" : ""} managed by SDSU Housing.
          </p>
        </div>

        <div className="filters-bar">
          <div className="filter-search-row">
            <div className="filter-search-col">
              <div className="search-header">Search On-Campus</div>
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, area, or keyword..."
                value={onCampusSearch}
                onChange={(e) => setOnCampusSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <FilterSection
          typeLabel="Type"
          types={onCampusTypes}
          selectedType={selectedOnCampusType}
          onTypeChange={setSelectedOnCampusType}
          priceKey="onCampus"
          bedKey="onCampus"
        />

        {filteredOnCampus.length === 0 ? (
          <div className="no-results">
            <p>
              {onCampusSearch || selectedOnCampusType !== "All"
                ? "No on-campus listings match your filters."
                : "No on-campus listings available."}
            </p>
          </div>
        ) : (
          <div className="listing-grid">
            {filteredOnCampus.map((listing) => (
              <article className="listing-card" key={listing.id}>
                <div className="card-type-badge">{listing.type || "Traditional"}</div>
                <h4>{listing.title}</h4>
                <p className="card-meta">{listing.area}</p>
                <p className="card-meta">
                  {listing.beds} Bed / {listing.baths} Bath
                </p>
                <a
                  className="contact-btn"
                  style={{ marginTop: "0.75rem", display: "inline-block" }}
                  href={listing.url || "https://housing.sdsu.edu/communities"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on SDSU Housing &#8599;
                </a>
              </article>
            ))}
          </div>
        )}

        <div className="on-campus-footer">
          <a className="sdsu-link" href="https://housing.sdsu.edu/communities" target="_blank" rel="noopener noreferrer">
            View All SDSU Communities &#8599;
          </a>
        </div>
      </div>
    );
  }

  function OffCampusPanel() {
    return (
      <div className={`off-campus-panel${isBoth ? " half" : " full"}`}>
        <div className="off-campus-header">
          <h3>Off-Campus Listings</h3>
          <p className="housing-note">
            {filteredOffCampus.length} housing option
            {filteredOffCampus.length !== 1 ? "s" : ""} near SDSU
          </p>
        </div>

        <div className="filters-bar">
          <div className="filter-search-row">
            <div className="filter-search-col">
              <div className="search-header">Search Off-Campus</div>
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, area, or keyword..."
                value={offCampusSearch}
                onChange={(e) => setOffCampusSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <FilterSection
          typeLabel="Type"
          types={offCampusTypes}
          selectedType={selectedOffCampusType}
          onTypeChange={setSelectedOffCampusType}
          priceKey="offCampus"
          bedKey="offCampus"
        />

        {/* Sublease Hub */}
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
                  <button
                    className="contact-btn"
                    style={{ marginTop: "0.75rem", display: "inline-block", width: "100%" }}
                    onClick={() => setSelectedListing(listing)}
                  >
                    Contact Lister
                  </button>
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
              <article className="listing-card" key={listing.id}>
                <div className="card-type-badge">{listing.type}</div>
                <h4>{listing.title}</h4>
                <p className="card-meta">
                  {listing.area} &bull; {listing.distance} mi from campus
                </p>
                <p className="card-meta">
                  {listing.beds} Bed / {listing.baths} Bath
                </p>
                <button
                  className="contact-btn"
                  style={{ marginTop: "0.75rem", display: "inline-block", width: "100%" }}
                  onClick={() => setSelectedListing(listing)}
                >
                  Contact Lister
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    );
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
            className={`placement-toggle-btn${isBoth ? " active" : ""}`}
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

        {/* ── Listing Panels ── */}
        <div className={`listings-split-layout${isBoth ? " both" : ""}`}>
          {showOnCampus && <OnCampusPanel />}
          {showOffCampus && <OffCampusPanel />}
        </div>
      </main>

      {/* ── Contact Lister Popup for off-campus listings ── */}
      {selectedListing && (
        <ContactListerPopup
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </>
  );
}