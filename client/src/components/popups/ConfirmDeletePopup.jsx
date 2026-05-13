import React, { useRef } from "react";

export default function ConfirmDeletePopup({ title, onConfirm, onClose }) {
  const overlayClickRef = useRef(false);

  function handleMouseDown(e) {
    if (e.target === e.currentTarget) {
      overlayClickRef.current = true;
    }
  }

  function handleMouseUp(e) {
    if (overlayClickRef.current && e.target === e.currentTarget) {
      onClose();
    }
    overlayClickRef.current = false;
  }

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <div className="modal-header" style={{ marginBottom: "1rem" }}>
          <h2 className="modal-title">Delete Listing</h2>
          <p className="modal-posted-by">Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.</p>
        </div>
        <div className="modal-cta" style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1, background: "var(--border)", color: "var(--text)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ flex: 1, background: "var(--accent)", color: "#fff", border: "none", padding: "0.75rem", borderRadius: "6px" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
