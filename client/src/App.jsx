import { useState, useEffect } from "react";
import "./styles.css";
import sdsuLogo from "./assets/sdsulogo.jpg";
import AppShell from "./components/AppShell";
import Navbar from "./components/Navbar";
import HomePage from "./components/pages/HomePage";
import ListingsPage from "./components/pages/ListingsPage";
import AddListing from "./components/pages/AddListing";
import AuthPage from "./components/pages/AuthPage";
import ProfilePage from "./components/pages/ProfilePage";
import RoommatesPage from "./components/pages/RoommatesPage";
import LoadingSpinner from "./components/shared/LoadingSpinner";
import ErrorBanner from "./components/shared/ErrorBanner";
import { calculateCompatibility } from "./components/shared/compatibility";

// Proxy prefix for Vite dev server (see vite.config.js).
// In production, the built frontend expects API paths under /api.
const apiBaseUrl = "/api";

function buildUrl(path) {
  return apiBaseUrl + path;
}

export default function App() {
  // ── Data fetched from backend API ──
  const [onCampusHousing, setOnCampusHousing] = useState([]);
  const [offCampusListings, setOffCampusListings] = useState([]);
  const [roommateProfiles, setRoommateProfiles] = useState([]);
  const [appConfig, setAppConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ── UI state ──
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
  const [currentPage, setCurrentPage] = useState("home");

  // ── Fetch all data from backend on mount ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [listingsRes, roommatesRes, configRes] = await Promise.all([
          fetch(buildUrl("/listings")),
          fetch(buildUrl("/roommates")),
          fetch(buildUrl("/config")),
        ]);

        if (!listingsRes.ok)
          throw new Error(`Failed to load listings (${listingsRes.status})`);
        if (!roommatesRes.ok)
          throw new Error(`Failed to load roommates (${roommatesRes.status})`);
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
  const housingTypes = appConfig?.housingTypes || [];
  const priceRanges = appConfig?.priceRanges || [];
  const bedOptions = appConfig?.bedOptions || [];
  const emptyPreferences = appConfig?.emptyPreferences || {};

  // ── Preferences & user listings ──
  const [preferences, setPreferences] = useState(emptyPreferences);

  const allListings = [...(onCampusHousing || []), ...(offCampusListings || [])];

  const myListings = currentUser
    ? allListings.filter((l) => l.ownerEmail === currentUser.email)
    : [];

  const canCreateListing = myListings.length < 3;

  // ── Click tracking ──
  async function handleTrackClick(listingId) {
    try {
      await fetch(buildUrl("/track-click"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
    } catch {
      // silently ignore tracking failures
    }
  }

  // ── Message helpers ──
  function clearMessages() {
    setGlobalMessage({ type: "", text: "" });
  }

  function handleAddListing(listing) {
    setOffCampusListings((current) => [listing, ...current]);
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
    } else if (link === "Login / Signup") {
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

  // Update user name via backend API
  async function handleUpdateName(firstName, lastName) {
    if (!currentUser) return;
    try {
      const response = await fetch(buildUrl("/update-name"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setGlobalMessage({
          type: "error",
          text: data.message || "Failed to update name.",
        });
        return;
      }
      // Update local user state with new name
      setCurrentUser((prev) => ({
        ...prev,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      }));
      setGlobalMessage({
        type: "success",
        text: "Name updated successfully.",
      });
    } catch (error) {
      setGlobalMessage({
        type: "error",
        text: "Could not reach the server. Try again later.",
      });
    }
  }

  // ── Form validation ──
  function validateSignupForm() {
    const errors = {};
    if (!signupForm.firstName?.trim())
      errors.firstName = "First name is required.";
    if (!signupForm.lastName?.trim())
      errors.lastName = "Last name is required.";
    if (!/^\d{1,9}$/.test(signupForm.redId?.trim() || ""))
      errors.redId = "Red ID must be 1-9 digits.";
    if (!signupForm.email?.trim())
      errors.email = "Email name is required.";
    else if (!/^[A-Za-z0-9._%+-]+$/.test(signupForm.email.trim()))
      errors.email = "Use a valid email name (letters, numbers, dots, etc.).";
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
    const signupEmail =
      signupForm.email.trim().replace(/@sdsu\.edu$/, "") + "@sdsu.edu";
    try {
      const response = await fetch(buildUrl("/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: signupForm.firstName.trim(),
          lastName: signupForm.lastName.trim(),
          redId: signupForm.redId.trim(),
          email: signupEmail,
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

      // Auto-login after successful signup
      const loginRes = await fetch(buildUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.user.email,
          password: signupForm.password,
        }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        setCurrentUser(loginData.user);
        setCurrentPage("home");
        setIsAccountMenuOpen(false);
        setSignupForm(appConfig?.emptySignupForm || {});
        setLoginForm(appConfig?.emptyLoginForm || {});
        setSignupErrors({});
        setLoginErrors({});
        setGlobalMessage({
          type: "success",
          text: `Account created successfully. Welcome, ${loginData.user.firstName}!`,
        });
      } else {
        const loginData = await loginRes.json();
        setSignupErrors(loginData.errors ?? {});
        setGlobalMessage({
          type: "error",
          text:
            loginData.message ||
            "Account created but could not log in automatically.",
        });
      }
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
    const loginEmail =
      loginForm.email.trim().replace(/@sdsu\.edu$/, "") + "@sdsu.edu";
    try {
      const response = await fetch(buildUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
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
    return <LoadingSpinner />;
  }

  if (loadError) {
    return <ErrorBanner message={loadError} apiBaseUrl="/api" />;
  }

  // ── Page router ──
  function renderPage() {
    const pageProps = {
      onCampusHousing,
      offCampusListings,
      roommateProfiles,
      appConfig,
      cleanlinessOptions,
      sleepScheduleOptions,
      housingTypes,
      priceRanges,
      bedOptions,
      profileForm,
      setProfileForm,
      profileSaveMessage,
      handleAddListing,
      handleProfileSave,
      calculateCompatibility,
    };

    switch (currentPage) {
      case "home":
        return (
          <HomePage
            filters={filters}
            onCampusHousing={onCampusHousing}
            offCampusListings={offCampusListings}
            housingTypes={housingTypes}
            priceRanges={priceRanges}
            bedOptions={bedOptions}
            currentUser={currentUser}
            myListings={myListings}
            canCreateListing={canCreateListing}
            preferences={preferences}
            onUpdatePreferences={setPreferences}
            allListings={allListings}
            onTrackClick={handleTrackClick}
            setCurrentPage={setCurrentPage}
          />
        );
      case "listings":
        return (
          <ListingsPage
            {...pageProps}
            onTrackClick={handleTrackClick}
            currentUser={currentUser}
          />
        );
      case "add-listing":
        return <AddListing onAddListing={handleAddListing} />;
      case "auth":
        return (
          <AuthPage
            authMode={authMode}
            setAuthMode={setAuthMode}
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
        );
      case "auth-signup":
        return (
          <AuthPage
            authMode="signup"
            setAuthMode={setAuthMode}
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
        );
      case "profile":
        return (
          <ProfilePage
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            preferences={preferences}
            setPreferences={setPreferences}
            onSave={handleProfileSave}
            onSignOut={handleSignOut}
            onUpdateName={handleUpdateName}
            saveMessage={profileSaveMessage}
            cleanlinessOptions={cleanlinessOptions}
            sleepScheduleOptions={sleepScheduleOptions}
            currentUser={currentUser}
          />
        );
      case "roommates":
        return (
          <RoommatesPage
            profileForm={profileForm}
            roommateProfiles={roommateProfiles}
            cleanlinessOptions={cleanlinessOptions}
            sleepScheduleOptions={sleepScheduleOptions}
            calculateCompatibility={calculateCompatibility}
          />
        );
      default:
        return null;
    }
  }

  // prettier-ignore
  return (
    <AppShell
      navLinks={navLinks}
      currentPage={currentPage}
      currentUser={currentUser}
      isAccountMenuOpen={isAccountMenuOpen}
      onNavClick={handleNavClick}
      onToggleAccount={() => setIsAccountMenuOpen((o) => !o)}
      onSignOut={handleSignOut}
    >
      {renderPage()}
    </AppShell>
  );
}