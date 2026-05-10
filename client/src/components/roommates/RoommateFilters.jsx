export default function RoommateFilters({
  filterCleanliness,
  setFilterCleanliness,
  filterSleep,
  setFilterSleep,
  filterHobby,
  setFilterHobby,
  minimumMatch,
  setMinimumMatch,
  cleanlinessOptions,
  sleepScheduleOptions,
}) {
  return (
    <div className="roommate-filters">
      <label className="auth-field">
        <span>Cleanliness</span>
        <select
          value={filterCleanliness}
          onChange={(e) => setFilterCleanliness(e.target.value)}
        >
          <option>Any</option>
          {cleanlinessOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </label>

      <label className="auth-field">
        <span>Sleep schedule</span>
        <select
          value={filterSleep}
          onChange={(e) => setFilterSleep(e.target.value)}
        >
          <option>Any</option>
          {sleepScheduleOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </label>

      <label className="auth-field">
        <span>Hobby keyword</span>
        <input
          type="text"
          placeholder="e.g. gym"
          value={filterHobby}
          onChange={(e) => setFilterHobby(e.target.value)}
        />
      </label>

      <label className="auth-field">
        <span>Minimum match</span>
        <select
          value={minimumMatch}
          onChange={(e) =>
            setMinimumMatch(Number(e.target.value))
          }
        >
          <option value={0}>Any</option>
          <option value={40}>40%+</option>
          <option value={60}>60%+</option>
          <option value={80}>80%+</option>
        </select>
      </label>
    </div>
  );
}