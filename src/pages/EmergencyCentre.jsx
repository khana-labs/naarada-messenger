import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BatteryMedium,
  CheckCircle2,
  Clock3,
  Cross,
  Flame,
  HeartPulse,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldAlert,
  Siren,
  TentTree,
  Users,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";

import api, { getApiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const emergencyTypes = [
  {
    value: "medical",
    label: "Medical",
    description: "Injury, illness, unconscious person, or urgent treatment.",
    icon: HeartPulse,
  },
  {
    value: "fire",
    label: "Fire",
    description: "Active fire, smoke, explosion, or electrical hazard.",
    icon: Flame,
  },
  {
    value: "trapped",
    label: "Trapped",
    description: "Person trapped under debris or inside a structure.",
    icon: AlertTriangle,
  },
  {
    value: "police",
    label: "Security",
    description: "Violence, threat, crime, or urgent police support.",
    icon: ShieldAlert,
  },
  {
    value: "evacuation",
    label: "Evacuation",
    description: "Immediate movement away from a dangerous area.",
    icon: Navigation,
  },
  {
    value: "shelter",
    label: "Shelter",
    description: "Need a safe location, temporary shelter, or protection.",
    icon: TentTree,
  },
  {
    value: "food_water",
    label: "Food / Water",
    description: "Urgent shortage of drinking water or essential supplies.",
    icon: UtensilsCrossed,
  },
  {
    value: "missing_person",
    label: "Missing Person",
    description: "Report a missing or separated person.",
    icon: Users,
  },
];

const severityOptions = [
  {
    value: "low",
    label: "Low",
    description: "Help is required, but there is no immediate danger.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "The situation may become dangerous without assistance.",
  },
  {
    value: "high",
    label: "High",
    description: "Urgent response is required.",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Immediate threat to life or safety.",
  },
];

const formatEmergencyType = (value = "") => {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (value) => {
  if (!value) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
};

function EmergencyStatus({ status }) {
  if (status === "resolved") {
    return (
      <span className="emergency-status resolved">
        <CheckCircle2 size={14} />
        Resolved
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="emergency-status cancelled">
        <XCircle size={14} />
        Cancelled
      </span>
    );
  }

  if (status === "responding") {
    return (
      <span className="emergency-status responding">
        <Navigation size={14} />
        Responding
      </span>
    );
  }

  if (status === "acknowledged") {
    return (
      <span className="emergency-status acknowledged">
        <ShieldAlert size={14} />
        Acknowledged
      </span>
    );
  }

  return (
    <span className="emergency-status active">
      <Siren size={14} />
      Active
    </span>
  );
}

function RelayRoute({ emergency }) {
  const route = Array.isArray(emergency.route) ? emergency.route : [];
  const currentHop = Number(emergency.currentHop || 0);

  if (route.length === 0) {
    return null;
  }

  return (
    <div className="emergency-route">
      <div className="emergency-route-heading">
        <Navigation size={15} />
        <span>SOS ROUTE</span>
      </div>

      <div className="emergency-route-list">
        {route.map((nodeId, index) => {
          const complete = index < currentHop;
          const active =
            index === currentHop &&
            emergency.relayStatus !== "authority_reached";

          const reached =
            emergency.relayStatus === "authority_reached" &&
            index === route.length - 1;

          return (
            <div
              className="emergency-route-item"
              key={`${emergency._id}-${nodeId}-${index}`}
            >
              <div
                className={[
                  "emergency-route-node",
                  complete ? "complete" : "",
                  active ? "active" : "",
                  reached ? "reached" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {complete || reached ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Navigation size={14} />
                )}

                <span>{nodeId}</span>
              </div>

              {index < route.length - 1 && (
                <span
                  className={`emergency-route-line ${
                    index < currentHop ? "complete" : ""
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmergencyCentre() {
  const { user } = useAuth();
  const socket = useSocket();

  const [formData, setFormData] = useState({
    type: "medical",
    severity: "high",
    description: "",
    peopleAffected: 1,
    zone: "",
    latitude: "",
    longitude: "",
    accuracy: "",
    batteryLevel: "",
  });

  const [myEmergencies, setMyEmergencies] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeEmergency = useMemo(() => {
    return myEmergencies.find((emergency) =>
      ["active", "acknowledged", "responding"].includes(emergency.status)
    );
  }, [myEmergencies]);

  const updateEmergencyCollection = useCallback(
    (emergencies, updatedEmergency) => {
      const exists = emergencies.some(
        (emergency) => emergency._id === updatedEmergency._id
      );

      if (!exists) {
        return [updatedEmergency, ...emergencies];
      }

      return emergencies.map((emergency) =>
        emergency._id === updatedEmergency._id
          ? updatedEmergency
          : emergency
      );
    },
    []
  );

  const fetchMyEmergencies = useCallback(async () => {
    setLoadingEmergencies(true);
    setPageError("");

    try {
      const response = await api.get("/emergencies/my");

      setMyEmergencies(response.data.data || []);
    } catch (error) {
      setPageError(
        getApiErrorMessage(
          error,
          "Unable to load your emergency incidents."
        )
      );
    } finally {
      setLoadingEmergencies(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Emergency Centre | Narada Messenger";
    fetchMyEmergencies();
  }, [fetchMyEmergencies]);

  useEffect(() => {
    if (!socket || !user?.naradaId) {
      return undefined;
    }

    const handleEmergencyUpdate = (emergency) => {
      if (emergency.naradaId !== user.naradaId) {
        return;
      }

      setMyEmergencies((currentEmergencies) =>
        updateEmergencyCollection(currentEmergencies, emergency)
      );
    };

    socket.on("emergency:update", handleEmergencyUpdate);

    return () => {
      socket.off("emergency:update", handleEmergencyUpdate);
    };
  }, [socket, updateEmergencyCollection, user?.naradaId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
    setSuccessMessage("");
  };

  const detectLocation = () => {
    setFormError("");
    setSuccessMessage("");

    if (!navigator.geolocation) {
      setFormError("Location access is not supported by this browser.");
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          accuracy: Math.round(position.coords.accuracy),
          zone: current.zone || "Detected current location",
        }));

        setSuccessMessage("Current location detected successfully.");
        setDetectingLocation(false);
      },
      (error) => {
        const locationErrors = {
          1: "Location permission was denied.",
          2: "Current location is unavailable.",
          3: "Location request timed out.",
        };

        setFormError(
          locationErrors[error.code] ||
            "Unable to detect the current location."
        );

        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  };

  const handleCreateEmergency = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!formData.description.trim()) {
      setFormError("Describe what happened in one clear sentence.");
      return;
    }

    const peopleAffected = Number(formData.peopleAffected);

    if (!Number.isFinite(peopleAffected) || peopleAffected < 1) {
      setFormError("People affected must be at least 1.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        type: formData.type,
        severity: formData.severity,
        description: formData.description.trim(),
        peopleAffected,
        location: {
          latitude:
            formData.latitude === ""
              ? null
              : Number(formData.latitude),

          longitude:
            formData.longitude === ""
              ? null
              : Number(formData.longitude),

          zone: formData.zone.trim() || "Unknown zone",

          accuracy:
            formData.accuracy === ""
              ? null
              : Number(formData.accuracy),
        },

        batteryLevel:
          formData.batteryLevel === ""
            ? null
            : Number(formData.batteryLevel),
      };

      const response = await api.post("/emergencies", payload);

      const createdEmergency = response.data.data;

      setMyEmergencies((currentEmergencies) =>
        updateEmergencyCollection(currentEmergencies, createdEmergency)
      );

      setSuccessMessage(
        response.data.message ||
          "SOS packet created and priority routing started."
      );

      setFormData((current) => ({
        ...current,
        description: "",
        peopleAffected: 1,
      }));
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, "Unable to create the SOS packet.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEmergency = async (emergencyId) => {
    const confirmed = window.confirm(
      "Cancel this SOS? Authorities will see the incident as cancelled."
    );

    if (!confirmed) {
      return;
    }

    setPageError("");
    setSuccessMessage("");

    try {
      const response = await api.patch(
        `/emergencies/${emergencyId}/cancel`,
        {
          note: "SOS cancelled by the user from Emergency Centre.",
        }
      );

      setMyEmergencies((currentEmergencies) =>
        updateEmergencyCollection(currentEmergencies, response.data.data)
      );

      setSuccessMessage(response.data.message || "SOS cancelled.");
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Unable to cancel this SOS.")
      );
    }
  };

  return (
    <div className="page emergency-centre-page">
      <header className="page-heading emergency-page-heading">
        <div>
          <p className="eyebrow">PRIORITY EMERGENCY CHANNEL</p>
          <h1>Emergency Centre</h1>
          <p>
            Create a high-priority SOS packet and route it toward the
            authority network.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={fetchMyEmergencies}
          disabled={loadingEmergencies}
        >
          <RefreshCw
            size={18}
            className={
              loadingEmergencies ? "messages-refreshing" : ""
            }
          />
          Refresh
        </button>
      </header>

      <section
        className={`emergency-readiness-banner ${
          activeEmergency ? "danger" : "safe"
        }`}
      >
        <div className="emergency-readiness-icon">
          {activeEmergency ? (
            <Siren size={30} />
          ) : (
            <CheckCircle2 size={30} />
          )}
        </div>

        <div>
          <span>
            {activeEmergency
              ? "ACTIVE SOS DETECTED"
              : "NO ACTIVE SOS"}
          </span>

          <strong>
            {activeEmergency
              ? `${activeEmergency.emergencyId} is being routed`
              : "Emergency channel ready"}
          </strong>

          <p>
            {activeEmergency
              ? "Do not create duplicate incidents unless the situation changes significantly."
              : "Use this centre only when urgent assistance or emergency coordination is required."}
          </p>
        </div>
      </section>

      <section className="emergency-centre-layout">
        <article className="panel emergency-create-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CREATE SOS PACKET</p>
              <h2>Request urgent help</h2>
            </div>

            <Siren size={23} />
          </div>

          <form
            className="emergency-form"
            onSubmit={handleCreateEmergency}
          >
            <span className="emergency-form-label">
              What help is needed?
            </span>

            <div className="emergency-type-grid">
              {emergencyTypes.map((option) => {
                const Icon = option.icon;
                const selected = formData.type === option.value;

                return (
                  <button
                    type="button"
                    key={option.value}
                    className={`emergency-type-button ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() =>
                      setFormData((current) => ({
                        ...current,
                        type: option.value,
                      }))
                    }
                  >
                    <Icon size={21} />

                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="emergency-form-label">
              Severity
            </span>

            <div className="emergency-severity-grid">
              {severityOptions.map((option) => (
                <label
                  key={option.value}
                  className={`severity-option severity-${option.value} ${
                    formData.severity === option.value
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={option.value}
                    checked={formData.severity === option.value}
                    onChange={handleChange}
                  />

                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              ))}
            </div>

            <label htmlFor="emergency-description">
              Describe the emergency
            </label>

            <textarea
              id="emergency-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Example: Two people are injured near Hostel Block C. One person is unconscious."
              maxLength={1000}
              rows={5}
            />

            <div className="emergency-character-count">
              {formData.description.length}/1000
            </div>

            <div className="emergency-form-grid">
              <div>
                <label htmlFor="people-affected">
                  People affected
                </label>

                <input
                  id="people-affected"
                  name="peopleAffected"
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.peopleAffected}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="battery-level">
                  Battery level
                </label>

                <div className="emergency-input-icon">
                  <BatteryMedium size={18} />

                  <input
                    id="battery-level"
                    name="batteryLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.batteryLevel}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div className="emergency-location-heading">
              <span className="emergency-form-label">
                Location
              </span>

              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
              >
                <LocateFixed size={17} />
                {detectingLocation
                  ? "Detecting..."
                  : "Use current location"}
              </button>
            </div>

            <label htmlFor="emergency-zone">
              Zone or landmark
            </label>

            <div className="emergency-input-icon">
              <MapPin size={18} />

              <input
                id="emergency-zone"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                placeholder="Hostel Block C, Main Gate, Medical Centre..."
              />
            </div>

            <div className="emergency-form-grid">
              <div>
                <label htmlFor="latitude">Latitude</label>

                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label htmlFor="longitude">Longitude</label>

                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>

            {formError && (
              <div className="messages-form-alert error">
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            {successMessage && (
              <div className="messages-form-alert success">
                <CheckCircle2 size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="emergency-submit-button"
              disabled={submitting}
            >
              <Siren size={20} />

              {submitting
                ? "CREATING PRIORITY PACKET..."
                : "SEND SOS NOW"}
            </button>
          </form>
        </article>

        <article className="panel emergency-history-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">INCIDENT TRACKING</p>
              <h2>My SOS incidents</h2>
            </div>

            <ShieldAlert size={23} />
          </div>

          {pageError && (
            <div className="messages-page-error">
              <AlertTriangle size={20} />

              <div>
                <strong>Emergency data unavailable</strong>
                <span>{pageError}</span>
              </div>

              <button
                type="button"
                onClick={fetchMyEmergencies}
              >
                Retry
              </button>
            </div>
          )}

          {loadingEmergencies ? (
            <div className="messages-loading-state">
              <div className="messages-loading-radar">
                <span />
                <span />
              </div>

              <strong>LOADING SOS INCIDENTS</strong>
            </div>
          ) : myEmergencies.length === 0 ? (
            <div className="messages-empty-state">
              <ShieldAlert size={40} />

              <strong>No SOS incidents</strong>

              <span>
                Emergency packets created using your Narada ID will
                appear here.
              </span>
            </div>
          ) : (
            <div className="emergency-incident-list">
              {myEmergencies.map((emergency) => (
                <article
                  className={`emergency-incident-card severity-${emergency.severity}`}
                  key={emergency._id}
                >
                  <div className="emergency-incident-header">
                    <div>
                      <span>{emergency.emergencyId}</span>
                      <strong>
                        {formatEmergencyType(emergency.type)}
                      </strong>
                    </div>

                    <EmergencyStatus status={emergency.status} />
                  </div>

                  <p>{emergency.description}</p>

                  <div className="emergency-incident-metrics">
                    <div>
                      <AlertTriangle size={16} />
                      <span>
                        <small>Severity</small>
                        <strong>{emergency.severity}</strong>
                      </span>
                    </div>

                    <div>
                      <Users size={16} />
                      <span>
                        <small>People</small>
                        <strong>{emergency.peopleAffected}</strong>
                      </span>
                    </div>

                    <div>
                      <MapPin size={16} />
                      <span>
                        <small>Location</small>
                        <strong>
                          {emergency.location?.zone || "Unknown"}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <Clock3 size={16} />
                      <span>
                        <small>Created</small>
                        <strong>
                          {formatDate(emergency.createdAt)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="emergency-priority-row">
                    <span>Priority score</span>

                    <strong>{emergency.priorityScore}/100</strong>

                    <div>
                      <span
                        style={{
                          width: `${emergency.priorityScore}%`,
                        }}
                      />
                    </div>
                  </div>

                  <RelayRoute emergency={emergency} />

                  {emergency.updates?.length > 0 && (
                    <div className="emergency-update-list">
                      <span>LATEST UPDATE</span>

                      <p>
                        {
                          emergency.updates[
                            emergency.updates.length - 1
                          ]?.note
                        }
                      </p>
                    </div>
                  )}

                  {["active", "acknowledged", "responding"].includes(
                    emergency.status
                  ) && (
                    <button
                      type="button"
                      className="cancel-emergency-button"
                      onClick={() =>
                        handleCancelEmergency(emergency._id)
                      }
                    >
                      <Cross size={17} />
                      Cancel this SOS
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default EmergencyCentre;