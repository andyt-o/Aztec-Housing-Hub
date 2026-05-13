import React, { useState } from "react";
import { ContactListerPopup } from "../popups";

const COLLAGE_STEPS = [
  {
    step: 1,
    label: "Find Housing",
    subtitle: "Browse listings",
    description:
      "Search on-campus dorms and off-campus apartments near SDSU with smart filters.",
    gradient: "linear-gradient(135deg, #9d2235 0%, #c0392b 100%)",
    icon: "🏠",
  },
  {
    step: 2,
    label: "Post Your Listing",
    subtitle: "List your space",
    description:
      "Add pricing, availability, and room details so fellow students can find you.",
    gradient: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
    icon: "📝",
  },
];

function Collage() {
  return (
    <section className="collage-section">
      <div className="collage-inner">
        <div className="section-heading" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ color: "var(--accent)" }}>
            How It Works
          </p>
          <h3 style={{ fontSize: "1.5rem", margin: "0.25rem 0" }}>
            Two Steps to Housing
          </h3>
          <p style={{ color: "var(--muted)", margin: "0.25rem 0 0" }}>
            Your path to finding the perfect place near campus.
          </p>
        </div>

        <div className="collage-grid">
          {COLLAGE_STEPS.map((step) => (
            <div key={step.step} className="collage-card" aria-label={step.label}>
              <div
                className="collage-card-bg"
                style={{ background: step.gradient }}
              />
              <div className="collage-card-overlay">
                <span className="collage-card-step">Step {step.step}</span>
                <div
                  style={{
                    fontSize: "2rem",
                    marginBottom: "0.5rem",
                    opacity: 0.95,
                  }}
                >
                  {step.icon}
                </div>
                <h4 style={{ color: "#fff", margin: "0 0 0.35rem" }}>
                  {step.label}
                </h4>
                <p style={{ opacity: 0.9, lineHeight: 1.4 }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="step-indicator">
          {COLLAGE_STEPS.map((_, i) => (
            <React.Fragment key={i}>
              <span className="step-dot active" />
              {i < COLLAGE_STEPS.length - 1 && (
                <span
                  className="step-line"
                  style={{
                    width: 40,
                    height: 2,
                    background: "var(--border)",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Dashboard: My Listings Panel ── */
function MyListingsPanel({ myListings, canCreateListing, onTrackClick, onDeleteListing, navigateTo }) {
  const handleDelete = (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      onDeleteListing(listingId);
    }
  };

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <h3>My Listings</h3>
        <span className="listing-count">
          {myListings.length} / 3
        </span>
      </div>

      {myListings.length === 0 ? (
        <div className="dash-empty">
          <p style={{ opacity: 0.7 }}>No listings yet.</p>
          <button
            className="btn-primary"
            style={{ background: "#9d2235", color: "#fff", border: "none", padding: "0.5rem 1.25rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
            onClick={() => navigateTo("add-listing")}
            disabled={!canCreateListing}
          >
            + Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="dash-listings-list">
          {myListings.map((listing) => (
            <div key={listing.id} className="dash-listing-card">
              <div className="dash-listing-main">
                <div>
                  <h4>{listing.title}</h4>
                  <p className="card-meta">
                    {listing.area} &bull; {listing.beds}bd/{listing.baths}ba
                    &bull; ${(listing.price || 0).toLocaleString()}
                  </p>
                  <p className="card-author">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Posted by {(listing.ownerName
                      ? listing.ownerName.split(" ")[0]
                      : (listing.ownerEmail || "").split("@")[0].replace(/[._]/g, " ") || "N/A")}
                  </p>
                </div>
                <div className="dash-listing-right">
                  <span className="dash-listing-badge">{listing.type}</span>
                  <span className="dash-listing-clicks">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {listing.clicks ?? 0}
                  </span>
                  <span className="dash-listing-author">
                    {listing.ownerName
                      ? listing.ownerName.split(" ")[0]
                      : (listing.ownerEmail || "").split("@")[0].replace(/[._]/g, " ") || "N/A"}
                  </span>
                </div>
              </div>
              <div className="dash-listing-actions">
                <button
                  className="btn-view"
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem", marginRight: "0.5rem" }}
                  onClick={() => {
                    if (onTrackClick) onTrackClick(listing.id);
                    navigateTo("listings");
                  }}
                >
                  View
                </button>
                <button
                  className="btn-delete"
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }}
                  onClick={() => handleDelete(listing.id)}
                  aria-label={`Delete ${listing.title}`}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {canCreateListing && myListings.length > 0 && (
        <button
          className="btn-primary"
          style={{
            width: "100%",
            marginTop: "0.75rem",
            background: "#9d2235",
            color: "#fff",
            border: "none",
            padding: "0.6rem",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => navigateTo("add-listing")}
        >
          + Add Listing ({myListings.length}/3)
        </button>
      )}

      {!canCreateListing && (
        <p className="dash-cap-notice">
          You&rsquo;ve reached the maximum of 3 listings.
        </p>
      )}
    </div>
  );
}

/* ── Dashboard: Metrics Panel ── */
function MetricsPanel({ myListings }) {
  const totalClicks = myListings.reduce((sum, l) => sum + (l.clicks || 0), 0);

  if (myListings.length === 0) {
    return (
      <div className="dash-panel">
        <div className="dash-panel-header">
          <h3>Listing Metrics</h3>
        </div>
        <div className="dash-empty">
          <p style={{ opacity: 0.7 }}>No metrics yet — create a listing first.</p>
        </div>
      </div>
    );
  }

  // Build 14-day click history for each listing
  const today = new Date();
  const labels = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }

  const maxDayClicks = Math.max(
    ...myListings.flatMap((l) =>
      (l.clickHistory || []).slice(-14).map((h) => h.count)
    ),
    1
  );

  const listingColors = ["#9d2235", "#3498db", "#27ae60", "#f39c12", "#8e44ad", "#e74c3c"];

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <h3>Listing Metrics</h3>
        <span className="metric-total">{totalClicks} total views</span>
      </div>

      {/* 14-day click graph per listing */}
      <div className="click-graph-section">
        {myListings.map((listing, idx) => {
          const history = (listing.clickHistory || []).slice(-14);
          const color = listingColors[idx % listingColors.length];
          const barWidthPct = maxDayClicks > 0 ? `${(history.reduce((s, h) => s + h.count, 0) / (maxDayClicks * 14)) * 100}` : "0%";

          return (
            <div key={listing.id} className="click-graph-row">
              <div className="click-graph-label">
                <span className="click-graph-title">
                  {listing.title.length > 20 ? listing.title.slice(0, 18) + "…" : listing.title}
                </span>
                <span className="click-graph-total">{listing.clicks || 0} total</span>
              </div>
              <div className="click-graph-bar-wrap">
                <div className="click-graph-bar" style={{ width: barWidthPct, background: color }} />
              </div>
              <div className="click-graph-days">
                {history.map((h, i) => (
                  <div key={i} className="click-day-bar" title={`${h.date}: ${h.count} clicks`}>
                    <div
                      className="click-day-fill"
                      style={{
                        height: `${Math.max(h.count / maxDayClicks * 100, 4)}%`,
                        background: color,
                      }}
                    />
                    <span className="click-day-label">{labels[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="metrics-insights">
        <h4>Quick Insights</h4>
        {totalClicks > 0 ? (
          <ul>
            {myListings
              .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
              .map((l, i) => (
                <li key={l.id}>
                  <strong>#{i + 1}</strong> &mdash; &ldquo;{l.title}&rdquo; ({l.clicks} clicks)
                </li>
              ))}
          </ul>
        ) : (
          <p>No clicks yet. Share your listing links to drive traffic!</p>
        )}
      </div>
    </div>
  );
}

/* ── Dashboard: Updates / Recommended Listings Panel ── */
function UpdatesPanel({ allListings, preferences, myListings, onTrackClick, onSelectListing }) {
  const lookingForHousing = preferences.lookingForHousing !== false;
  const maxPrice = Number(preferences.maxPrice) || 999999;
  const minBeds = Number(preferences.minBeds) || 0;
  const preferredTypes = preferences.preferredTypes || [];
  const keywords = (preferences.keywords || "").toLowerCase().trim();
  const placement = preferences.housingPlacement || "both";

  const myListingIds = new Set(myListings.map((l) => l.id));

  let recommended = (allListings || []).filter((l) => {
    if (myListingIds.has(l.id)) return false;
    if (placement !== "both" && l.placement !== placement) return false;
    if (l.price > maxPrice) return false;
    if (l.beds < minBeds) return false;
    if (preferredTypes.length > 0 && !preferredTypes.includes(l.type) && !preferredTypes.includes("All")) return false;
    if (keywords) {
      const hay = `${l.title} ${l.description} ${l.area}`.toLowerCase();
      if (!hay.includes(keywords)) return false;
    }
    return true;
  });

  recommended.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  recommended = recommended.slice(0, 6);

  function handleCardClick(listing) {
    onTrackClick(listing.id);
  }

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <h3>Recommended for You</h3>
        <button
          className="btn-link"
          onClick={() => navigateTo("profile")}
          title="Go to Profile to adjust your preferences"
        >
          ⚙️
        </button>
      </div>

      {!lookingForHousing ? (
        <div className="dash-empty">
          <p>Enable "Looking for housing" in your Profile to see recommendations.</p>
        </div>
      ) : recommended.length === 0 ? (
        <div className="dash-empty">
          <p>No listings match your preferences. Try adjusting filters in your Profile.</p>
        </div>
      ) : (
        <div className="dash-updates-list">
          {recommended.map((listing) => (
            <div
              key={listing.id}
              className="dash-update-card"
              onClick={() => handleCardClick(listing)}
              role="button"
              tabIndex={0}
              aria-label={`View ${listing.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(listing);
                }
              }}
            >
              <div className="dash-update-main">
                <span className="dash-update-badge">{listing.type}</span>
                <h4>{listing.title}</h4>
                <p className="dash-update-meta">
                  {listing.area} &bull; {listing.beds}bd/{listing.baths}ba
                  &bull; ${(listing.price || 0).toLocaleString()} &bull; {listing.distance}{" "}
                  mi
                </p>
                <p className="card-author">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Posted by {listing.ownerName
                    ? listing.ownerName
                    : (listing.ownerEmail || "").split("@")[0].replace(/[._]/g, " ") || "N/A"}
                </p>
              </div>
              <div className="dash-update-footer">
                <span className="dash-update-clicks">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  {listing.clicks || 0}
                </span>
                <span className="dash-update-new">NEW</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommended.length > 0 && (
        <div className="dash-updates-cta">
          <button
            className="btn-secondary"
            onClick={() => navigateTo("profile")}
            title="Adjust your preferences in Profile"
          >
            Refine Preferences in Profile
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Dashboard: HomePage ── */
export default function HomePage({
  currentUser,
  myListings,
  canCreateListing,
  preferences,
  allListings,
  onTrackClick,
  onSelectListing,
  navigateTo,
}) {
  const [selectedListing, setSelectedListing] = useState(null);

  function closeListingModal() {
    setSelectedListing(null);
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }}>
              Welcome to SDSU's Housing Hub
            </p>
            <h2 style={{ color: "#fff", fontSize: "2rem" }}>
              {currentUser
                ? `Welcome back, ${currentUser.firstName}!`
                : "Your SDSU Housing Hub"}
            </h2>
            <p className="hero-text">
              {currentUser
                ? "Find housing, post listings, and connect with others — all in one place."
                : "Find, post, and manage student housing near San Diego State University — all in one place."}
            </p>
          </div>

          <div className="hero-cta">
            {currentUser ? (
              <div className="logged-in-actions">
                <div className="hero-buttons-vertical">
                  <button
                    className="btn-primary"
                    style={{
                      background: "#fff",
                      color: "#9d2235",
                      border: "none",
                    }}
                    onClick={() => navigateTo("add-listing")}
                    disabled={!canCreateListing}
                  >
                    + New Listing
                    {myListings.length > 0 && (
                      <span className="hero-badge">
                        {myListings.length}/3
                      </span>
                    )}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => navigateTo("listings")}
                  >
                    Browse Listings
                  </button>
                </div>
              </div>
            ) : (
              <div className="guest-actions">
                <h3 style={{ color: "#fff" }}>Get Started</h3>
                <p>Create a free account to browse listings and post housing.</p>
                <div className="hero-buttons">
                  <button
                    className="btn-primary"
                    style={{ background: "#fff", color: "#9d2235" }}
                    onClick={() => navigateTo("auth-signup")}
                  >
                    Create Account
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => navigateTo("listings")}
                  >
                    Browse Listings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Content below hero ── */}
      <main className="page-content">
        {/* Guest: Collage "How It Works" */}
        {!currentUser && <Collage />}

        {/* Authenticated: Three-panel dashboard */}
        {currentUser && (
          <div className="dashboard-grid">
            <MyListingsPanel
              myListings={myListings}
              canCreateListing={canCreateListing}
              onTrackClick={onTrackClick}
              onDeleteListing={handleDeleteListing}
              navigateTo={navigateTo}
            />
            <MetricsPanel myListings={myListings} />
            <UpdatesPanel
              allListings={allListings}
              preferences={preferences}
              myListings={myListings}
              onTrackClick={onTrackClick}
              onSelectListing={setSelectedListing}
              navigateTo={navigateTo}
            />
          </div>
        )}
      </main>

      {/* ── Contact Lister Popup for off-campus recommended tiles ── */}
      {selectedListing && (
        <ContactListerPopup
          listing={selectedListing}
          onClose={closeListingModal}
          onTrackClick={onTrackClick}
        />
      )}
    </>
  );
}