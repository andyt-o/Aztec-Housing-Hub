import { useState } from "react";
import RoommateFilters from "../roommates/RoommateFilters";
import RoommateCard from "../roommates/RoommateCard";
import { normalizeHobbies } from "../shared/compatibility";

export default function RoommatesPage({
  profileForm,
  roommateProfiles = [],
  cleanlinessOptions,
  sleepScheduleOptions,
  calculateCompatibility,
}) {
  const [filterCleanliness, setFilterCleanliness] = useState("Any");
  const [filterSleep, setFilterSleep] = useState("Any");
  const [filterHobby, setFilterHobby] = useState("");
  const [minimumMatch, setMinimumMatch] = useState(0);

  const roommateMatches = roommateProfiles
    .map((roommate) => {
      const compatibility = calculateCompatibility(profileForm, roommate);
      return {
        ...roommate,
        compatibilityScore: compatibility.score,
        commonHobbies: compatibility.commonHobbies,
      };
    })
    .filter((roommate) => {
      const cleanlinessMatch =
        filterCleanliness === "Any" ||
        roommate.cleanliness === filterCleanliness;
      const sleepMatch =
        filterSleep === "Any" ||
        roommate.sleepSchedule === filterSleep;
      const hobbyMatch =
        !filterHobby.trim() ||
        normalizeHobbies(roommate.hobbies).some((h) =>
          h.includes(filterHobby.trim().toLowerCase())
        );
      const scoreMatch =
        roommate.compatibilityScore >= minimumMatch;
      return (
        cleanlinessMatch && sleepMatch && hobbyMatch && scoreMatch
      );
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return (
    <>
      <div className="page-banner">
        <div className="page-banner-inner">
          <p className="eyebrow">Roommates</p>
          <h2>Find Compatible Roommates</h2>
          <p>Match with students who share your lifestyle and habits.</p>
        </div>
      </div>

      <main className="page-content">
        <section className="section-block">
          <RoommateFilters
            filterCleanliness={filterCleanliness}
            setFilterCleanliness={setFilterCleanliness}
            filterSleep={filterSleep}
            setFilterSleep={setFilterSleep}
            filterHobby={filterHobby}
            setFilterHobby={setFilterHobby}
            minimumMatch={minimumMatch}
            setMinimumMatch={setMinimumMatch}
            cleanlinessOptions={cleanlinessOptions}
            sleepScheduleOptions={sleepScheduleOptions}
          />

          <div className="roommate-grid">
            {roommateMatches.length === 0 ? (
              <article className="listing-card">
                <h4>No roommates match these filters</h4>
                <p className="hero-text">
                  Try relaxing one of the filters to see more matches.
                </p>
              </article>
            ) : (
              roommateMatches.map((roommate) => (
                <RoommateCard key={roommate.id} roommate={roommate} />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}