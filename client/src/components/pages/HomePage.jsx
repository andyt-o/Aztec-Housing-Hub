import React, { useState } from "react";
import { ContactListerPopup, EditListingPopup, ConfirmDeletePopup } from "../popups";

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
function MyListingsPanel({ myListings, canCreateListing, onTrackClick, onDeleteListing, onEditListing, navigateTo }) {
  const [listingToDelete, setListingToDelete] = useState(null);

  const requestDelete = (listing) => {
    setListingToDelete(listing);
  };

  const confirmDelete = () => {
    if (listingToDelete) {
      onDeleteListing(listingToDelete.id);
      setListingToDelete(null);
    }
  };

  const cancelDelete = () => {
    setListingToDelete(null);
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
                </div>
              </div>
              <div className="dash-listing-actions" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                <button
                  className="btn-view"
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem", flex: 1 }}
                  onClick={() => {
                    if (onTrackClick) onTrackClick(listing.id);
                    navigateTo("listings");
                  }}
                >
                  View
                </button>
                <button
                  className="btn-edit"
                  style={{ 
                    fontSize: "0.8rem", 
                    padding: "0.3rem 0.7rem", 
                    flex: 1,
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                  onClick={() => onEditListing(listing)}
                >
                  ✎ Edit
                </button>
                <button
                  className="btn-delete"
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem", flex: 1 }}
                  onClick={() => requestDelete(listing)}
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

      {listingToDelete && (
        <ConfirmDeletePopup
          title={listingToDelete.title}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
        />
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
          const hasData = history.some(h => h.count > 0);

          return (
            <div key={listing.id} className="click-graph-row">
              <div className="click-graph-label">
                <span className="click-graph-title">
                  {listing.title.length > 30 ? listing.title.slice(0, 28) + "…" : listing.title}
                </span>
                <span className="click-graph-total">{listing.clicks || 0} views</span>
              </div>
              <div className="click-graph-container" style={{ position: 'relative', paddingLeft: '24px', paddingBottom: '20px', marginTop: '0.5rem' }}>
                <div className="y-axis-label" style={{ position: 'absolute', left: 0, top: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--muted)', fontWeight: 'bold' }}>
                   <span>{hasData ? maxDayClicks : 1}</span>
                   <span>0</span>
                </div>
                <div className="x-axis-line" style={{ position: 'absolute', bottom: '20px', left: '24px', right: 0, height: '1px', background: 'var(--border)' }}></div>
                <div className="y-axis-line" style={{ position: 'absolute', top: 0, bottom: '20px', left: '24px', width: '1px', background: 'var(--border)' }}></div>
                <div className="click-graph-days" style={{ height: '80px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingLeft: '4px', justifyContent: 'flex-start' }}>
                  {history.map((h, i) => {
                    const [year, month, day] = h.date.split("-");
                    const label = `${parseInt(month)}/${parseInt(day)}`;
                    return (
                      <div key={i} className="click-day-bar" title={`${h.date}: ${h.count} views`} style={{ width: '28px', flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
                        <div
                          className="click-day-fill"
                          style={{
                            height: hasData ? `${Math.max((h.count / maxDayClicks) * 100, 4)}%` : '4%',
                            background: hasData ? color : 'var(--border)',
                            width: '100%',
                            minWidth: '12px',
                            borderRadius: '2px 2px 0 0',
                            transition: 'height 0.4s ease'
                          }}
                        />
                        <span className="click-day-label" style={{ position: 'absolute', top: '100%', marginTop: '4px', fontSize: '0.6rem', color: 'var(--muted)', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="x-axis-title" style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, textAlign: 'center', fontSize: '0.6rem', color: 'var(--muted)', fontWeight: 'bold' }}>Date</div>
                <div className="y-axis-title" style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '0.6rem', color: 'var(--muted)', fontWeight: 'bold', transformOrigin: 'center' }}>Views</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="metrics-insights">
        <h4>Quick Insights</h4>
        <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted)' }}>Top Listings</p>
            {totalClicks > 0 ? (
              <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
                {myListings
                  .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                  .slice(0, 3)
                  .map((l, i) => (
                    <li key={l.id} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <strong>#{i + 1}</strong> &mdash; {l.title.length > 20 ? l.title.slice(0, 18) + "…" : l.title} ({l.clicks} views)
                    </li>
                  ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>No views yet.</p>
            )}
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted)' }}>Daily Activity Recap</p>
            <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
              {(() => {
                // Aggregate daily totals across all listings for the last 7 days
                const dailyData = {};
                myListings.forEach(l => {
                  (l.clickHistory || []).slice(-7).forEach(h => {
                    dailyData[h.date] = (dailyData[h.date] || 0) + h.count;
                  });
                });
                
                const last7Days = Object.entries(dailyData)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .slice(0, 3);

                if (last7Days.length === 0) return <li style={{ fontSize: '0.85rem', opacity: 0.7 }}>No recent activity.</li>;

                return last7Days.map(([date, count]) => {
                  const [y, m, d] = date.split("-");
                  return (
                    <li key={date} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <strong>{parseInt(m)}/{parseInt(d)}</strong> &mdash; {count} total {count === 1 ? 'view' : 'views'}
                    </li>
                  );
                });
              })()}
            </ul>
          </div>
        </div>
        {totalClicks === 0 && (
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic' }}>Share your listing links to drive traffic!</p>
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
    if (onTrackClick) onTrackClick(listing.id);
    if (listing.placement === "offCampus") {
      onSelectListing(listing);
    } else if (listing.placement === "onCampus" && listing.url) {
      window.open(listing.url, "_blank", "noopener,noreferrer");
    }
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
              className={`dash-update-card ${listing.placement}`}
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
                  &bull; ${(listing.price || 0).toLocaleString()} {listing.distance != null && `\u2022 ${listing.distance} mi`}
                </p>
                {listing.placement !== "onCampus" && (
                  <p className="card-author">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Posted by {listing.ownerName
                      ? listing.ownerName
                      : (listing.ownerEmail || "").split("@")[0].replace(/[._]/g, " ") || "N/A"}
                  </p>
                )}
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
  onDeleteListing,
  onUpdateListing,
  onSelectListing,
  navigateTo,
}) {
  const [selectedListing, setSelectedListing] = useState(null);
  const [editingListing, setEditingListing] = useState(null);

  function closeListingModal() {
    setSelectedListing(null);
  }

  function closeEditModal() {
    setEditingListing(null);
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
              onDeleteListing={onDeleteListing}
              onEditListing={setEditingListing}
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

      {/* ── Edit Listing Popup ── */}
      {editingListing && (
        <EditListingPopup
          listing={editingListing}
          onClose={closeEditModal}
          onUpdate={onUpdateListing}
        />
      )}
    </>
  );
}