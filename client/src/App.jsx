import { useState, useEffect } from "react";
import "./styles.css";
import sdsuLogo from "./assets/sdsulogo.jpg";
import Listings from "./components/Listings";
import AddListing from "./components/AddListing";

const apiBaseUrl = "http://127.0.0.1:5000";

// ──────────────────────────────────────────────────────────────────────
// Auth Page
// ──────────────────────────────────────────────────────────────────────
function AuthPage({
  authMode,
  setAuthMode,
  signupForm,
  setSignupForm,
  signupErrors,
  loginForm,
  setLoginForm,
  loginErrors,
  globalMessage,
  isSubmitting,
  onSignupSubmit,
  onLoginSubmit,
}) {
  const isLogin = authMode === "login";

  return (
    <main className="page-content">
      <section className="auth-hero">
        <div>
          <p className="eyebrow">Student Access</p>
          <h2>
            {isLogin
              ? "Welcome back to Aztec Housing Hub"
              : "Create your SDSU account"}
          </h2>
          <p className="hero-text">
            {isLogin
              ? "Log in with your SDSU email to manage your housing experience."
              : "Sign up with your SDSU information so students can access housing tools with verified campus emails."}
          </p>
        </div>

        <div className="auth-card">
          <div
            className="auth-toggle"
            role="tablist"
            aria-label="Authentication options"
          >
            <button
              className={`auth-toggle-btn ${isLogin ? "active" : ""}`}
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`auth-toggle-btn ${!isLogin ? "active" : ""}`}
              onClick={() => setAuthMode("signup")}
              type="button"
            >
              Sign Up
            </button>
          </div>

          {globalMessage.text && (
            <div
              className={`auth-alert ${
                globalMessage.type === "error" ? "error" : "success"
              }`}
            >
              {globalMessage.text}
            </div>
          )}

          {isLogin ? (
            <form className="auth-form" onSubmit={onLoginSubmit}>
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm((c) => ({ ...c, email: e.target.value }))
                  }
                  placeholder="name@sdsu.edu"
                />
                {loginErrors.email && (
                  <small className="field-error">{loginErrors.email}</small>
                )}
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((c) => ({ ...c, password: e.target.value }))
                  }
                  placeholder="Enter your password"
                />
                {loginErrors.password && (
                  <small className="field-error">{loginErrors.password}</small>
                )}
              </label>

              {loginErrors.general && (
                <p className="field-error">{loginErrors.general}</p>
              )}

              <button
                className="auth-submit-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={onSignupSubmit}>
              <div className="auth-form-grid">
                <label className="auth-field">
                  <span>First Name</span>
                  <input
                    type="text"
                    value={signupForm.firstName}
                    onChange={(e) =>
                      setSignupForm((c) => ({
                        ...c,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="First name"
                  />
                  {signupErrors.firstName && (
                    <small className="field-error">
                      {signupErrors.firstName}
                    </small>
                  )}
                </label>
                <label className="auth-field">
                  <span>Last Name</span>
                  <input
                    type="text"
                    value={signupForm.lastName}
                    onChange={(e) =>
                      setSignupForm((c) => ({
                        ...c,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Last name"
                  />
                  {signupErrors.lastName && (
                    <small className="field-error">
                      {signupErrors.lastName}
                    </small>
                  )}
                </label>
              </div>

              <label className="auth-field">
                <span>Red ID</span>
                <input
                  type="text"
                  value={signupForm.redId}
                  onChange={(e) =>
                    setSignupForm((c) => ({ ...c, redId: e.target.value }))
                  }
                  placeholder="9-digit Red ID"
                />
                {signupErrors.redId && (
                  <small className="field-error">{signupErrors.redId}</small>
                )}
              </label>

              <label className="auth-field">
                <span>SDSU Email</span>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm((c) => ({ ...c, email: e.target.value }))
                  }
                  placeholder="name@sdsu.edu"
                />
                {signupErrors.email && (
                  <small className="field-error">{signupErrors.email}</small>
                )}
              </label>

              <div className="auth-form-grid">
                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm((c) => ({
                        ...c,
                        password: e.target.value,
                      }))
                    }
                    placeholder="At least 8 characters"
                  />
                  {signupErrors.password && (
                    <small className="field-error">
                      {signupErrors.password}
                    </small>
                  )}
                </label>
                <label className="auth-field">
                  <span>Confirm Password</span>
                  <input
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) =>
                      setSignupForm((c) => ({
                        ...c,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Re-enter password"
                  />
                  {signupErrors.confirmPassword && (
                    <small className="field-error">
                      {signupErrors.confirmPassword}
                    </small>
                  )}
                </label>
              </div>

              <button
                className="auth-submit-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Profile Page
// ──────────────────────────────────────────────────────────────────────
function ProfilePage({
  profileForm,
  setProfileForm,
  onSave,
  saveMessage,
  cleanlinessOptions,
  sleepScheduleOptions,
}) {
  return (
    <main className="page-content">
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Roommate Profile</p>
          <h3>Set your preferences</h3>
        </div>

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
  );
}

// ──────────────────────────────────────────────────────────────────────
// Roommates Page
// ──────────────────────────────────────────────────────────────────────
function RoommatesPage({
  profileForm,
  roommateProfiles,
  cleanlinessOptions,
  sleepScheduleOptions,
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
        roommate.hobbies.some((h) =>
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
    <main className="page-content">
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Roommate Finder</p>
          <h3>Filter similar roommates</h3>
        </div>

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
              <article className="listing-card" key={roommate.id}>
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
                  Hobbies: {roommate.hobbies.join(", ")}
                </p>
                <p className="hero-text">{roommate.bio}</p>
                {roommate.commonHobbies.length > 0 && (
                  <p className="roommate-common-hobbies">
                    Shared interests:{" "}
                    {roommate.commonHobbies.join(", ")}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Pure helpers (no hardcoded data)
// ──────────────────────────────────────────────────────────────────────

function validateSdsuEmail(email) {
  return /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)*sdsu\.edu$/i.test(
    email.trim()
  );
}

function normalizeHobbies(hobbies) {
  return hobbies
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function calculateCompatibility(userProfile, candidate) {
  let score = 0;

  if (userProfile.cleanliness === candidate.cleanliness) {
    score += 40;
  } else if (
    userProfile.cleanliness === "Moderately clean" ||
    candidate.cleanliness === "Moderately clean"
  ) {
    score += 20;
  }

  if (userProfile.sleepSchedule === candidate.sleepSchedule) {
    score += 35;
  } else if (
    userProfile.sleepSchedule === "Balanced" ||
    candidate.sleepSchedule === "Balanced"
  ) {
    score += 20;
  }

  const userHobbies = normalizeHobbies(userProfile.hobbies);
  const commonHobbies = candidate.hobbies.filter((hobby) =>
    userHobbies.includes(hobby)
  );
  score += Math.min(commonHobbies.length * 15, 25);

  return {
    score: Math.min(score, 100),
    commonHobbies,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Main App Component
// ──────────────────────────────────────────────────────────────────────

export default function App() {
  // ── Data fetched from backend API ──
  const [onCampusHousing, setOnCampusHousing] = useState([]);
  const [offCampusListings, setOffCampusListings] = useState([]);
  const [roommateProfiles, setRoommateProfiles] = useState([]);
  const [appConfig, setAppConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ── UI state ──
  const [activeTab, setActiveTab] = useState("on-campus");
  const [currentPage, setCurrentPage] = useState("home");
  const [subleaseListings, setSubleaseListings] = useState([]);
  const [authMode, setAuthMode] = useState("login");
  const [signupForm, setSignupForm] = useState({});
  const [loginForm, setLoginForm] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profileSaveMessage, setProfileSaveMessage] = useState("");

  // ── Fetch all data from backend on mount ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [listingsRes, roommatesRes, configRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/listings`),
          fetch(`${apiBaseUrl}/api/roommates`),
          fetch(`${apiBaseUrl}/api/config`),
        ]);

        if (!listingsRes.ok)
          throw new Error(
            `Failed to load listings (${listingsRes.status})`
          );
        if (!roommatesRes.ok)
          throw new Error(
            `Failed to load roommates (${roommatesRes.status})`
          );
        if (!configRes.ok)
          throw new Error(`Failed to load config (${configRes.status})`);

        const listings = await listingsRes.json();
        const roommates = await roommatesRes.json();
        const config = await configRes.json();

        setOnCampusHousing(listings.onCampus || []);
        setOffCampusListings(listings.offCampus || []);
        setRoommateProfiles(roommates || []);
        setAppConfig(config || {});
        setSignupForm(config.emptySignupForm || {});
        setLoginForm(config.emptyLoginForm || {});
        setProfileForm(config.emptyProfileForm || {});
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Derived config values (safe fallbacks while loading) ──
  const navLinks = appConfig?.navLinks || [];
  const filters = appConfig?.filters || [];
  const cleanlinessOptions = appConfig?.cleanlinessOptions || [];
  const sleepScheduleOptions = appConfig?.sleepScheduleOptions || [];

  // ── Message helpers ──
  function clearMessages() {
    setGlobalMessage({ type: "", text: "" });
  }

  function handleAddSublease(sublease) {
    setSubleaseListings((current) => [
      { ...sublease, id: Date.now(), type: "Sublease" },
      ...current,
    ]);
    setCurrentPage("listings");
  }

  // ── Navigation ──
  function handleNavClick(event, link) {
    event.preventDefault();
    clearMessages();
    setIsAccountMenuOpen(false);

    if (link === "Home") {
      setCurrentPage("home");
    } else if (link === "Listings") {
      setCurrentPage("listings");
    } else if (link === "Add Listing") {
      setCurrentPage("add-listing");
    } else if (link === "Login") {
      if (!currentUser) setCurrentPage("auth");
    } else if (link === "Profile") {
      if (currentUser) {
        setCurrentPage("profile");
      } else {
        setCurrentPage("auth");
        setGlobalMessage({
          type: "error",
          text: "Log in to edit your roommate profile.",
        });
      }
    } else if (link === "Roommates") {
      if (currentUser) {
        setCurrentPage("roommates");
      } else {
        setCurrentPage("auth");
        setGlobalMessage({
          type: "error",
          text: "Log in to browse roommate matches.",
        });
      }
    }
  }

  function handleSignOut() {
    setCurrentUser(null);
    setCurrentPage("home");
    setAuthMode("login");
    setIsAccountMenuOpen(false);
    setLoginForm(appConfig?.emptyLoginForm || {});
    setSignupForm(appConfig?.emptySignupForm || {});
    setLoginErrors({});
    setSignupErrors({});
    setGlobalMessage({ type: "success", text: "You have been signed out." });
  }

  // ── Form validation ──
  function validateSignupForm() {
    const errors = {};
    if (!signupForm.firstName?.trim())
      errors.firstName = "First name is required.";
    if (!signupForm.lastName?.trim())
      errors.lastName = "Last name is required.";
    if (!/^\d{9}$/.test(signupForm.redId?.trim() || ""))
      errors.redId = "Red ID must be exactly 9 digits.";
    if (!signupForm.email?.trim())
      errors.email = "SDSU email is required.";
    else if (!validateSdsuEmail(signupForm.email))
      errors.email = "Use a valid SDSU email address.";
    if (!signupForm.password)
      errors.password = "Password is required.";
    else if (signupForm.password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    if (!signupForm.confirmPassword)
      errors.confirmPassword = "Please confirm your password.";
    else if (signupForm.password !== signupForm.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";
    return errors;
  }

  function validateLoginForm() {
    const errors = {};
    if (!loginForm.email?.trim()) errors.email = "Email is required.";
    if (!loginForm.password) errors.password = "Password is required.";
    return errors;
  }

  // ── Auth handlers ──
  async function handleSignupSubmit(event) {
    event.preventDefault();
    const errors = validateSignupForm();
    setSignupErrors(errors);
    setLoginErrors({});
    clearMessages();

    if (Object.keys(errors).length > 0) {
      setGlobalMessage({
        type: "error",
        text: "Please fix the highlighted fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: signupForm.firstName.trim(),
          lastName: signupForm.lastName.trim(),
          redId: signupForm.redId.trim(),
          email: signupForm.email.trim(),
          password: signupForm.password,
          confirmPassword: signupForm.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignupErrors(data.errors ?? {});
        setGlobalMessage({
          type: "error",
          text: data.message || "Unable to create your account.",
        });
        return;
      }

      setSignupErrors({});
      setSignupForm(appConfig?.emptySignupForm || {});
      setLoginForm((c) => ({ ...c, email: data.user.email, password: "" }));
      setAuthMode("login");
      setGlobalMessage({
        type: "success",
        text: "Account created successfully. You can log in now.",
      });
    } catch (error) {
      setGlobalMessage({
        type: "error",
        text:
          "Could not reach the server. Make sure the Python backend is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    const errors = validateLoginForm();
    setLoginErrors(errors);
    setSignupErrors({});
    clearMessages();

    if (Object.keys(errors).length > 0) {
      setGlobalMessage({
        type: "error",
        text: "Please fix the highlighted fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginErrors(data.errors ?? {});
        setGlobalMessage({
          type: "error",
          text: data.errors?.general || data.message || "Unable to log in.",
        });
        return;
      }

      setCurrentUser(data.user);
      setCurrentPage("home");
      setIsAccountMenuOpen(false);
      setLoginErrors({});
      setLoginForm(appConfig?.emptyLoginForm || {});
      setGlobalMessage({
        type: "success",
        text: `Welcome back, ${data.user.firstName}.`,
      });
    } catch (error) {
      setGlobalMessage({
        type: "error",
        text:
          "Could not reach the server. Make sure the Python backend is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleProfileSave(event) {
    event.preventDefault();
    setProfileSaveMessage("Roommate profile saved.");
  }

  // ── Guard: server unreachable ──
  if (loading) {
    return (
      <main className="page-content">
        <p>Loading application data…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="page-content">
        <p style={{ color: "#b42318", fontWeight: 600 }}>
          Could not load data from server.
        </p>
        <p>
          Error: {loadError}
          <br />
          Make sure the backend is running at {apiBaseUrl}
        </p>
      </main>
    );
  }

  // prettier-ignore
  return (
    <div className="app-shell">
      {/* ── Site Header ─────────────────────────────────── */}
      <header className="site-header">
        <div className="brand-row">
          <div className="brand-lockup">
            <img
              className="brand-logo"
              src={sdsuLogo}
              alt="San Diego State logo"
            />
            <div>
              <p className="eyebrow">San Diego State University</p>
              <h1>Aztec Housing Hub</h1>
            </div>
          </div>

          <nav className="top-nav" aria-label="Primary">
            {navLinks.map((link) => {
              if (link === "Login" && currentUser) {
                return (
                  <div className="account-menu" key={link}>
                    <button
                      type="button"
                      className={`account-menu-trigger ${
                        isAccountMenuOpen ? "nav-active" : ""
                      }`}
                      onClick={() =>
                        setIsAccountMenuOpen((o) => !o)
                      }
                    >
                      Account
                    </button>
                    {isAccountMenuOpen && (
                      <div className="account-dropdown">
                        <p className="account-dropdown-name">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="account-dropdown-email">
                          {currentUser.email}
                        </p>
                        <button
                          type="button"
                          className="account-dropdown-action"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              const isActive =
                (link === "Home" && currentPage === "home") ||
                (link === "Listings" && currentPage === "listings") ||
                (link === "Add Listing" && currentPage === "add-listing") ||
                (link === "Profile" && currentPage === "profile") ||
                (link === "Roommates" && currentPage === "roommates") ||
                (link === "Login" && currentPage === "auth");

              return (
                <a
                  href="/"
                  key={link}
                  className={isActive ? "nav-active" : ""}
                  onClick={(e) => handleNavClick(e, link)}
                >
                  {link}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Pages ───────────────────────────────────────── */}

      {/* ── Listings Browser ── */}
      {currentPage === "listings" && (
        <main className="page-content">
          <Listings
            subleaseListings={subleaseListings}
            offCampusListings={offCampusListings}
            housingTypes={appConfig?.housingTypes || []}
            priceRanges={appConfig?.priceRanges || []}
            bedOptions={appConfig?.bedOptions || []}
          />
        </main>
      )}

      {/* ── Add Sublease ── */}
      {currentPage === "add-listing" && (
        <main className="page-content">
          <AddListing onAddSublease={handleAddSublease} />
        </main>
      )}

      {/* ── Auth (Login / Signup) ── */}
      {currentPage === "auth" && !currentUser && (
        <AuthPage
          authMode={authMode}
          setAuthMode={(m) => {
            setAuthMode(m);
            clearMessages();
            setSignupErrors({});
            setLoginErrors({});
          }}
          signupForm={signupForm}
          setSignupForm={setSignupForm}
          signupErrors={signupErrors}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          loginErrors={loginErrors}
          globalMessage={globalMessage}
          isSubmitting={isSubmitting}
          onSignupSubmit={handleSignupSubmit}
          onLoginSubmit={handleLoginSubmit}
        />
      )}

      {/* ── Profile ── */}
      {currentPage === "profile" && currentUser && (
        <ProfilePage
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          onSave={handleProfileSave}
          saveMessage={profileSaveMessage}
          cleanlinessOptions={cleanlinessOptions}
          sleepScheduleOptions={sleepScheduleOptions}
        />
      )}

      {/* ── Roommates ── */}
      {currentPage === "roommates" && currentUser && (
        <RoommatesPage
          profileForm={profileForm}
          roommateProfiles={roommateProfiles}
          cleanlinessOptions={cleanlinessOptions}
          sleepScheduleOptions={sleepScheduleOptions}
        />
      )}

      {/* ── Home ── */}
      {currentPage === "home" && (
        <main className="page-content">
          <section className="hero">
            <div>
              <h2>Find student housing near SDSU.</h2>
              <p className="hero-text">
                Browse listings, add housing posts, manage your profile, and
                connect with other students.
              </p>
            </div>

            <div className="hero-panel">
              <h3>Search Filters</h3>
              <div className="filter-list">
                {filters.map((f) => (
                  <span className="filter-chip" key={f}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <p className="eyebrow">Listings Feed</p>
              <h3>Housing Options near SDSU</h3>
            </div>

            <div className="tabs">
              <button
                className={`tab-button ${
                  activeTab === "on-campus" ? "active" : ""
                }`}
                onClick={() => setActiveTab("on-campus")}
              >
                On-Campus Housing (SDSU)
              </button>
              <button
                className={`tab-button ${
                  activeTab === "off-campus" ? "active" : ""
                }`}
                onClick={() => setActiveTab("off-campus")}
              >
                Off-Campus Housing
              </button>
            </div>

            {/* ── On-Campus: rate tables ── */}
            {activeTab === "on-campus" &&
              onCampusHousing.length > 0 && (
                <div className="listings-section">
                  {onCampusHousing.map((group) => (
                    <div className="housing-group" key={group.title}>
                      <h5>{group.title}</h5>
                      {group.subtitle && (
                        <p className="housing-subtitle">{group.subtitle}</p>
                      )}

                      <div className="housing-table-wrap">
                        <table className="housing-table">
                          <thead>
                            <tr>
                              <th>Room type</th>
                              <th>2nd Year Basic</th>
                              <th>2nd Year Standard</th>
                              <th>Flex 5</th>
                              <th>Flex 7</th>
                              <th>Meals Plus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.rooms.map((room) => (
                              <tr key={room.type}>
                                <td>{room.type}</td>
                                <td>{room.rates["2nd Year Basic"]}</td>
                                <td>{room.rates["2nd Year Standard"]}</td>
                                <td>{room.rates["Flex 5"]}</td>
                                <td>{room.rates["Flex 7"]}</td>
                                <td>{room.rates["Meals Plus"]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {group.note && (
                        <p className="housing-note">* {group.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

            {/* ── Off-Campus: cards ── */}
            {activeTab === "off-campus" &&
              offCampusListings.length > 0 && (
                <div className="listings-section">
                  <div className="listing-grid">
                    {offCampusListings.map((listing) => (
                      <article className="listing-card" key={listing.id}>
                        <div className="card-type-badge">{listing.type}</div>
                        <h4>{listing.title}</h4>
                        <p className="card-price">
                          ${listing.price.toLocaleString()} / month
                        </p>
                        <p className="card-meta">
                          {listing.area} &bull; {listing.distance} mi from
                          campus
                        </p>
                        <p className="card-meta">
                          {listing.beds} Bed / {listing.baths} Bath
                        </p>
                        <p className="card-availability">
                          {listing.availability}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
          </section>
        </main>
      )}
    </div>
  );
}