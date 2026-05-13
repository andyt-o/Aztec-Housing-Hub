import { useState } from "react";
import { ContactListerPopup } from "../popups";

const roommateStatusLabel = {
  looking: "Looking for roommates",
  lookingToRoom: "Looking to room with others",
  notLooking: "Not looking for roommates",
};

const roommateStatusFilterOptions = [
  { value: "all", label: "All" },
  { value: "looking", label: "Looking for roommates" },
  { value: "lookingToRoom", label: "Looking to room with others" },
  { value: "notLooking", label: "Not looking for roommates" },
];

export default function ListingsPage({
  onCampusHousing = [],
  offCampusListings = [],
  housingTypes = [],
  priceRanges = [],
  bedOptions = [],
  preferences = {},
  setPreferences,
  currentUser,
  navigateTo,
  onTrackClick,
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
  const [roommateStatusFilter, setRoommateStatusFilter] = useState("all");

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
    const matchesRoommateStatus =
      roommateStatusFilter === "all" || listing.roommateStatus === roommateStatusFilter;
    return matchesSearch && matchesType && matchesPrice && matchesBeds && matchesRoommateStatus;
  });

  function handlePlacementChange(value) {
    if (setPreferences) {
      setPreferences((c) => ({ ...c, housingPlacement: value }));
    }
  }

  function handleListingClick(listing) {
    if (onTrackClick) {
      onTrackClick(listing.id);
    }
    if (listing.placement === "onCampus" && listing.url) {
      window.open(listing.url, "_blank", "noopener,noreferrer");
    } else if (!currentUser) {
      navigateTo("auth");
    } else {
      setSelectedListing(listing);
    }
  }

  function handleContactClick(listing) {
    if (!currentUser) {
      navigateTo("auth");
      return;
    }
    if (onTrackClick) onTrackClick(listing.id);
    setSelectedListing(listing);
  }

  // ── FilterSection ──
  function FilterSection({ typeLabel, types, selectedType, onTypeChange, priceKey, bedKey, showRoommateFilter }) {
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

        {showRoommateFilter && (
          <div className="filter-group">
            <label>Roommate Status</label>
            <select
              className="filter-select"
              value={roommateStatusFilter}
              onChange={(e) => setRoommateStatusFilter(e.target.value)}
            >
              {roommateStatusFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
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
              <article
                className="listing-card"
                key={listing.id}
                onClick={() => handleListingClick(listing)}
                role="button"
                tabIndex={0}
                aria-label={`View ${listing.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleListingClick(listing);
                  }
                }}
              >
                <div className="card-type-badge">{listing.type || "Traditional"}</div>
                <h4>{listing.title}</h4>
                <p className="card-meta">{listing.area}</p>
                <p className="card-meta">
                  {listing.beds} Bed / {listing.baths} Bath
                </p>
                <p className="card-author">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Posted by {(listing.ownerName || listing.ownerEmail || "").split("@")[0].replace(/[._]/g, " ") || "N/A"}
                </p>
                <div className="card-footer-row">
                  <span className="card-clicks">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {listing.clicks ?? 0}
                  </span>
                  <a
                    className="contact-btn"
                    style={{ marginTop: "0", display: "inline-block" }}
                    href={listing.url || "https://housing.sdsu.edu/communities"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTrackClick) onTrackClick(listing.id);
                    }}
                  >
                    View on SDSU Housing &#8599;
                  </a>
                </div>
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
          showRoommateFilter
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
                <article
                  className="listing-card"
                  key={listing.id}
                  onClick={() => handleListingClick(listing)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${listing.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleListingClick(listing);
                    }
                  }}
                >
                  <div className="card-type-badge">Sublease</div>
                  <h4>{listing.title}</h4>
                  <p className="card-meta">
                    {listing.area} &bull; {listing.distance} mi from campus
                  </p>
                  <p className="card-meta">
                    {listing.beds} Bed / {listing.baths} Bath
                  </p>
                  <p className="card-description">{listing.description}</p>
                  {listing.roommateStatus && listing.roommateStatus !== "" && (
                    <span className="roommate-status-badge">
                      {roommateStatusLabel[listing.roommateStatus] || listing.roommateStatus}
                    </span>
                  )}
                  <div className="card-footer-row">
                    <span className="card-clicks">
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                      {listing.clicks ?? 0}
                    </span>
                    <button
                      className="contact-btn"
                      style={{ marginTop: "0", display: "inline-block", width: "auto", flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactClick(listing);
                      }}
                    >
                      Contact Lister
                    </button>
                  </div>
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
                onClick={() => handleListingClick(listing)}
                role="button"
                tabIndex={0}
                aria-label={`View ${listing.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleListingClick(listing);
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
                {listing.roommateStatus && listing.roommateStatus !== "" && (
                    <span className="roommate-status-badge">
                      {roommateStatusLabel[listing.roommateStatus] || listing.roommateStatus}
                    </span>
                  )}
                  <div className="card-footer-row">
                    <span className="card-clicks">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {listing.clicks ?? 0}
                    </span>
                    <p className="card-author">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {(listing.ownerName || listing.ownerEmail || "").split("@")[0].replace(/[._]/g, " ") || "N/A"}
                    </p>
                  </div>
                  <button
                    className="contact-btn"
                    style={{ marginTop: "0.75rem", display: "inline-block", width: "100%" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactClick(listing);
                    }}
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
          onTrackClick={onTrackClick}
        />
      )}
    </>
  );
}