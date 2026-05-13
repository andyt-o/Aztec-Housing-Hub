export default function AccountMenu({ user, onSignOut, onNavigateToProfile }) {
  return (
    <div className="account-dropdown">
      <p className="account-dropdown-name">
        {user.firstName} {user.lastName}
      </p>
      <p className="account-dropdown-email">{user.email}</p>
      <div className="account-dropdown-actions">
        <button
          type="button"
          className="account-dropdown-action"
          onClick={() => onNavigateToProfile?.()}
        >
          Profile
        </button>
        <button
          type="button"
          className="account-dropdown-action"
          onClick={onSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}