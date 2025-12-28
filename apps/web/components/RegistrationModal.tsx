"use client";

import { FormEvent, useState } from "react";

type RegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Registration failed. Please try again."
        }));
        throw new Error(errorData.error || errorData.message || "Registration failed");
      }

      const payload = await response.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(payload.user ?? payload));
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: ""
        });
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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

        <h2 className="modal-title">Create Your Account</h2>
        <p className="modal-subtitle">
          Register as a customer to enjoy faster ordering and loyalty rewards.
        </p>

        {success ? (
          <div className="modal-success">
            <p>Registration successful! Welcome to Guachince.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="registration-form">
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
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
              <label htmlFor="phone">Phone (Optional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+34 600 000 000"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={8}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
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
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
