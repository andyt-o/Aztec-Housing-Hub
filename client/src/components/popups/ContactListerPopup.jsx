import React, { useRef } from "react";

export default function ContactListerPopup({
  listing,
  onClose,
  onTrackClick,
}) {
  const isOffCampus = listing.placement === "offCampus";
  const label = isOffCampus ? "Off-Campus Housing" : "On-Campus Housing";

  const roommateStatusLabel = {
    looking: "Looking for roommates",
    lookingToRoom: "Looking to room with others",
    notLooking: "Not looking for roommates",
  }[listing.roommateStatus] || "Not set";

  const clicks = listing.clicks ?? 0;

  function handleCardClick() {
    if (onTrackClick) onTrackClick(listing.id);
  }

  function handleContactClick() {
    if (onTrackClick) onTrackClick(listing.id);
  }

  // Derive a friendly display name from email
  const displayName =
    listing.ownerName ||
    (listing.ownerEmail || "").split("@")[0].replace(/[._]/g, " ") ||
    "N/A";

  const overlayClickRef = useRef(false);

  function handleMouseDown(e) {
    if (e.target === e.currentTarget) {
      overlayClickRef.current = true;
    }
  }

  function handleMouseUp(e) {
    if (overlayClickRef.current && e.target === e.currentTarget) {
      onClose();
    }
    overlayClickRef.current = false;
  }

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {/* -- Header -- */}
        <div className="modal-header">
          <span className="modal-type-badge">{label}</span>
          <h2 className="modal-title">{listing.title}</h2>
          <p className="modal-posted-by">
            Posted by <strong>{displayName}</strong>
          </p>
        </div>

        {/* -- Engagement Badge -- */}
        <div className="modal-engagement">
          <span className="engagement-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {clicks} {clicks === 1 ? "view" : "views"}
          </span>
        </div>

        {/* -- Detail Sections -- */}
        <div className="listing-detail-tile">
          {/* Location & Price */}
          <div className="detail-section">
            <h4 className="detail-section-title">Location & Pricing</h4>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span className="detail-label">Area</span>
              <span className="detail-value">{listing.area}</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              <span className="detail-label">Price</span>
              <span className="detail-value">${(listing.price || 0).toLocaleString()}/mo</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="detail-label">Distance</span>
              <span className="detail-value">{listing.distance} mi from SDSU</span>
            </div>
          </div>

          {/* Room Details */}
          <div className="detail-section">
            <h4 className="detail-section-title">Room Details</h4>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
                  <path d="M7 10h10" />
                  <path d="M12 14v4" />
                </svg>
              </span>
              <span className="detail-label">Type</span>
              <span className="detail-value">{listing.type || "Traditional"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <span className="detail-label">Bedrooms / Baths</span>
              <span className="detail-value">
                {listing.beds}bd / {listing.baths}ba
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <span className="detail-label">Availability</span>
              <span className="detail-value">{listing.availability || "TBD"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span className="detail-label">Roommate Status</span>
              <span className="detail-value">{roommateStatusLabel}</span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="detail-section">
              <h4 className="detail-section-title">About This Home</h4>
              <p className="detail-description">{listing.description}</p>
            </div>
          )}

          {/* Poster Bio (Biography) */}
          {listing.posterBio && (listing.roommateStatus === "looking" || listing.roommateStatus === "lookingToRoom") && (
            <div className="detail-section">
              <h4 className="detail-section-title">ABOUT THIS PERSON</h4>
              <p className="detail-description">{listing.posterBio}</p>
            </div>
          )}

          {/* On-Campus Website Link */}
          {listing.placement === "onCampus" && listing.url && (
            <div className="detail-section">
              <h4 className="detail-section-title">Website</h4>
              <a
                className="detail-link"
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {listing.url}
                <span className="detail-link-icon">&#8599;</span>
              </a>
            </div>
          )}
        </div>

        {/* -- Contact / CTA Section -- */}
        {isOffCampus ? (
          <div className="modal-contact-section">
            <h4 className="modal-contact-title">Contact Poster</h4>
            <p className="modal-contact-email">
              <a
                href={`mailto:${listing.ownerEmail}`}
                onClick={handleContactClick}
              >
                {listing.ownerEmail || "N/A"}
              </a>
            </p>
            <div className="modal-share-link">
              <label>Share this listing:</label>
              <input
                type="text"
                value={`${window.location.origin}#off-campus-${listing.id}`}
                readOnly
                onClick={(e) => e.target.select()}
                className="share-link-input"
              />
            </div>
          </div>
        ) : (
          <div className="modal-cta">
            <a
              className="contact-btn"
              href={listing.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                handleCardClick();
                onClose();
              }}
            >
              Visit Website &#8599;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}