import React, { useState } from "react";
import { checkProfanity } from "../../utils/profanity";

export default function EditListingPopup({ listing, onClose, onUpdate }) {
  const [form, setForm] = useState({
    title: listing.title || "",
    price: listing.price || "",
    description: listing.description || "",
    roommateStatus: listing.roommateStatus || "",
    availability: listing.availability || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    const errs = {};
    if (!form.title?.trim()) errs.title = "Title is required.";
    if (!form.price) errs.price = "Price is required.";
    else if (Number(form.price) < 1) errs.price = "Price must be at least 1.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      // Check profanity
      const titleCheck = await checkProfanity(form.title);
      const descCheck = await checkProfanity(form.description || "");

      if (titleCheck.isProfane || descCheck.isProfane) {
        setErrors({ general: "Inappropriate language detected." });
        setIsSubmitting(false);
        return;
      }

      await onUpdate(listing.id, {
        ...form,
        price: Number(form.price),
        title: titleCheck.censored,
        description: descCheck.censored,
      });
      onClose();
    } catch (err) {
      setErrors({ general: "An error occurred while saving." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const [isOverlayActive, setIsOverlayActive] = useState(false);

  function handleMouseDown(e) {
    if (e.target === e.currentTarget) {
      setIsOverlayActive(true);
    } else {
      setIsOverlayActive(false);
    }
  }

  function handleMouseUp(e) {
    if (isOverlayActive && e.target === e.currentTarget) {
      onClose();
    }
    setIsOverlayActive(false);
  }

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h2 className="modal-title" style={{ marginBottom: "1rem" }}>
          Edit Your Listing
        </h2>

        <form className="add-listing-form" onSubmit={handleSubmit}>
          <label>
            Listing Title
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 1BR Summer Sublease"
              className={errors.title ? "field-error-input" : ""}
            />
            {errors.title && (
              <small className="field-error">{errors.title}</small>
            )}
          </label>

          <label>
            Monthly Rent ($)
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="1200"
              className={errors.price ? "field-error-input" : ""}
            />
            {errors.price && (
              <small className="field-error">{errors.price}</small>
            )}
          </label>

          <label>
            Description
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell us more about the space..."
            />
          </label>

          <label>
            Roommate Status
            <select
              value={form.roommateStatus}
              onChange={(e) =>
                setForm({ ...form, roommateStatus: e.target.value })
              }
            >
              <option value="">Not set</option>
              <option value="looking">Looking for roommates</option>
              <option value="lookingToRoom">Looking to room with others</option>
              <option value="notLooking">Not looking for roommates</option>
            </select>
          </label>

          <label>
            Availability
            <input
              type="text"
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              placeholder="e.g. June 1st or Fall 2026"
            />
          </label>

          {errors.general && (
            <p className="form-message error">{errors.general}</p>
          )}

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
              type="submit"
              className="btn-accent"
              disabled={isSubmitting}
              style={{ flex: 2 }}
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
