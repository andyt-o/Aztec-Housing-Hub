import Navbar from "./Navbar";

export default function AppShell({
  children,
  navLinks,
  currentPage,
  currentUser,
  isAccountMenuOpen,
  onNavClick,
  onToggleAccount,
  onSignOut,
  onNavigateToProfile,
}) {
  return (
    <div className="app-shell">
      <Navbar
        navLinks={navLinks}
        currentPage={currentPage}
        currentUser={currentUser}
        isAccountMenuOpen={isAccountMenuOpen}
        onNavClick={onNavClick}
        onToggleAccount={onToggleAccount}
        onSignOut={onSignOut}
      />
      {children}
    </div>
  );
}