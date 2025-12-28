"use client";

import { FormEvent, useState } from "react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mfaCode: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMfaRequired(false);
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          mfaCode: formData.mfaCode || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Login failed. Please check your credentials."
        }));
        if (errorData?.mfaRequired) {
          setMfaRequired(true);
        }
        throw new Error(errorData.error || errorData.message || "Login failed");
      }

      const payload = await response.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(payload.user ?? payload));
      }

      onSuccess?.();
      onClose();
      setFormData({ email: "", password: "", mfaCode: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          x
        </button>

        <h2 className="modal-title">Sign In</h2>
        <p className="modal-subtitle">Sign in to your account to continue ordering.</p>

        <form onSubmit={handleSubmit} className="registration-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
          </div>

          {mfaRequired && (
            <p className="form-hint">
              MFA is required for this account. Enter the code from your authenticator.
            </p>
          )}
          <div className="form-group">
            <label htmlFor="login-mfa">MFA Code (if enabled)</label>
            <input
              id="login-mfa"
              name="mfaCode"
              type="text"
              value={formData.mfaCode}
              onChange={handleChange}
              placeholder="123456"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
