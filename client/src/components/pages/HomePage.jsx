import React, { useState } from "react";

const COLLAGE_STEPS = [
  {
    step: 1,
    label: "Find Housing",
    subtitle: "Browse listings",
    description:
      "Search on-campus dorms and off-campus apartments near SDSU with smart filters.",
    gradient: "linear-gradient(135deg, #9d2235 0%, #c0392b 100%)",
    icon: "🏠",
    navigateTo: "listings",
  },
  {
    step: 2,
    label: "Post Your Listing",
    subtitle: "List your space",
    description:
      "Add pricing, availability, and room details so fellow students can find you.",
    gradient: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
    icon: "📝",
    navigateTo: "add-listing",
  },
  {
    step: 3,
    label: "Connect with Roommates",
    subtitle: "Match & connect",
    description:
      "Get matched with compatible roommates based on lifestyle, schedule, and habits.",
    gradient: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)",
    icon: "🤝",
    navigateTo: "roommates",
  },
];

function Collage({ navigate }) {
  return (
    <section className="collage-section">
      <div className="collage-inner">
        <div className="section-heading" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ color: "var(--accent)" }}>
            How It Works
          </p>
          <h3 style={{ fontSize: "1.5rem", margin: "0.25rem 0" }}>
            Three Steps to Housing
          </h3>
          <p style={{ color: "var(--muted)", margin: "0.25rem 0 0" }}>
            Your path to finding the perfect place near campus.
          </p>
        </div>

        <div className="collage-grid">
          {COLLAGE_STEPS.map((step) => (
            <div
              key={step.step}
              className="collage-card"
              onClick={() => navigate(step.navigateTo)}
              role="button"
              tabIndex={0}
              aria-label={`Go to ${step.label}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(step.navigateTo);
                }
              }}
            >
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
function MyListingsPanel({ myListings, canCreateListing, onNavigate, navigate }) {
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
            onClick={() => navigate("add-listing")}
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
                  <p className="dash-listing-meta">
                    {listing.area} &bull; {listing.beds}bd/{listing.baths}ba
                    &bull; ${(listing.price || 0).toLocaleString()}
                  </p>
                </div>
                <span className="dash-listing-badge">{listing.type}</span>
              </div>
              <div className="dash-listing-actions">
                <button
                  className="btn-secondary"
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }}
                  onClick={() => navigate("listings")}
                >
                  View
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
          onClick={() => navigate("add-listing")}
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

  const maxClicks = Math.max(...myListings.map((l) => l.clicks || 0), 1);

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <h3>Listing Metrics</h3>
        <span className="metric-total">{totalClicks} total views</span>
      </div>

      <div className="metrics-summary">
        {myListings.map((listing) => {
          const clicks = listing.clicks || 0;
          const pct = Math.round((clicks / maxClicks) * 100);
          const barColor =
            pct >= 75
              ? "#27ae60"
              : pct >= 40
              ? "#f39c12"
              : "#e74c3c";

          return (
            <div key={listing.id} className="metric-row">
              <div className="metric-row-header">
                <span className="metric-title">{listing.title}</span>
                <span className="metric-value">{clicks} click{clicks !== 1 ? "s" : ""}</span>
              </div>
              <div className="metric-bar-bg">
                <div
                  className="metric-bar-fill"
                  style={{ width: `${pct}%`, background: barColor }}
                />
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
                  <strong>#{i + 1}</strong> — "{l.title}" ({l.clicks} clicks)
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
function UpdatesPanel({ allListings, preferences, myListings, onTrackClick, myEmail }) {
  const lookingForHousing = preferences.lookingForHousing !== false;
  const maxPrice = Number(preferences.maxPrice) || 999999;
  const minBeds = Number(preferences.minBeds) || 0;
  const preferredTypes = preferences.preferredTypes || [];
  const keywords = (preferences.keywords || "").toLowerCase().trim();

  const myListingIds = new Set(myListings.map((l) => l.id));

  // Filter: must not be my own, must match preferences
  let recommended = (allListings || []).filter((l) => {
    if (myListingIds.has(l.id)) return false;
    if (l.price > maxPrice) return false;
    if (l.beds < minBeds) return false;
    if (preferredTypes.length > 0 && !preferredTypes.includes(l.type) && !preferredTypes.includes("All")) return false;
    if (keywords) {
      const hay = `${l.title} ${l.description} ${l.area}`.toLowerCase();
      if (!hay.includes(keywords)) return false;
    }
    return true;
  });

  // Sort by clicks descending (popularity), trim to 6
  recommended.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  recommended = recommended.slice(0, 6);

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <h3>Recommended for You</h3>
        <button
          className="btn-link"
          style={{ fontSize: "0.8rem", padding: 0 }}
          onClick={() => {}}
          title="Preferences are set in your Profile"
        >
          ⚙️
        </button>
      </div>

      {!lookingForHousing ? (
        <div className="dash-empty">
          <p style={{ opacity: 0.7 }}>
            Enable "Looking for housing" in your Profile to see recommendations.
          </p>
        </div>
      ) : recommended.length === 0 ? (
        <div className="dash-empty">
          <p style={{ opacity: 0.7 }}>
            No listings match your preferences. Try adjusting filters in your Profile.
          </p>
        </div>
      ) : (
        <div className="dash-updates-list">
          {recommended.map((listing) => (
            <div
              key={listing.id}
              className="dash-update-card"
              onClick={() => {
                onTrackClick(listing.id);
                window.open(listing.url || "#", "_blank");
              }}
              role="button"
              tabIndex={0}
              aria-label={`View ${listing.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTrackClick(listing.id);
                  window.open(listing.url || "#", "_blank");
                }
              }}
            >
              <div className="dash-update-main">
                <span className="dash-update-badge">{listing.type}</span>
                <h4>{listing.title}</h4>
                <p className="dash-update-meta">
                  {listing.area} &bull; {listing.beds}bd/{listing.baths}ba
                  &bull; ${(listing.price || 0).toLocaleString()} &bull; {listing.distance} mi
                </p>
              </div>
              <div className="dash-update-footer">
                <span className="dash-update-clicks">
                  👁 {listing.clicks || 0}
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
            style={{ width: "100%", fontSize: "0.85rem", marginTop: "0.5rem" }}
            onClick={() => {}}
            title="Preferences are set in your Profile"
          >
            Refine Preferences in Profile
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Preferences Quick Editor (inline in dashboard) ── */
function PreferencesBar({ preferences, onUpdate }) {
  const housingTypes = ["All", "Apartment", "Room", "House", "Sublease"];

  return (
    <div className="preferences-bar">
      <div className="pref-row">
        <label className="pref-check">
          <input
            type="checkbox"
            checked={preferences.lookingForHousing !== false}
            onChange={(e) =>
              onUpdate({
                ...preferences,
                lookingForHousing: e.target.checked,
              })
            }
          />
          <span>Looking for housing</span>
        </label>

        <label className="pref-field">
          <span>Max Price</span>
          <input
            type="number"
            min="0"
            value={preferences.maxPrice || ""}
            onChange={(e) =>
              onUpdate({
                ...preferences,
                maxPrice: Number(e.target.value) || 0,
              })
            }
            placeholder="e.g. 2000"
          />
        </label>

        <label className="pref-field">
          <span>Min Beds</span>
          <input
            type="number"
            min="1"
            value={preferences.minBeds || ""}
            onChange={(e) =>
              onUpdate({
                ...preferences,
                minBeds: Number(e.target.value) || 1,
              })
            }
            placeholder="1"
          />
        </label>
      </div>

      <div className="pref-row">
        <label className="pref-field">
          <span>Keywords</span>
          <input
            type="text"
            value={preferences.keywords || ""}
            onChange={(e) =>
              onUpdate({
                ...preferences,
                keywords: e.target.value,
              })
            }
            placeholder="e.g. furnished, pet-friendly"
          />
        </label>
      </div>

      <div className="pref-row pref-types-row">
        <span className="pref-label">Preferred Types</span>
        <div className="pref-chips">
          {housingTypes.map((t) => (
            <button
              key={t}
              type="button"
              className={`pref-chip${
                (preferences.preferredTypes || []).includes(t) ? " active" : ""
              }`}
              onClick={() => {
                const current = preferences.preferredTypes || [];
                const next = current.includes(t)
                  ? current.filter((x) => x !== t)
                  : [...current, t];
                onUpdate({ ...preferences, preferredTypes: next });
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main HomePage ── */
export default function HomePage({
  currentUser,
  myListings,
  canCreateListing,
  preferences,
  onUpdatePreferences,
  allListings,
  onTrackClick,
  setCurrentPage,
}) {
  function navigate(page) {
    setCurrentPage(page);
  }

  return (
    <>
      {/* ── Hero — full-bleed banner ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p
              className="eyebrow"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Welcome to SDSU's Housing Hub
            </p>
            <h2 style={{ color: "#fff", fontSize: "2rem" }}>
              {currentUser
                ? `Welcome back, ${currentUser.firstName}!`
                : "Your SDSU Housing Hub"}
            </h2>
            <p className="hero-text">
              {currentUser
                ? "Find housing, post listings, and connect with roommates — all in one place."
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
                    onClick={() => navigate("add-listing")}
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
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.4)",
                    }}
                    onClick={() => navigate("listings")}
                  >
                    Browse Listings
                  </button>
                  <button
                    className="btn-secondary"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.4)",
                    }}
                    onClick={() => navigate("roommates")}
                  >
                    View Roommates
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
                    onClick={() => navigate("auth-signup")}
                  >
                    Create Account
                  </button>
                  <button
                    className="btn-secondary"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.4)",
                    }}
                    onClick={() => navigate("listings")}
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
        {!currentUser && <Collage navigate={navigate} />}

        {/* Authenticated: Three-panel dashboard */}
        {currentUser && (
          <>
            <PreferencesBar
              preferences={preferences}
              onUpdate={onUpdatePreferences}
            />

            <div className="dashboard-grid">
              <MyListingsPanel
                myListings={myListings}
                canCreateListing={canCreateListing}
                onNavigate={navigate}
                navigate={navigate}
              />
              <MetricsPanel myListings={myListings} />
              <UpdatesPanel
                allListings={allListings}
                preferences={preferences}
                myListings={myListings}
                onTrackClick={onTrackClick}
                myEmail={currentUser.email}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}