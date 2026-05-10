export default function SignupForm({
  form,
  setForm,
  errors,
  onSubmit,
  isSubmitting,
}) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="auth-form-grid">
        <label className="auth-field">
          <span>First Name</span>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) =>
              setForm((c) => ({ ...c, firstName: e.target.value }))
            }
            placeholder="First name"
            className={errors.firstName ? "field-error-input" : ""}
          />
          {errors.firstName && (
            <small className="field-error">{errors.firstName}</small>
          )}
        </label>
        <label className="auth-field">
          <span>Last Name</span>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) =>
              setForm((c) => ({ ...c, lastName: e.target.value }))
            }
            placeholder="Last name"
            className={errors.lastName ? "field-error-input" : ""}
          />
          {errors.lastName && (
            <small className="field-error">{errors.lastName}</small>
          )}
        </label>
      </div>

      <label className="auth-field">
        <span>Red ID</span>
        <input
          type="text"
          value={form.redId}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 9);
            setForm((c) => ({ ...c, redId: v }));
          }}
          placeholder="9-digit Red ID"
          maxLength={9}
          className={errors.redId ? "field-error-input" : ""}
        />
        {errors.redId && (
          <small className="field-error">{errors.redId}</small>
        )}
      </label>

      <label className="auth-field">
        <span>SDSU Email</span>
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

      <div className="auth-form-grid">
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((c) => ({ ...c, password: e.target.value }))
            }
            placeholder="At least 8 characters"
            className={errors.password ? "field-error-input" : ""}
          />
          {errors.password && (
            <small className="field-error">{errors.password}</small>
          )}
        </label>
        <label className="auth-field">
          <span>Confirm Password</span>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((c) => ({ ...c, confirmPassword: e.target.value }))
            }
            placeholder="Re-enter password"
            className={errors.confirmPassword ? "field-error-input" : ""}
          />
          {errors.confirmPassword && (
            <small className="field-error">{errors.confirmPassword}</small>
          )}
        </label>
      </div>

      <button
        className="auth-submit-btn"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}