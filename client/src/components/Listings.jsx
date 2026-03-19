import { useState } from "react";

const offCampusListings = [
  {
    id: 1,
    title: "6 Nineteen Apartments",
    price: 1400,
    area: "College Area",
    type: "Apartment",
    beds: 2,
    baths: 1,
    availability: "Available Aug 1",
    distance: 0.4,
    description:
      "Modern 2-bed apartment steps from campus. In-unit laundry, parking included.",
  },
  {
    id: 2,
    title: "The Rive",
    price: 1800,
    area: "Linda Vista",
    type: "Apartment",
    beds: 2,
    baths: 2,
    availability: "Available Now",
    distance: 1.0,
    description:
      "Spacious living with resort-style pool and fitness center. Pet friendly.",
  },
  {
    id: 3,
    title: "College View Apartments",
    price: 1250,
    area: "College Area",
    type: "Apartment",
    beds: 1,
    baths: 1,
    availability: "Available Sep 1",
    distance: 0.3,
    description:
      "Affordable 1-bed close to trolley and campus. Utilities included.",
  },
  {
    id: 4,
    title: "Casa Diego",
    price: 1600,
    area: "Serra Mesa",
    type: "Apartment",
    beds: 3,
    baths: 2,
    availability: "Available Jul 15",
    distance: 3.2,
    description:
      "Quiet neighborhood, great for focused students. Garage parking available.",
  },
  {
    id: 5,
    title: "Topaz Apartments",
    price: 2000,
    area: "Tierrasanta",
    type: "Apartment",
    beds: 3,
    baths: 2,
    availability: "Available Aug 15",
    distance: 4.0,
    description:
      "Premium living with mountain views. Gated community with 24/7 security.",
  },
  {
    id: 6,
    title: "Campus Terrace Room",
    price: 850,
    area: "College Area",
    type: "Room",
    beds: 1,
    baths: 1,
    availability: "Available Now",
    distance: 0.2,
    description:
      "Private room in a shared 3-bed house. Walking distance to campus.",
  },
  {
    id: 7,
    title: "Adobe Falls House",
    price: 3200,
    area: "Adobe Falls",
    type: "House",
    beds: 4,
    baths: 3,
    availability: "Available Aug 1",
    distance: 1.5,
    description:
      "Full house rental, great for a group of students. Large backyard.",
  },
  {
    id: 8,
    title: "College Blvd Sublease",
    price: 950,
    area: "College Area",
    type: "Sublease",
    beds: 1,
    baths: 1,
    availability: "Available Jun 1",
    distance: 0.5,
    description:
      "Summer sublease through August. Furnished room, all utilities included.",
  },
];

const housingTypes = ["All", "Apartment", "Room", "House", "Sublease"];
const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $1,000", min: 0, max: 999 },
  { label: "$1,000 – $1,500", min: 1000, max: 1500 },
  { label: "$1,500 – $2,000", min: 1500, max: 2000 },
  { label: "$2,000+", min: 2000, max: Infinity },
];
const bedOptions = ["Any", "1", "2", "3", "4+"];

export default function Listings() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedBeds, setSelectedBeds] = useState("Any");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = offCampusListings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.area.toLowerCase().includes(search.toLowerCase()) ||
      listing.description.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedType === "All" || listing.type === selectedType;

    const range = priceRanges[selectedPrice];
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
    <section className="listings-page">
      <div className="listings-page-header">
        <h2>Browse Listings</h2>
        <p className="listings-page-subtitle">
          {filtered.length} housing option{filtered.length !== 1 ? "s" : ""}{" "}
          near SDSU
        </p>
      </div>

      {/* ── Filters ── */}
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
                  className={`filter-chip-btn ${selectedType === type ? "active" : ""}`}
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
                  className={`filter-chip-btn ${selectedBeds === bed ? "active" : ""}`}
                  onClick={() => setSelectedBeds(bed)}
                >
                  {bed === "Any" ? "Any" : `${bed} Bed`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
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
              onClick={() =>
                setExpandedId(expandedId === listing.id ? null : listing.id)
              }
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
    </section>
  );
}
