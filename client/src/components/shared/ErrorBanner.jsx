export default function ErrorBanner({ message, apiBaseUrl }) {
  return (
    <main className="page-content">
      <p style={{ color: "#b42318", fontWeight: 600 }}>
        Could not load data from server.
      </p>
      <p>
        Error: {message}
        <br />
        Make sure the backend is running at {apiBaseUrl}
      </p>
    </main>
  );
}