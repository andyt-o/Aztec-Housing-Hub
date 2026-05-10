import { useState } from "react";

export default function OnCampusTab({ onCampusHousing = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="listings-section on-campus-directory">
      <div className="on-campus-header">
        <h4>SDSU On-Campus Housing</h4>
        <p className="housing-note">
          Browse all {onCampusHousing.length} residence communities managed by
          SDSU Housing. Click a card for details.
        </p>
      </div>

      {onCampusHousing.length === 0 && (
        <div className="no-results">
          <p>No on-campus listings available at this time.</p>
        </div>
      )}

      {onCampusHousing.length > 0 && (
        <div className="listing-grid">
          {onCampusHousing.map((listing) => (
            <article
              className="listing-card"
              key={listing.id}
              onClick={() =>
                setExpandedId(
                  expandedId === listing.id ? null : listing.id
                )
              }
            >
              <div className="card-type-badge">
                {listing.type || "On-Campus"}
              </div>
              <h4>{listing.title}</h4>
              <p className="card-meta">{listing.area}</p>
              <p className="card-meta">
                {listing.beds} Bed / {listing.baths} Bath
              </p>
              <p className="card-availability">
                Available: {listing.availability}
              </p>

              {expandedId === listing.id && (
                <div className="card-expanded">
                  <p className="card-description">
                    {listing.description}
                  </p>
                  <a
                    href={
                      listing.url ||
                      "https://housing.sdsu.edu/communities"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on SDSU Housing &#8599;
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="on-campus-footer">
        <a
          href="https://housing.sdsu.edu/communities"
          target="_blank"
          rel="noopener noreferrer"
          className="sdsu-link btn-wide"
        >
          View All SDSU Communities &#8599;
        </a>
      </div>
    </div>
  );
}