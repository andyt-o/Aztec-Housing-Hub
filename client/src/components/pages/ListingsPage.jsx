import { useState } from "react";

export default function Listings({
  offCampusListings = [],
  housingTypes = [],
  priceRanges = [],
  bedOptions = [],
  onTrackClick = () => {},
  currentUser = null,
}) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedBeds, setSelectedBeds] = useState("Any");
  const [expandedId, setExpandedId] = useState(null);

  const subleaseListings = offCampusListings.filter(
    (l) => l.type === "Sublease"
  );

  const filtered = offCampusListings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.area.toLowerCase().includes(search.toLowerCase()) ||
      listing.description.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedType === "All" || listing.type === selectedType;

    const range = priceRanges[selectedPrice];
    if (!range) return false;
    const matchesPrice =
      listing.price >= range.min && listing.price <= range.max;

    const matchesBeds =
      selectedBeds === "Any" ||
      (selectedBeds === "4+"
        ? listing.beds >= 4
        : listing.beds === Number(selectedBeds));

    return matchesSearch && matchesType && matchesPrice && matchesBeds;
  });

  return (
    <>
      <div className="page-banner">
        <div className="page-banner-inner">
          <p className="eyebrow">Listings</p>
          <h2>Browse Housing Options</h2>
          <p>
            {filtered.length} housing option
            {filtered.length !== 1 ? "s" : ""} near SDSU
          </p>
        </div>
      </div>

      <main className="page-content">
        {subleaseListings.length > 0 && (
          <div className="sublease-hub">
            <h3>Sublease Hub</h3>
            <p className="listings-page-subtitle">
              {subleaseListings.length} student sublease post
              {subleaseListings.length !== 1 ? "s" : ""} in one place
            </p>
            <div className="listing-grid">
              {subleaseListings.map((listing) => (
                <article className="listing-card" key={listing.id}>
                  <div className="card-type-badge">Sublease</div>
                  <h4>{listing.title}</h4>
                  <p className="card-price">
                    ${listing.price.toLocaleString()} / month
                  </p>
                  <p className="card-meta">
                    {listing.area} &bull; {listing.distance} mi from campus
                  </p>
                  <p className="card-meta">
                    {listing.beds} Bed / {listing.baths} Bath
                  </p>
                  <p className="card-availability">{listing.availability}</p>
                  <p className="card-description">{listing.description}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="filters-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, area, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filter-row">
            <div className="filter-group">
              <label>Housing Type</label>
              <div className="filter-chips">
                {housingTypes.map((type) => (
                  <button
                    key={type}
                    className={`filter-chip-btn ${
                      selectedType === type ? "active" : ""
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <select
                className="filter-select"
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(Number(e.target.value))}
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
                    className={`filter-chip-btn ${
                      selectedBeds === bed ? "active" : ""
                    }`}
                    onClick={() => setSelectedBeds(bed)}
                  >
                    {bed === "Any" ? "Any" : `${bed} Bed`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="no-results">
            <p>No listings match your filters. Try broadening your search.</p>
          </div>
        ) : (
          <div className="listing-grid">
            {filtered.map((listing) => (
              <article
                className="listing-card"
                key={listing.id}
                onClick={() => {
                  onTrackClick(listing.id);
                  setExpandedId(expandedId === listing.id ? null : listing.id);
                }}
              >
                <div className="card-type-badge">{listing.type}</div>
                <h4>{listing.title}</h4>
                <p className="card-price">
                  ${listing.price.toLocaleString()} / month
                </p>
                <p className="card-meta">
                  {listing.area} &bull; {listing.distance} mi from campus
                </p>
                <p className="card-meta">
                  {listing.beds} Bed / {listing.baths} Bath
                </p>
                <p className="card-availability">{listing.availability}</p>

                {expandedId === listing.id && (
                  <div className="card-expanded">
                    <p className="card-description">{listing.description}</p>
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
      </main>
    </>
  );
}