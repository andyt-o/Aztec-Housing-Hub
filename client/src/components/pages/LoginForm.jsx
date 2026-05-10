export default function LoginForm({ form, setForm, errors, onSubmit, isSubmitting }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label className="auth-field">
        <span>Email</span>
        <div className={`email-input-group${errors.email ? " field-error-input" : ""}`}>
          <input
            type="text"
            value={form.email}
            onChange={(e) =>
              setForm((c) => ({ ...c, email: e.target.value }))
            }
            placeholder="your name"
          />
          <span className="email-domain">@sdsu.edu</span>
        </div>
        {errors.email && (
          <small className="field-error">{errors.email}</small>
        )}
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm((c) => ({ ...c, password: e.target.value }))
          }
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