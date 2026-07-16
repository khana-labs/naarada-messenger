import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
    loading,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const destination =
    location.state?.from || "/dashboard";

  useEffect(() => {
    document.title = "Login | Narada Messenger";
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
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    const result = await login(
      formData.email,
      formData.password
    );

    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(destination, {
      replace: true,
    });
  };

  return (
    <main className="auth-page">
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
            DECENTRALIZED COMMUNICATION
          </p>

          <h1>
            Stay connected when everything else fails.
          </h1>

          <p>
            Access your permanent Narada identity,
            encrypted messages, nearby relay devices,
            and emergency tools.
          </p>

          <div className="auth-network-preview">
            <div className="auth-preview-node">
              <span />
              <strong>YOU</strong>
            </div>

            <div className="auth-preview-line">
              <span />
            </div>

            <div className="auth-preview-node">
              <span />
              <strong>RELAY</strong>
            </div>

            <div className="auth-preview-line">
              <span />
            </div>

            <div className="auth-preview-node">
              <span />
              <strong>RECEIVER</strong>
            </div>
          </div>

          <div className="auth-system-features">
            <div>
              <ShieldCheck size={19} />
              <span>Encrypted identities</span>
            </div>

            <div>
              <RadioTower size={19} />
              <span>Multi-hop routing</span>
            </div>

            <div>
              <LockKeyhole size={19} />
              <span>Protected communication</span>
            </div>
          </div>
        </div>

        <div className="auth-system-status">
          <span className="status-dot status-dot-cyan" />

          <div>
            <strong>NETWORK SYSTEM ONLINE</strong>
            <span>Authentication services available</span>
          </div>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-form-heading">
            <p className="eyebrow">
              IDENTITY VERIFICATION
            </p>

            <h2>Enter Narada</h2>

            <p>
              Sign in using the credentials linked to
              your Narada ID.
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
            <label htmlFor="login-email">
              Email address
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
            />

            <label htmlFor="login-password">
              Password
            </label>

            <div className="auth-password-field">
              <input
                id="login-password"
                name="password"
                type={
                  showPassword ? "text" : "password"
                }
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
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

            <button
              className="auth-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "VERIFYING..."
                : "ACCESS NETWORK"}

              {!submitting && (
                <ArrowRight size={19} />
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            <span>
              No Narada identity registered?
            </span>

            <Link to="/register">
              Create Narada ID
            </Link>
          </div>

          <div className="auth-security-note">
            <LockKeyhole size={17} />

            <span>
              Your session is protected using a signed
              authentication token.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;