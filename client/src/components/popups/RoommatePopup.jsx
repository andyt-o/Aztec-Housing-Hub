export default function RoommatePopup({ roommate, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h3 className="modal-title">Roommate Profile</h3>
        <p className="modal-subtitle">{roommate.name}</p>
        <div className="listing-detail-tile">
          <div className="detail-row">
            <span className="detail-label">Major</span>
            <span className="detail-value">{roommate.major || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Year</span>
            <span className="detail-value">{roommate.year || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Cleanliness</span>
            <span className="detail-value">{roommate.cleanliness || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Sleep Schedule</span>
            <span className="detail-value">{roommate.sleepSchedule || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Hobbies</span>
            <span className="detail-value">
              {(Array.isArray(roommate.hobbies) ? roommate.hobbies : []).join(", ") || "None listed"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Compatibility</span>
            <span className="detail-value">{roommate.compatibilityScore != null ? `${roommate.compatibilityScore}%` : "N/A"}</span>
          </div>
          {roommate.bio && (
            <div className="detail-row">
              <span className="detail-label">Bio</span>
              <span className="detail-value">{roommate.bio}</span>
            </div>
          )}
          {roommate.commonHobbies && Array.isArray(roommate.commonHobbies) && roommate.commonHobbies.length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Shared Interests</span>
              <span className="detail-value">{roommate.commonHobbies.join(", ")}</span>
            </div>
          )}
        </div>

        <div className="modal-contact-section">
          <h4>Contact</h4>
          {roommate.email && (
            <p className="modal-contact-email">
              <a href={`mailto:${roommate.email}`}>{roommate.email}</a>
            </p>
          )}
          {roommate.id && (
            <div className="modal-share-link">
              <label>Share this profile:</label>
              <input
                type="text"
                value={`${window.location.origin}#roommate-${roommate.id}`}
                readOnly
                onClick={(e) => e.target.select()}
                className="share-link-input"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}