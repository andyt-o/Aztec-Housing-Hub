import React, { useState } from "react";

const housingTypes = ["All", "Apartment", "Room", "House", "Sublease"];

export default function ProfilePage({
  profileForm,
  setProfileForm,
  preferences,
  setPreferences,
  onSave,
  onSignOut,
  onUpdateName,
  saveMessage,
  cleanlinessOptions,
  sleepScheduleOptions,
  currentUser,
}) {
  const [editingName, setEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState(currentUser?.firstName || "");
  const [editLastName, setEditLastName] = useState(currentUser?.lastName || "");

  return (
    <>
      <div className="page-banner">
        <div className="page-banner-inner">
          <p className="eyebrow">Roommate Profile</p>
          <h2>Set Your Preferences</h2>
          <p>Tell other students about your lifestyle and housing needs.</p>
        </div>
      </div>

      <main className="page-content">
        {/* User info */}
        {currentUser && (
          <section className="section-block">
            <h3 style={{ margin: "0 0 0.5rem" }}>Account Info</h3>
            {editingName ? (
              <div className="auth-form-grid">
                <label className="auth-field">
                  <span>First Name</span>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </label>
                <label className="auth-field">
                  <span>Last Name</span>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </label>
              </div>
            ) : (
              <div style={{ marginBottom: "0.5rem" }}>
                <strong style={{ fontSize: "1rem" }}>
                  {currentUser.firstName} {currentUser.lastName}
                </strong>
              </div>
            )}
            {editingName && (
              <div style={{ marginBottom: "0.75rem" }}>
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ marginRight: "0.5rem" }}
                  onClick={() => {
                    if (editFirstName.trim() && editLastName.trim()) {
                      onUpdateName(editFirstName.trim(), editLastName.trim());
                      setEditingName(false);
                    }
                  }}
                >
                  Save Name
                </button>
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ background: "var(--muted)", borderColor: "var(--muted)" }}
                  onClick={() => {
                    setEditFirstName(currentUser.firstName || "");
                    setEditLastName(currentUser.lastName || "");
                    setEditingName(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              Red ID: {currentUser.redId || "N/A"}
            </p>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              Email: {currentUser.email}
            </p>
            {!editingName && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ background: "var(--accent)", flex: 1, minWidth: "120px" }}
                  onClick={() => setEditingName(true)}
                >
                  Edit Name
                </button>
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ background: "var(--accent)", flex: 1, minWidth: "120px" }}
                  onClick={onSignOut}
                >
                  Sign Out
                </button>
              </div>
            )}
          </section>
        )}

        {/* Housing Preferences */}
        <section className="section-block">
          <h3 style={{ margin: "0 0 0.5rem" }}>Housing Preferences</h3>
          <p style={{ color: "var(--muted)", margin: "0 0 1rem", fontSize: "0.9rem" }}>
            Set your preferences so we can recommend listings you're interested in.
          </p>

          <div className="pref-form">
            {/* Housing type checkboxes */}
            <div className="housing-type-group">
              <label className="pref-check">
                <input
                  type="checkbox"
                  checked={preferences.onCampusHousing !== false}
                  onChange={(e) =>
                    setPreferences((c) => ({
                      ...c,
                      onCampusHousing: e.target.checked,
                    }))
                  }
                />
                <span>On-Campus Housing</span>
              </label>
              <label className="pref-check">
                <input
                  type="checkbox"
                  checked={preferences.offCampusHousing !== false}
                  onChange={(e) =>
                    setPreferences((c) => ({
                      ...c,
                      offCampusHousing: e.target.checked,
                    }))
                  }
                />
                <span>Off-Campus Housing</span>
              </label>
            </div>

            <label className="auth-field pref-field-row">
              <span>Looking for housing</span>
              <label className="pref-toggle">
                <input
                  type="checkbox"
                  checked={preferences.lookingForHousing !== false}
                  onChange={(e) =>
                    setPreferences((c) => ({
                      ...c,
                      lookingForHousing: e.target.checked,
                    }))
                  }
                />
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
              </label>
            </label>

            <div className="auth-form-grid">
              <label className="auth-field">
                <span>Max Price ($/month)</span>
                <input
                  type="number"
                  min="0"
                  value={preferences.maxPrice || ""}
                  onChange={(e) =>
                    setPreferences((c) => ({
                      ...c,
                      maxPrice: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="e.g. 2000"
                  className="pref-input"
                />
              </label>
              <label className="auth-field">
                <span>Min Bedrooms</span>
                <input
                  type="number"
                  min="1"
                  value={preferences.minBeds || ""}
                  onChange={(e) =>
                    setPreferences((c) => ({
                      ...c,
                      minBeds: Number(e.target.value) || 1,
                    }))
                  }
                  placeholder="1"
                  className="pref-input"
                />
              </label>
            </div>

            <label className="auth-field">
              <span>Keywords</span>
              <input
                type="text"
                value={preferences.keywords || ""}
                onChange={(e) =>
                  setPreferences((c) => ({
                    ...c,
                    keywords: e.target.value,
                  }))
                }
                placeholder="e.g. furnished, pet-friendly, parking"
                className="pref-input"
              />
            </label>

            <label className="auth-field">
              <span>Preferred Listing Types</span>
              <div className="pref-chips">
                {housingTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`pref-chip${
                      (preferences.preferredTypes || []).includes(t)
                        ? " active"
                        : ""
                    }`}
                    onClick={() => {
                      const current = preferences.preferredTypes || [];
                      const next = current.includes(t)
                        ? current.filter((x) => x !== t)
                        : [...current, t];
                      setPreferences((c) => ({
                        ...c,
                        preferredTypes: next,
                      }));
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </label>
          </div>
        </section>

        {/* Roommate Profile */}
        <section className="section-block">
          <h3 style={{ margin: "0 0 0.5rem" }}>Roommate Profile</h3>
          <p style={{ color: "var(--muted)", margin: "0 0 1rem", fontSize: "0.9rem" }}>
            Tell other students about your lifestyle and habits.
          </p>

          <form className="roommate-form" onSubmit={onSave}>
            <label className="auth-field">
              <span>Hobbies (comma-separated)</span>
              <input
                type="text"
                value={profileForm.hobbies}
                onChange={(e) =>
                  setProfileForm((c) => ({
                    ...c,
                    hobbies: e.target.value,
                  }))
                }
                placeholder="gym, cooking, gaming"
                className="pref-input"
              />
            </label>

            <div className="auth-form-grid">
              <label className="auth-field">
                <span>Cleanliness</span>
                <select
                  value={profileForm.cleanliness}
                  onChange={(e) =>
                    setProfileForm((c) => ({
                      ...c,
                      cleanliness: e.target.value,
                    }))
                  }
                >
                  {cleanlinessOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </label>
              <label className="auth-field">
                <span>Sleep schedule</span>
                <select
                  value={profileForm.sleepSchedule}
                  onChange={(e) =>
                    setProfileForm((c) => ({
                      ...c,
                      sleepSchedule: e.target.value,
                    }))
                  }
                >
                  {sleepScheduleOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>

            <button
              className="auth-submit-btn profile-save-btn"
              type="submit"
            >
              Save profile
            </button>
          </form>

          {saveMessage && (
            <p className="profile-save-message">{saveMessage}</p>
          )}
        </section>
      </main>
    </>
  );
}