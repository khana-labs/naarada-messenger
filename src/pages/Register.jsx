import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  RadioTower,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const roleOptions = [
  {
    value: "civilian",
    label: "Civilian",
  },
  {
    value: "responder",
    label: "Emergency Responder",
  },
  {
    value: "hospital",
    label: "Hospital",
  },
  {
    value: "police",
    label: "Police",
  },
  {
    value: "shelter",
    label: "Shelter",
  },
];

function Register() {
  const navigate = useNavigate();

  const {
    register,
    isAuthenticated,
    loading,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "civilian",
    password: "",
    confirmPassword: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    document.title =
      "Create Narada ID | Narada Messenger";
  }, []);

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError(
        "Name, email, and password are required."
      );
      return;
    }

    if (formData.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      password: formData.password,

      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship:
          formData.emergencyRelationship,
      },
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/dashboard", {
      replace: true,
    });
  };

  return (
    <main className="auth-page register-auth-page">
      <section className="auth-information-panel">
        <div className="auth-brand">
          <div className="auth-brand-symbol">
            <RadioTower size={29} />
          </div>

          <div>
            <strong>NARADA</strong>
            <span>EMERGENCY NETWORK</span>
          </div>
        </div>

        <div className="auth-information-content">
          <p className="eyebrow">
            PERMANENT OFFLINE IDENTITY
          </p>

          <h1>
            Create an identity that survives a network
            blackout.
          </h1>

          <p>
            Your Narada ID identifies you across the
            emergency communication network without
            relying on a changing IP address.
          </p>

          <div className="narada-id-preview">
            <span>EXAMPLE IDENTITY</span>
            <strong>NRD-8F29A7</strong>
            <small>
              Your unique ID will be generated
              automatically.
            </small>
          </div>

          <div className="auth-system-features">
            <div>
              <ShieldCheck size={19} />
              <span>Permanent Narada ID</span>
            </div>

            <div>
              <UserPlus size={19} />
              <span>Emergency contact profile</span>
            </div>

            <div>
              <RadioTower size={19} />
              <span>Relay-node participation</span>
            </div>
          </div>
        </div>

        <Link
          className="auth-back-link"
          to="/login"
        >
          <ArrowLeft size={18} />
          Return to login
        </Link>
      </section>

      <section className="auth-form-section register-form-section">
        <div className="auth-form-container register-form-container">
          <div className="auth-form-heading">
            <p className="eyebrow">
              NEW NETWORK PARTICIPANT
            </p>

            <h2>Create Narada ID</h2>

            <p>
              Register your identity and emergency
              communication profile.
            </p>
          </div>

          {error && (
            <div
              className="auth-error-message"
              role="alert"
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-form-grid">
              <div>
                <label htmlFor="register-name">
                  Full name
                </label>

                <input
                  id="register-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="register-phone">
                  Phone number
                </label>

                <input
                  id="register-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Optional"
                  autoComplete="tel"
                />
              </div>
            </div>

            <label htmlFor="register-email">
              Email address
            </label>

            <input
              id="register-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
            />

            <label htmlFor="register-role">
              Network role
            </label>

            <select
              id="register-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              {roleOptions.map((role) => (
                <option
                  key={role.value}
                  value={role.value}
                >
                  {role.label}
                </option>
              ))}
            </select>

            <div className="auth-form-grid">
              <div>
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="auth-password-field">
                  <input
                    id="register-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password">
                  Confirm password
                </label>

                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="auth-form-divider">
              <span>Emergency contact</span>
            </div>

            <div className="auth-form-grid">
              <div>
                <label htmlFor="emergency-name">
                  Contact name
                </label>

                <input
                  id="emergency-name"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label htmlFor="emergency-phone">
                  Contact phone
                </label>

                <input
                  id="emergency-phone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>

            <label htmlFor="emergency-relationship">
              Relationship
            </label>

            <input
              id="emergency-relationship"
              name="emergencyRelationship"
              value={
                formData.emergencyRelationship
              }
              onChange={handleChange}
              placeholder="Parent, sibling, friend..."
            />

            <button
              className="auth-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "CREATING IDENTITY..."
                : "CREATE NARADA ID"}

              {!submitting && (
                <ArrowRight size={19} />
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            <span>
              Already have a Narada identity?
            </span>

            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;