export default function RoommateCard({ roommate, onViewProfile }) {
  return (
    <article className="listing-card">
      <h4>{roommate.name}</h4>
      <p className="card-meta">{roommate.major}</p>
      <p className="card-price">
        Compatibility: {roommate.compatibilityScore}%
      </p>
      <p className="card-meta">
        Cleanliness: {roommate.cleanliness}
      </p>
      <p className="card-meta">
        Sleep: {roommate.sleepSchedule}
      </p>
      <p className="card-meta">
        Hobbies: {(Array.isArray(roommate.hobbies) ? roommate.hobbies : []).join(", ") || "None listed"}
      </p>
      <p className="hero-text">{roommate.bio}</p>
      {roommate.commonHobbies && Array.isArray(roommate.commonHobbies) && roommate.commonHobbies.length > 0 && (
        <p className="roommate-common-hobbies">
          Shared interests: {roommate.commonHobbies.join(", ")}
        </p>
      )}
      <button
        className="contact-btn"
        style={{ marginTop: "0.75rem", display: "inline-block", width: "100%" }}
        onClick={() => onViewProfile(roommate)}
      >
        View Roommate Profile
      </button>
    </article>
  );
}