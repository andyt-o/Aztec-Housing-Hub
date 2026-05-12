import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthPage({
  authMode,
  setAuthMode,
  signupForm,
  setSignupForm,
  signupErrors,
  setSignupErrors,
  loginForm,
  setLoginForm,
  loginErrors,
  setLoginErrors,
  globalMessage,
  isSubmitting,
  onSignupSubmit,
  onLoginSubmit,
}) {
  const isLogin = authMode === "login";

  return (
    <>
      <div className="auth-hero">
        <div className="auth-hero-inner">
          <div>
            <p className="eyebrow">Student Access</p>
            <h2>
              {isLogin
                ? "Welcome back to Aztec Housing Hub"
                : "Create your SDSU account"}
            </h2>
            <p className="hero-text">
              {isLogin
                ? "Log in with your SDSU email to manage your housing experience."
                : "Sign up with your SDSU information so students can access housing tools with verified campus emails."}
            </p>
          </div>

          <div className="auth-card">
            <div
              className="auth-toggle"
              role="tablist"
              aria-label="Authentication options"
            >
              <button
                className={`auth-toggle-btn ${isLogin ? "active" : ""}`}
                onClick={() => setAuthMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`auth-toggle-btn ${!isLogin ? "active" : ""}`}
                onClick={() => setAuthMode("signup")}
                type="button"
              >
                Sign Up
              </button>
            </div>

            {globalMessage.text && (
              <div
                className={`auth-alert ${
                  globalMessage.type === "error" ? "error" : "success"
                }`}
              >
                {globalMessage.text}
              </div>
            )}

            {isLogin ? (
              <LoginForm
                form={loginForm}
                setForm={setLoginForm}
                errors={loginErrors}
                setErrors={setLoginErrors}
                onSubmit={onLoginSubmit}
                isSubmitting={isSubmitting}
              />
            ) : (
              <SignupForm
                form={signupForm}
                setForm={setSignupForm}
                errors={signupErrors}
                setErrors={setSignupErrors}
                onSubmit={onSignupSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}