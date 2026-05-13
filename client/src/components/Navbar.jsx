import AccountMenu from "./AccountMenu";
import sdsuLogo from "../assets/sdsulogo.jpg";

// Inline user icon SVG — inherits currentColor for seamless theming
function UserIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ verticalAlign: "middle", marginRight: "0.35rem" }}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const linkToHash = (link) => {
  const map = {
    "Home": "",
    "Listings": "listings",
    "Add Listing": "add-listing",
  };
  return "#/" + (map[link] ?? "");
};

export default function Navbar({
  navLinks,
  currentPage,
  currentUser,
  isAccountMenuOpen,
  onNavClick,
  onToggleAccount,
  onSignOut,
}) {
  function handleNavClick(event, link) {
    onNavClick(event, link);
  }

  // Gate links based on auth state
  // "Login / Signup" is handled by the account trigger button — exclude from nav links
  // Add Listing only shows when authenticated
  const authOnlyLinks = new Set(["Add Listing"]);
  const loginSignupLink = "Login / Signup";
  const visibleLinks = navLinks.filter((link) => {
    if (link === loginSignupLink) return false;
    if (authOnlyLinks.has(link)) return !!currentUser;
    // "Profile" is no longer a nav link — user icon handles profile access
    return link !== "Profile";
  });

  function handleAccountClick() {
    if (currentUser) {
      onToggleAccount();
    } else {
      // Navigate to login/signup when not logged in
      const fakeEvent = { preventDefault: () => {} };
      handleNavClick(fakeEvent, "Login / Signup");
    }
  }

  return (
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
          {visibleLinks.map((link) => {
            const isActive =
              (link === "Home" && currentPage === "home") ||
              (link === "Listings" && currentPage === "listings") ||
              (link === "Add Listing" && currentPage === "add-listing");

            return (
              <a
                href={linkToHash(link)}
                key={link}
                className={isActive ? "nav-active" : ""}
                onClick={(e) => handleNavClick(e, link)}
              >
                {link}
              </a>
            );
          })}

          {/* Single account trigger — always visible */}
          {currentUser ? (
            <div className="account-menu">
              <button
                type="button"
                className={`account-menu-trigger ${
                  isAccountMenuOpen ? "nav-active" : ""
                }`}
                onClick={handleAccountClick}
              >
                <UserIcon size={18} />
                {currentUser.firstName}
              </button>
              {isAccountMenuOpen && (
                <AccountMenu
                  user={currentUser}
                  onSignOut={onSignOut}
                  onNavigateToProfile={() => {
                    onNavClick({ preventDefault: () => {} }, "Profile");
                  }}
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              className={`account-menu-trigger${
                currentPage === "auth" ? " auth-active" : ""
              }`}
              onClick={handleAccountClick}
              aria-label="Login or sign up"
            >
              <UserIcon size={18} />
              Login / Signup
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}