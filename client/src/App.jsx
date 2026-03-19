import { useState } from "react";
import "./styles.css";
import sdsuLogo from "./assets/sdsulogo.jpg";
import Listings from "./components/Listings";

const navLinks = ["Home", "Listings", "Add Listing", "Profile", "Roommates", "Login"];

const filters = [
  "Keyword search",
  "Price range",
  "Housing type",
  "Beds/Baths",
  "Neighborhood near SDSU",
];

const onCampusHousing = [
  {
    title: "South Campus Plaza, Sunset Plaza, Tacuba, Tepeyac, Texcoco (Tier 1)",
    subtitle: "9-month license rates",
    note: "Triple rooms are only offered in South Campus Plaza, Tacuba, Tepeyac, and Texcoco.",
    rooms: [
      {
        type: "Triple",
        rates: {
          "2nd Year Basic": "$14,133",
          "2nd Year Standard": "$16,133",
          "Flex 5": "$17,645",
          "Flex 7": "$18,509",
          "Meals Plus": "$19,117",
        },
      },
      {
        type: "Double",
        rates: {
          "2nd Year Basic": "$15,757",
          "2nd Year Standard": "$17,757",
          "Flex 5": "$19,269",
          "Flex 7": "$20,133",
          "Meals Plus": "$20,741",
        },
      },
      {
        type: "Single",
        rates: {
          "2nd Year Basic": "$18,453",
          "2nd Year Standard": "$20,453",
          "Flex 5": "$21,965",
          "Flex 7": "$22,829",
          "Meals Plus": "$23,437",
        },
      },
    ],
  },
  {
    title: "Toltec, Zacatepec (Tier 2)",
    subtitle: "9-month license rates",
    note: "Triple rooms are only offered in Zacatepec.",
    rooms: [
      {
        type: "Triple",
        rates: {
          "2nd Year Basic": "$14,493",
          "2nd Year Standard": "$16,493",
          "Flex 5": "$18,005",
          "Flex 7": "$18,869",
          "Meals Plus": "$19,477",
        },
      },
      {
        type: "Double",
        rates: {
          "2nd Year Basic": "$16,173",
          "2nd Year Standard": "$18,173",
          "Flex 5": "$19,685",
          "Flex 7": "$20,549",
          "Meals Plus": "$21,157",
        },
      },
      {
        type: "Single",
        rates: {
          "2nd Year Basic": "$18,965",
          "2nd Year Standard": "$20,965",
          "Flex 5": "$22,477",
          "Flex 7": "$23,341",
          "Meals Plus": "$23,949",
        },
      },
    ],
  },
  {
    title: "Aztec Corner, Granada, Mixquic, Piedra Del Sol, Villa Alvarado, Zapotec (Tier 3)",
    subtitle: "9-month license rates",
    note: "Triple rooms are only offered in Aztec Corner.",
    rooms: [
      {
        type: "Triple",
        rates: {
          "2nd Year Basic": "$16,077",
          "2nd Year Standard": "$18,077",
          "Flex 5": "$19,589",
          "Flex 7": "$20,453",
          "Meals Plus": "$21,061",
        },
      },
      {
        type: "Double",
        rates: {
          "2nd Year Basic": "$17,901",
          "2nd Year Standard": "$19,901",
          "Flex 5": "$21,413",
          "Flex 7": "$22,277",
          "Meals Plus": "$22,885",
        },
      },
      {
        type: "Single",
        rates: {
          "2nd Year Basic": "$21,037",
          "2nd Year Standard": "$23,037",
          "Flex 5": "$24,549",
          "Flex 7": "$25,413",
          "Meals Plus": "$26,021",
        },
      },
    ],
  },
];

const offCampusListings = [
  {
    title: "6 Nineteen Apartments",
    price: "$1,400 / month",
    area: "College Area",
    type: "Apartment",
    availability: "Available Aug 1",
    distance: "0.4 miles",
  },
  {
    title: "The Rive",
    price: "$1,800 / month",
    area: "Linda Vista",
    type: "Apartment",
    availability: "Available Now",
    distance: "1.0 miles",
  },
  {
    title: "College View Apartments",
    price: "$1,250 / month",
    area: "College Area",
    type: "Apartment",
    availability: "Available Sep 1",
    distance: "0.3 miles",
  },
  {
    title: "Casa Diego",
    price: "$1,600 / month",
    area: "Serra Mesa",
    type: "Apartment",
    availability: "Available Jul 15",
    distance: "3.2 miles",
  },
  {
    title: "Topaz Apartments",
    price: "$2,000 / month",
    area: "Tierrasanta",
    type: "Apartment",
    availability: "Available Aug 15",
    distance: "4.0 miles",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("on-campus");
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-row">
          <div className="brand-lockup">
            <img className="brand-logo" src={sdsuLogo} alt="San Diego State logo" />
            <div>
              <p className="eyebrow">San Diego State University</p>
              <h1>Aztec Housing Hub</h1>
            </div>
          </div>

          <nav className="top-nav" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                href="/"
                key={link}
                className={
                  (link === "Home" && currentPage === "home") ||
                  (link === "Listings" && currentPage === "listings")
                    ? "nav-active"
                    : ""
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (link === "Home") setCurrentPage("home");
                  else if (link === "Listings") setCurrentPage("listings");
                }}
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── PAGE: Listings ── */}
      {currentPage === "listings" && (
        <main className="page-content">
          <Listings />
        </main>
      )}

      {/* ── PAGE: Home (original) ── */}
      {currentPage === "home" && (
        <main className="page-content">
          <section className="hero">
            <div>
              <h2>Find student housing near SDSU.</h2>
              <p className="hero-text">
                Browse listings, add housing posts, manage your profile, and
                connect with other students.
              </p>
            </div>

            <div className="hero-panel">
              <h3>Search Filters</h3>
              <div className="filter-list">
                {filters.map((filter) => (
                  <span className="filter-chip" key={filter}>
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <p className="eyebrow">Listings Feed</p>
              <h3>Housing Options near SDSU</h3>
            </div>

            <div className="tabs">
              <button
                className={`tab-button ${activeTab === "on-campus" ? "active" : ""}`}
                onClick={() => setActiveTab("on-campus")}
              >
                On-Campus Housing (SDSU)
              </button>
              <button
                className={`tab-button ${activeTab === "off-campus" ? "active" : ""}`}
                onClick={() => setActiveTab("off-campus")}
              >
                Off-Campus Housing
              </button>
            </div>

            {activeTab === "on-campus" && onCampusHousing.length > 0 && (
              <div className="listings-section">
                {onCampusHousing.map((group) => (
                  <div className="housing-group" key={group.title}>
                    <h5>{group.title}</h5>
                    {group.subtitle && <p className="housing-subtitle">{group.subtitle}</p>}

                    <div className="housing-table-wrap">
                      <table className="housing-table">
                        <thead>
                          <tr>
                            <th>Room type</th>
                            <th>2nd Year Basic</th>
                            <th>2nd Year Standard</th>
                            <th>Flex 5</th>
                            <th>Flex 7</th>
                            <th>Meals Plus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.rooms.map((room) => (
                            <tr key={room.type}>
                              <td>{room.type}</td>
                              <td>{room.rates["2nd Year Basic"]}</td>
                              <td>{room.rates["2nd Year Standard"]}</td>
                              <td>{room.rates["Flex 5"]}</td>
                              <td>{room.rates["Flex 7"]}</td>
                              <td>{room.rates["Meals Plus"]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {group.note && <p className="housing-note">* {group.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "off-campus" && (
              <div className="listings-section">
                <div className="listing-grid">
                  {offCampusListings.map((listing) => (
                    <article className="listing-card" key={listing.title}>
                      <h4>{listing.title}</h4>
                      <p>{listing.price}</p>
                      <p>{listing.area} - {listing.distance} from campus</p>
                      <p>{listing.type}</p>
                      <p>{listing.availability}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
