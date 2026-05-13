import React, { useState } from "react";
import { checkProfanity } from "../../utils/profanity";

const housingTypes = ["All", "Apartment", "Room", "House", "Sublease"];

export default function ProfilePage({
  profileForm,
  setProfileForm,
  preferences,
  setPreferences,
  onSave,
  onSignOut,
  saveMessage,
  cleanlinessOptions,
  sleepScheduleOptions,
  currentUser,
}) {
  const [hobbyError, setHobbyError] = useState("");
  const [keywordError, setKeywordError] = useState("");
  const [descError, setDescError] = useState("");
  const [statusError, setStatusError] = useState("");

  const roommateStatusOptions = [
    { value: "", label: "Not set" },
    { value: "looking", label: "Looking for roommates" },
    { value: "lookingToRoom", label: "Looking to room with others" },
    { value: "notLooking", label: "Not looking for roommates" },
  ];

  const handleHobbiesChange = (value) => {
    setProfileForm((c) => ({ ...c, hobbies: value }));
    if (hobbyError) setHobbyError("");
  };

  const handleHobbiesBlur = async (value) => {
    if (!value?.trim()) {
      setHobbyError("");
      return;
    }
    const result = await checkProfanity(value.trim());
    if (result.isProfane) {
      setHobbyError("Hobbies contain inappropriate language.");
    }
  };

  const handleKeywordsChange = (value) => {
    setPreferences((c) => ({ ...c, keywords: value }));
    if (keywordError) setKeywordError("");
  };

  const handleKeywordsBlur = async (value) => {
    if (!value?.trim()) {
      setKeywordError("");
      return;
    }
    const result = await checkProfanity(value.trim());
    if (result.isProfane) {
      setKeywordError("Keywords contain inappropriate language.");
    }
  };

  const handleDescriptionChange = (value) => {
    setProfileForm((c) => ({ ...c, description: value }));
    if (descError) setDescError("");
  };

  const handleDescriptionBlur = async (value) => {
    if (!value?.trim()) {
      setDescError("");
      return;
    }
    const result = await checkProfanity(value.trim());
    if (result.isProfane) {
      setDescError("Description contains inappropriate language.");
    }
  };

  const handleStatusChange = (value) => {
    setProfileForm((c) => ({ ...c, roommateStatus: value }));
    if (statusError) setStatusError("");
  };

  return (
    <>
      <div className="page-banner">
        <div className="page-banner-inner">
          <p className="eyebrow">Preferences</p>
          <h2>Set Your Preferences</h2>
          <p>Configure your housing search settings and tell others about yourself.</p>
        </div>
      </div>

      <main className="page-content">
        {/* User info */}
        {currentUser && (
          <section className="section-block profile-header-block">
            <div className="profile-header-inner">
              <div className="profile-avatar">
                <span className="profile-avatar-placeholder">&#128100;</span>
              </div>
              <div className="profile-header-info">
                <h3 className="profile-name">
                  {currentUser.firstName} {currentUser.lastName}
                </h3>
                <p className="profile-meta">
                  Red ID: <span className="profile-meta-value">{currentUser.redId || "N/A"}</span>
                </p>
                <p className="profile-meta">
                  Email: <span className="profile-meta-value">{currentUser.email}</span>
                </p>
              </div>
              <button
                type="button"
                className="btn-accent profile-signout-btn"
                onClick={onSignOut}
              >
                Sign Out
              </button>
            </div>
          </section>
        )}

        {/* Housing Preferences */}
        <section className="section-block">
          <h3 className="section-title">
            <span className="section-icon">&#128205;</span> Housing Preferences
          </h3>
          <p className="section-subtitle">
            Set your preferences so we can recommend listings you&rsquo;re interested in.
          </p>

          <div className="pref-form">
            {/* Housing type checkboxes */}
            <div className="pref-field-group">
              <div className="pref-field-header">Housing Placement</div>
              <select
                value={preferences.housingPlacement || "both"}
                onChange={(e) =>
                  setPreferences((c) => ({
                    ...c,
                    housingPlacement: e.target.value,
                  }))
                }
                className="pref-select"
              >
                <option value="both">Both On-Campus &amp; Off-Campus</option>
                <option value="onCampus">On-Campus Housing Only</option>
                <option value="offCampus">Off-Campus Housing Only</option>
              </select>
            </div>

            {/* Looking for housing checkbox */}
            <div className="pref-field-group">
              <div className="pref-field-header">Availability</div>
              <label className="pref-check">
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
                <span>Looking for housing</span>
              </label>
            </div>

            {/* Price and bedrooms */}
            <div className="pref-field-group">
              <div className="pref-field-header">Budget &amp; Space</div>
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
            </div>

            {/* Keywords */}
            <div className="pref-field-group">
              <div className="pref-field-header">Search Keywords</div>
              <label className="auth-field">
                <span>Keywords</span>
                <input
                  type="text"
                  value={preferences.keywords || ""}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  onBlur={(e) => handleKeywordsBlur(e.target.value)}
                  placeholder="e.g. furnished, pet-friendly, parking"
                  className={`pref-input${keywordError ? " field-error-input" : ""}`}
                />
                {keywordError && (
                  <small className="field-error">{keywordError}</small>
                )}
              </label>
            </div>

            {/* Preferred listing types */}
            <div className="pref-field-group">
              <div className="pref-field-header">Preferred Listing Types</div>
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
            </div>
          </div>
        </section>

        {/* Roommate Status & Description */}
        <section className="section-block">
          <h3 className="section-title">
            <span className="section-icon">&#127919;</span> About You &amp; Roommate Status
          </h3>
          <p className="section-subtitle">
            Tell other students about yourself and what you&rsquo;re looking for in a living situation.
          </p>

          <div className="pref-form">
            {/* Roommate Status */}
            <div className="pref-field-group">
              <div className="pref-field-header">Roommate Status</div>
              <div className="auth-field">
                <span>What best describes your situation?</span>
                <select
                  value={profileForm.roommateStatus || ""}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`pref-select${statusError ? " field-error-input" : ""}`}
                >
                  {roommateStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {statusError && (
                  <small className="field-error">{statusError}</small>
                )}
              </div>
            </div>

            {/* Description / About Me */}
            <div className="pref-field-group">
              <div className="pref-field-header">About Me</div>
              <div className="auth-field">
                <span>Tell us about yourself — hobbies, interests, lifestyle, what you like to do, etc.</span>
                <textarea
                  rows="5"
                  value={profileForm.description || ""}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  onBlur={(e) => handleDescriptionBlur(e.target.value)}
                  placeholder="I love hiking, cooking, and studying at the library. I&rsquo;m a night owl who enjoys quiet spaces..."
                  className={`pref-textarea${descError ? " field-error-input" : ""}`}
                />
                {descError && (
                  <small className="field-error">{descError}</small>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-accent profile-save-btn"
            onClick={onSave}
          >
            Save Preferences
          </button>
          {saveMessage && (
            <p className="profile-save-message">{saveMessage}</p>
          )}
        </div>
      </main>
    </>
  );
}