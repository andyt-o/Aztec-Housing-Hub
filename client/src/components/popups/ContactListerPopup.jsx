export default function ContactListerPopup({ listing, onClose }) {
  const isOffCampus = listing.placement === "offCampus";
  const label = isOffCampus ? "Off-Campus Housing" : "On-Campus Housing";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h3 className="modal-title">{label}</h3>
        <p className="modal-subtitle">{listing.title}</p>
        <div className="listing-detail-tile">
          <div className="detail-row">
            <span className="detail-label">Listed by</span>
            <span className="detail-value">{listing.ownerEmail || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Area</span>
            <span className="detail-value">{listing.area}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Price</span>
            <span className="detail-value">${(listing.price || 0).toLocaleString()}/mo</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Bedrooms / Baths</span>
            <span className="detail-value">{listing.beds}bd / {listing.baths}ba</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Distance</span>
            <span className="detail-value">{listing.distance} mi from SDSU</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Availability</span>
            <span className="detail-value">{listing.availability}</span>
          </div>
          {listing.placement === "onCampus" && listing.url && (
            <div className="detail-row">
              <span className="detail-label">Website</span>
              <span className="detail-value">
                <a href={listing.url} target="_blank" rel="noopener noreferrer">
                  {listing.url}
                </a>
              </span>
            </div>
          )}
          {listing.description && (
            <div className="detail-row">
              <span className="detail-label">Description</span>
              <span className="detail-value">{listing.description}</span>
            </div>
          )}
        </div>

        {isOffCampus ? (
          <div className="modal-contact-section">
            <h4>Contact Poster</h4>
            <p className="modal-contact-email">
              <a href={`mailto:${listing.ownerEmail}`}>{listing.ownerEmail || "N/A"}</a>
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
              style={{ display: "inline-block", textDecoration: "none" }}
              href={listing.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
            >
              Visit Website &#8599;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}