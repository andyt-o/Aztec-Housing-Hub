import React, { useState, useEffect } from "react";
import "./styles.css";
import sdsuLogo from "./assets/sdsulogo.jpg";
import AppShell from "./components/AppShell";
import Navbar from "./components/Navbar";
import HomePage from "./components/pages/HomePage";
import ListingsPage from "./components/pages/ListingsPage";
import AddListing from "./components/pages/AddListing";
import AuthPage from "./components/pages/AuthPage";
import ProfilePage from "./components/pages/ProfilePage";
import LoadingSpinner from "./components/shared/LoadingSpinner";
import ErrorBanner from "./components/shared/ErrorBanner";

// Proxy prefix for Vite dev server (see vite.config.js).
// In production, the built frontend expects API paths under /api.
const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

function buildUrl(path) {
  return apiBaseUrl + path;
}

export default function App() {
  // ── Data fetched from backend API ──
  const [onCampusHousing, setOnCampusHousing] = useState([]);
  const [offCampusListings, setOffCampusListings] = useState([]);
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

  // ── Sync page with URL hash on mount and on hash change ──
  useEffect(() => {
    function hashToPage(hash) {
      const m = {
        "": "home",
        listings: "listings",
        "add-listing": "add-listing",
        auth: "auth",
        "auth-signup": "auth",
        profile: "profile",
      };
      return m[hash] || "home";
    }
    function onHash() {
      const hash = window.location.hash.replace(/^#\//, "");
      setCurrentPage(hashToPage(hash));
    }
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // ── Fetch all data from backend API on mount ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [listingsRes, configRes] = await Promise.all([
          fetch(buildUrl("/listings")),
          fetch(buildUrl("/config")),
        ]);

        if (!listingsRes.ok)
          throw new Error(`Failed to load listings (${listingsRes.status})`);
        if (!configRes.ok)
          throw new Error(`Failed to load config (${configRes.status})`);

        const listings = await listingsRes.json();
        const config = await configRes.json();

        setOnCampusHousing(listings.onCampus || []);
        setOffCampusListings(listings.offCampus || []);
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
  const housingTypes = appConfig?.housingTypes || [];
  const priceRanges = appConfig?.priceRanges || [];
  const bedOptions = appConfig?.bedOptions || [];
  const emptyPreferences = appConfig?.emptyPreferences || {};

  // ── Preferences & user listings ──
  const [preferences, setPreferences] = useState(emptyPreferences);

  const allListings = [
    ...(onCampusHousing || []).map((l) => ({ ...l, placement: "onCampus" })),
    ...(offCampusListings || []).map((l) => ({ ...l, placement: "offCampus" })),
  ];

  const myListings = currentUser
    ? allListings.filter((l) => l.ownerEmail === currentUser.email)
    : [];

  const canCreateListing = myListings.length < 3;

  // ── Click tracking ──
  async function handleTrackClick(listingId) {
    // Optimistically update the local state so the UI reflects the click immediately
    setOnCampusHousing((current) =>
      current.map((l) => (l.id === listingId ? { ...l, clicks: (l.clicks || 0) + 1 } : l))
    );
    setOffCampusListings((current) =>
      current.map((l) => (l.id === listingId ? { ...l, clicks: (l.clicks || 0) + 1 } : l))
    );

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
  const pageToHash = {
    home: "",
    listings: "listings",
    "add-listing": "add-listing",
    auth: "auth",
    profile: "profile",
  };

  function navigateTo(page) {
    setCurrentPage(page);
    window.location.hash = "#/" + (pageToHash[page] ?? "");
  }

  function clearMessages() {
    setGlobalMessage({ type: "", text: "" });
  }

  async function handleAddListing(listing) {
    listing.placement = "offCampus";
    if (currentUser) {
      listing.posterBio = currentUser.bio || "";
    }
    setOffCampusListings((current) => [listing, ...current]);
    navigateTo("listings");
  }

  // ── Navigation ──

  function handleNavClick(event, link) {
    event.preventDefault();
    clearMessages();
    setIsAccountMenuOpen(false);

    if (link === "Login / Signup") {
      if (!currentUser) navigateTo("auth");
      return;
    }
    if (link === "Add Listing" && !currentUser) {
      navigateTo("auth");
      return;
    }
    navigateTo(
      link === "Home"
        ? "home"
        : link === "Listings"
        ? "listings"
        : link === "Add Listing"
        ? "add-listing"
        : link === "Profile"
        ? "profile"
        : "home"
    );
  }

  function handleSignOut() {
    setCurrentUser(null);
    navigateTo("home");
    setAuthMode("login");
    setIsAccountMenuOpen(false);
    setLoginForm(appConfig?.emptyLoginForm || {});
    setSignupForm(appConfig?.emptySignupForm || {});
    setLoginErrors({});
    setSignupErrors({});
    setGlobalMessage({ type: "success", text: "You have been signed out." });
  }

  function handleNavigateToProfile() {
    if (currentUser) {
      navigateTo("profile");
    } else {
      navigateTo("auth");
    }
    setIsAccountMenuOpen(false);
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
          firstName: firstName,
          lastName: lastName,
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
    if (!signupForm.redId?.trim())
      errors.redId = "Red ID is required.";
    else if (!/^\d{9}$/.test(signupForm.redId.trim()))
      errors.redId = "Red ID must be exactly 9 digits.";
    if (!signupForm.email?.trim())
      errors.email = "Email name is required.";
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
        navigateTo("home");
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
      navigateTo("home");
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

  async function handleProfileSave(event) {
    event.preventDefault();

    // Save roommate profile to backend
    if (currentUser) {
      try {
        const response = await fetch(buildUrl("/update-roommate"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email,
            bio: profileForm.description || "",
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setProfileSaveMessage(data.message || "Failed to save profile.");
          return;
        }

        const newBio = data.user.bio || "";
        setCurrentUser((prev) => ({
          ...prev,
          bio: newBio,
        }));

        // Sync biography to all local listings owned by this user
        setOffCampusListings((current) =>
          current.map((l) =>
            l.ownerEmail === currentUser.email ? { ...l, posterBio: newBio } : l
          )
        );
        setOnCampusHousing((current) =>
          current.map((l) =>
            l.ownerEmail === currentUser.email ? { ...l, posterBio: newBio } : l
          )
        );
      } catch {
        setProfileSaveMessage("Could not reach the server. Profile not saved.");
        return;
      }
    }

    setProfileSaveMessage("Profile saved successfully!");
  }

  async function handleUpdateListing(listingId, updatedFields) {
    try {
      const response = await fetch(buildUrl("/update-listing"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listingId, ...updatedFields }),
      });
      const data = await response.json();
      if (!response.ok) {
        setGlobalMessage({
          type: "error",
          text: data.message || "Failed to update listing.",
        });
        throw new Error("Update failed");
      }

      const updatedListing = data.listing;
      // Preserve local state metadata
      updatedListing.placement = "offCampus";
      if (currentUser) {
        updatedListing.posterBio = currentUser.bio || "";
      }

      setOffCampusListings((current) =>
        current.map((l) => (l.id === listingId ? updatedListing : l))
      );
      setGlobalMessage({
        type: "success",
        text: "Listing updated successfully.",
      });
    } catch (err) {
      setGlobalMessage({
        type: "error",
        text: "Could not reach the server. Listing not updated.",
      });
      throw err;
    }
  }

  async function handleDeleteListing(listingId) {
    try {
      const response = await fetch(buildUrl("/delete-listing"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setGlobalMessage({
          type: "error",
          text: data.message || "Failed to delete listing.",
        });
        return;
      }
      // Remove listing from local state
      setOffCampusListings((current) =>
        current.filter((l) => l.id !== listingId)
      );
      setOnCampusHousing((current) =>
        current.filter((l) => l.id !== listingId)
      );
      setGlobalMessage({
        type: "success",
        text: "Listing deleted successfully.",
      });
    } catch {
      setGlobalMessage({
        type: "error",
        text: "Could not reach the server. Please try again.",
      });
    }
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
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            currentUser={currentUser}
            myListings={myListings}
            canCreateListing={canCreateListing}
            preferences={preferences}
            allListings={allListings}
            onTrackClick={handleTrackClick}
            onDeleteListing={handleDeleteListing}
            onUpdateListing={handleUpdateListing}
            navigateTo={navigateTo}
          />
        );
      case "listings":
        return (
          <ListingsPage
            onCampusHousing={onCampusHousing}
            offCampusListings={offCampusListings}
            housingTypes={housingTypes}
            priceRanges={priceRanges}
            bedOptions={bedOptions}
            preferences={preferences}
            setPreferences={setPreferences}
            currentUser={currentUser}
            onTrackClick={handleTrackClick}
            navigateTo={navigateTo}
          />
        );
      case "add-listing":
        return <AddListing currentUser={currentUser} onAddListing={handleAddListing} />;
      case "auth":
        return (
          <AuthPage
            authMode={authMode}
            setAuthMode={setAuthMode}
            signupForm={signupForm}
            setSignupForm={setSignupForm}
            signupErrors={signupErrors}
            setSignupErrors={setSignupErrors}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            loginErrors={loginErrors}
            setLoginErrors={setLoginErrors}
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
            setSignupErrors={setSignupErrors}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            loginErrors={loginErrors}
            setLoginErrors={setLoginErrors}
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
            currentUser={currentUser}
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
      onNavigateToProfile={handleNavigateToProfile}
    >
      {renderPage()}
    </AppShell>
  );
}