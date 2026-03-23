import { useState } from "react";
import "./styles.css";
import sdsuLogo from "./assets/sdsulogo.jpg";
import Listings from "./components/Listings";
import AddListing from "./components/AddListing";

const navLinks = ["Home", "Listings", "Add Listing", "Profile", "Roommates", "Login"];
const apiBaseUrl = "http://127.0.0.1:5000";

const filters = [
  "Keyword search",
  "Price range",
  "Housing type",
  "Beds/Baths",
  "Neighborhood near SDSU",
];

const onCampusHousing = [
  {
    title: "South Campus Plaza, Sunset Plaza, Tacuba, Tepeyac, Texcoco (Tier 1)",
    subtitle: "9-month license rates",
    note: "Triple rooms are only offered in South Campus Plaza, Tacuba, Tepeyac, and Texcoco.",
    rooms: [
      {
        type: "Triple",
        rates: {
          "2nd Year Basic": "$14,133",
          "2nd Year Standard": "$16,133",
          "Flex 5": "$17,645",
          "Flex 7": "$18,509",
          "Meals Plus": "$19,117",
        },
      },
      {
        type: "Double",
        rates: {
          "2nd Year Basic": "$15,757",
          "2nd Year Standard": "$17,757",
          "Flex 5": "$19,269",
          "Flex 7": "$20,133",
          "Meals Plus": "$20,741",
        },
      },
      {
        type: "Single",
        rates: {
          "2nd Year Basic": "$18,453",
          "2nd Year Standard": "$20,453",
          "Flex 5": "$21,965",
          "Flex 7": "$22,829",
          "Meals Plus": "$23,437",
        },
      },
    ],
  },
  {
    title: "Toltec, Zacatepec (Tier 2)",
    subtitle: "9-month license rates",
    note: "Triple rooms are only offered in Zacatepec.",
    rooms: [
      {
        type: "Triple",
        rates: {
          "2nd Year Basic": "$14,493",
          "2nd Year Standard": "$16,493",
          "Flex 5": "$18,005",
          "Flex 7": "$18,869",
          "Meals Plus": "$19,477",
        },
      },
      {
        type: "Double",
        rates: {
          "2nd Year Basic": "$16,173",
          "2nd Year Standard": "$18,173",
          "Flex 5": "$19,685",
          "Flex 7": "$20,549",
          "Meals Plus": "$21,157",
        },
      },
      {
        type: "Single",
        rates: {
          "2nd Year Basic": "$18,965",
          "2nd Year Standard": "$20,965",
          "Flex 5": "$22,477",
          "Flex 7": "$23,341",
          "Meals Plus": "$23,949",
        },
      },
    ],
  },
  {
    title: "Aztec Corner, Granada, Mixquic, Piedra Del Sol, Villa Alvarado, Zapotec (Tier 3)",
    subtitle: "9-month license rates",
    note: "Triple rooms are only offered in Aztec Corner.",
    rooms: [
      {
        type: "Triple",
        rates: {
          "2nd Year Basic": "$16,077",
          "2nd Year Standard": "$18,077",
          "Flex 5": "$19,589",
          "Flex 7": "$20,453",
          "Meals Plus": "$21,061",
        },
      },
      {
        type: "Double",
        rates: {
          "2nd Year Basic": "$17,901",
          "2nd Year Standard": "$19,901",
          "Flex 5": "$21,413",
          "Flex 7": "$22,277",
          "Meals Plus": "$22,885",
        },
      },
      {
        type: "Single",
        rates: {
          "2nd Year Basic": "$21,037",
          "2nd Year Standard": "$23,037",
          "Flex 5": "$24,549",
          "Flex 7": "$25,413",
          "Meals Plus": "$26,021",
        },
      },
    ],
  },
];

const offCampusListings = [
  {
    title: "6 Nineteen Apartments",
    price: "$1,400 / month",
    area: "College Area",
    type: "Apartment",
    availability: "Available Aug 1",
    distance: "0.4 miles",
  },
  {
    title: "The Rive",
    price: "$1,800 / month",
    area: "Linda Vista",
    type: "Apartment",
    availability: "Available Now",
    distance: "1.0 miles",
  },
  {
    title: "College View Apartments",
    price: "$1,250 / month",
    area: "College Area",
    type: "Apartment",
    availability: "Available Sep 1",
    distance: "0.3 miles",
  },
  {
    title: "Casa Diego",
    price: "$1,600 / month",
    area: "Serra Mesa",
    type: "Apartment",
    availability: "Available Jul 15",
    distance: "3.2 miles",
  },
  {
    title: "Topaz Apartments",
    price: "$2,000 / month",
    area: "Tierrasanta",
    type: "Apartment",
    availability: "Available Aug 15",
    distance: "4.0 miles",
  },
];

const emptySignupForm = {
  firstName: "",
  lastName: "",
  redId: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emptyLoginForm = {
  email: "",
  password: "",
};

function validateSdsuEmail(email) {
  return /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)*sdsu\.edu$/i.test(email.trim());
}

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
          <h2>{isLogin ? "Welcome back to Aztec Housing Hub" : "Create your SDSU account"}</h2>
          <p className="hero-text">
            {isLogin
              ? "Log in with your SDSU email to manage your housing experience."
              : "Sign up with your SDSU information so students can access housing tools with verified campus emails."}
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-toggle" role="tablist" aria-label="Authentication options">
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
            <div className={`auth-alert ${globalMessage.type === "error" ? "error" : "success"}`}>
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
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="name@sdsu.edu"
                />
                {loginErrors.email && <small className="field-error">{loginErrors.email}</small>}
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Enter your password"
                />
                {loginErrors.password && (
                  <small className="field-error">{loginErrors.password}</small>
                )}
              </label>

              {loginErrors.general && <p className="field-error">{loginErrors.general}</p>}

              <button className="auth-submit-btn" type="submit" disabled={isSubmitting}>
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
                    onChange={(event) =>
                      setSignupForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    placeholder="First name"
                  />
                  {signupErrors.firstName && (
                    <small className="field-error">{signupErrors.firstName}</small>
                  )}
                </label>

                <label className="auth-field">
                  <span>Last Name</span>
                  <input
                    type="text"
                    value={signupForm.lastName}
                    onChange={(event) =>
                      setSignupForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    placeholder="Last name"
                  />
                  {signupErrors.lastName && (
                    <small className="field-error">{signupErrors.lastName}</small>
                  )}
                </label>
              </div>

              <label className="auth-field">
                <span>Red ID</span>
                <input
                  type="text"
                  value={signupForm.redId}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, redId: event.target.value }))
                  }
                  placeholder="9-digit Red ID"
                />
                {signupErrors.redId && <small className="field-error">{signupErrors.redId}</small>}
              </label>

              <label className="auth-field">
                <span>SDSU Email</span>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="name@sdsu.edu"
                />
                {signupErrors.email && <small className="field-error">{signupErrors.email}</small>}
              </label>

              <div className="auth-form-grid">
                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(event) =>
                      setSignupForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="At least 8 characters"
                  />
                  {signupErrors.password && (
                    <small className="field-error">{signupErrors.password}</small>
                  )}
                </label>

                <label className="auth-field">
                  <span>Confirm Password</span>
                  <input
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(event) =>
                      setSignupForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                    placeholder="Re-enter password"
                  />
                  {signupErrors.confirmPassword && (
                    <small className="field-error">{signupErrors.confirmPassword}</small>
                  )}
                </label>
              </div>

              <button className="auth-submit-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("on-campus");
  const [currentPage, setCurrentPage] = useState("home");
  const [subleaseListings, setSubleaseListings] = useState([]);
  const [authMode, setAuthMode] = useState("login");
  const [signupForm, setSignupForm] = useState(emptySignupForm);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [signupErrors, setSignupErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  function clearMessages() {
    setGlobalMessage({ type: "", text: "" });
  }

  function handleAddSublease(sublease) {
    setSubleaseListings((current) => [
      {
        ...sublease,
        id: Date.now(),
        type: "Sublease",
      },
      ...current,
    ]);
    setCurrentPage("listings");
  }

  function handleNavClick(event, link) {
    event.preventDefault();
    clearMessages();
    setIsAccountMenuOpen(false);

    if (link === "Home") {
      setCurrentPage("home");
      return;
    }

    if (link === "Listings") {
      setCurrentPage("listings");
      return;
    }

    if (link === "Add Listing") {
      setCurrentPage("add-listing");
      return;
    }

    if (link === "Login") {
      if (!currentUser) {
        setCurrentPage("auth");
      }
      return;
    }
  }

  function handleSignOut() {
    setCurrentUser(null);
    setCurrentPage("home");
    setAuthMode("login");
    setIsAccountMenuOpen(false);
    setLoginForm(emptyLoginForm);
    setSignupForm(emptySignupForm);
    setLoginErrors({});
    setSignupErrors({});
    setGlobalMessage({ type: "success", text: "You have been signed out." });
  }

  function validateSignupForm() {
    const errors = {};

    if (!signupForm.firstName.trim()) {
      errors.firstName = "First name is required.";
    }

    if (!signupForm.lastName.trim()) {
      errors.lastName = "Last name is required.";
    }

    if (!/^\d{9}$/.test(signupForm.redId.trim())) {
      errors.redId = "Red ID must be exactly 9 digits.";
    }

    if (!signupForm.email.trim()) {
      errors.email = "SDSU email is required.";
    } else if (!validateSdsuEmail(signupForm.email)) {
      errors.email = "Use a valid SDSU email address.";
    }

    if (!signupForm.password) {
      errors.password = "Password is required.";
    } else if (signupForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!signupForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  }

  function validateLoginForm() {
    const errors = {};

    if (!loginForm.email.trim()) {
      errors.email = "Email is required.";
    }

    if (!loginForm.password) {
      errors.password = "Password is required.";
    }

    return errors;
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();
    const errors = validateSignupForm();
    setSignupErrors(errors);
    setLoginErrors({});
    clearMessages();

    if (Object.keys(errors).length > 0) {
      setGlobalMessage({ type: "error", text: "Please fix the highlighted fields." });
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
      setSignupForm(emptySignupForm);
      setLoginForm((current) => ({ ...current, email: data.user.email, password: "" }));
      setAuthMode("login");
      setGlobalMessage({
        type: "success",
        text: "Account created successfully. You can log in now.",
      });
    } catch (error) {
      setGlobalMessage({
        type: "error",
        text: "Could not reach the server. Make sure the Python backend is running.",
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
      setGlobalMessage({ type: "error", text: "Please fix the highlighted fields." });
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
      setLoginForm(emptyLoginForm);
      setGlobalMessage({
        type: "success",
        text: `Welcome back, ${data.user.firstName}.`,
      });
    } catch (error) {
      setGlobalMessage({
        type: "error",
        text: "Could not reach the server. Make sure the Python backend is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-row">
          <div className="brand-lockup">
            <img className="brand-logo" src={sdsuLogo} alt="San Diego State logo" />
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
                      className={`account-menu-trigger ${isAccountMenuOpen ? "nav-active" : ""}`}
                      onClick={() => setIsAccountMenuOpen((open) => !open)}
                    >
                      Account
                    </button>
                    {isAccountMenuOpen && (
                      <div className="account-dropdown">
                        <p className="account-dropdown-name">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="account-dropdown-email">{currentUser.email}</p>
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
                (link === "Login" && currentPage === "auth");

              return (
                <a
                  href="/"
                  key={link}
                  className={isActive ? "nav-active" : ""}
                  onClick={(event) => handleNavClick(event, link)}
                >
                  {link}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      {currentPage === "listings" && (
        <main className="page-content">
          <Listings subleaseListings={subleaseListings} />
        </main>
      )}

      {currentPage === "add-listing" && (
        <main className="page-content">
          <AddListing onAddSublease={handleAddSublease} />
        </main>
      )}

      {currentPage === "auth" && !currentUser && (
        <AuthPage
          authMode={authMode}
          setAuthMode={(mode) => {
            setAuthMode(mode);
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

      {currentPage === "home" && (
        <main className="page-content">
          <section className="hero">
            <div>
              <h2>Find student housing near SDSU.</h2>
              <p className="hero-text">
                Browse listings, add housing posts, manage your profile, and connect with
                other students.
              </p>
            </div>

            <div className="hero-panel">
              <h3>Search Filters</h3>
              <div className="filter-list">
                {filters.map((filter) => (
                  <span className="filter-chip" key={filter}>
                    {filter}
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
                className={`tab-button ${activeTab === "on-campus" ? "active" : ""}`}
                onClick={() => setActiveTab("on-campus")}
              >
                On-Campus Housing (SDSU)
              </button>
              <button
                className={`tab-button ${activeTab === "off-campus" ? "active" : ""}`}
                onClick={() => setActiveTab("off-campus")}
              >
                Off-Campus Housing
              </button>
            </div>

            {activeTab === "on-campus" && onCampusHousing.length > 0 && (
              <div className="listings-section">
                {onCampusHousing.map((group) => (
                  <div className="housing-group" key={group.title}>
                    <h5>{group.title}</h5>
                    {group.subtitle && <p className="housing-subtitle">{group.subtitle}</p>}

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

                    {group.note && <p className="housing-note">* {group.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "off-campus" && (
              <div className="listings-section">
                <div className="listing-grid">
                  {offCampusListings.map((listing) => (
                    <article className="listing-card" key={listing.title}>
                      <h4>{listing.title}</h4>
                      <p>{listing.price}</p>
                      <p>
                        {listing.area} - {listing.distance} from campus
                      </p>
                      <p>{listing.type}</p>
                      <p>{listing.availability}</p>
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
