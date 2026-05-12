import { useState } from "react";

export default function LoginForm({ form, setForm, errors, setErrors, onSubmit, isSubmitting }) {
  const handleChange = (field, value) => {
    setForm((c) => ({ ...c, [field]: value }));
    if (errors[field]) {
      setErrors((c) => {
        const next = { ...c };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span>Email</span>
        <div className={`email-input-group${errors.email ? " field-error-input" : ""}`}>
          <input
            type="text"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="your name"
          />
          <span className="email-domain">@sdsu.edu</span>
        </div>
        {errors.email && (
          <small className="field-error">
            {errors.email}
          </small>
        )}
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder="Enter your password"
          className={errors.password ? "field-error-input" : ""}
        />
        {errors.password && (
          <small className="field-error">{errors.password}</small>
        )}
      </label>

      {errors.general && <p className="field-error">{errors.general}</p>}

      <button
        className="auth-submit-btn"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}