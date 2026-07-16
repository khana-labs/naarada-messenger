import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  HeartPulse,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  ShieldAlert,
  Siren,
  Users,
  XCircle,
} from "lucide-react";

import api, { getApiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const statusOptions = [
  "all",
  "active",
  "acknowledged",
  "responding",
  "resolved",
  "cancelled",
];

const severityOptions = [
  "all",
  "low",
  "medium",
  "high",
  "critical",
];

const typeOptions = [
  "all",
  "medical",
  "fire",
  "trapped",
  "police",
  "evacuation",
  "shelter",
  "food_water",
  "missing_person",
  "other",
];

const authorityRoles = [
  "responder",
  "hospital",
  "police",
  "shelter",
  "authority",
  "admin",
];

const formatLabel = (value = "") => {
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
  }).format(new Date(value));
};

function IncidentStatus({ status }) {
  if (status === "resolved") {
    return (
      <span className="authority-status resolved">
        <CheckCircle2 size={14} />
        Resolved
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="authority-status cancelled">
        <XCircle size={14} />
        Cancelled
      </span>
    );
  }

  if (status === "responding") {
    return (
      <span className="authority-status responding">
        <Navigation size={14} />
        Responding
      </span>
    );
  }

  if (status === "acknowledged") {
    return (
      <span className="authority-status acknowledged">
        <ShieldAlert size={14} />
        Acknowledged
      </span>
    );
  }

  return (
    <span className="authority-status active">
      <Siren size={14} />
      Active
    </span>
  );
}

function AuthorityDashboard() {
  const { user } = useAuth();
  const socket = useSocket();

  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState({
    totalActive: 0,
    critical: 0,
    acknowledged: 0,
    responding: 0,
    resolved: 0,
    cancelled: 0,
    averagePriority: 0,
    byType: [],
  });

  const [filters, setFilters] = useState({
    status: "all",
    severity: "all",
    type: "all",
    search: "",
  });

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingIncidentId, setUpdatingIncidentId] = useState(null);

  const [teamInputs, setTeamInputs] = useState({});
  const [noteInputs, setNoteInputs] = useState({});

  const hasAuthorityAccess = authorityRoles.includes(user?.role);

  const updateIncidentCollection = useCallback(
    (currentIncidents, updatedIncident) => {
      const exists = currentIncidents.some(
        (incident) => incident._id === updatedIncident._id
      );

      if (!exists) {
        return [updatedIncident, ...currentIncidents];
      }

      return currentIncidents.map((incident) =>
        incident._id === updatedIncident._id
          ? updatedIncident
          : incident
      );
    },
    []
  );

  const fetchAuthorityData = useCallback(async () => {
    if (!hasAuthorityAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    try {
      const queryParameters = new URLSearchParams();

      if (filters.status !== "all") {
        queryParameters.set("status", filters.status);
      }

      if (filters.severity !== "all") {
        queryParameters.set("severity", filters.severity);
      }

      if (filters.type !== "all") {
        queryParameters.set("type", filters.type);
      }

      if (filters.search.trim()) {
        queryParameters.set("search", filters.search.trim());
      }

      const queryString = queryParameters.toString();

      const [incidentsResponse, summaryResponse] = await Promise.all([
        api.get(
          `/authority/emergencies${
            queryString ? `?${queryString}` : ""
          }`
        ),
        api.get("/authority/summary"),
      ]);

      setIncidents(incidentsResponse.data.data || []);
      setSummary(summaryResponse.data.data || {});
    } catch (error) {
      setPageError(
        getApiErrorMessage(
          error,
          "Unable to load authority incident data."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [filters, hasAuthorityAccess]);

  useEffect(() => {
    document.title = "Authority Dashboard | Narada Messenger";
    fetchAuthorityData();
  }, [fetchAuthorityData]);

  useEffect(() => {
    if (!socket || !hasAuthorityAccess) {
      return undefined;
    }

    const handleEmergencyUpdate = (incident) => {
      setIncidents((currentIncidents) =>
        updateIncidentCollection(currentIncidents, incident)
      );

      fetchAuthorityData();
    };

    const handleNewEmergency = (incident) => {
      setIncidents((currentIncidents) =>
        updateIncidentCollection(currentIncidents, incident)
      );

      setSuccessMessage(
        `New ${formatLabel(
          incident.severity
        )} priority incident received.`
      );

      fetchAuthorityData();
    };

    socket.on("emergency:update", handleEmergencyUpdate);
    socket.on("emergency:new", handleNewEmergency);

    return () => {
      socket.off("emergency:update", handleEmergencyUpdate);
      socket.off("emergency:new", handleNewEmergency);
    };
  }, [
    socket,
    hasAuthorityAccess,
    fetchAuthorityData,
    updateIncidentCollection,
  ]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAssignTeam = async (incidentId) => {
    const assignedTeam = teamInputs[incidentId]?.trim();
    const note = noteInputs[incidentId]?.trim() || "";

    setActionError("");
    setSuccessMessage("");

    if (!assignedTeam) {
      setActionError("Enter a response team before assigning.");
      return;
    }

    setUpdatingIncidentId(incidentId);

    try {
      const response = await api.patch(
        `/authority/emergencies/${incidentId}/assign`,
        {
          assignedTeam,
          note,
        }
      );

      setIncidents((currentIncidents) =>
        updateIncidentCollection(
          currentIncidents,
          response.data.data
        )
      );

      setSuccessMessage(
        response.data.message || "Response team assigned."
      );

      setTeamInputs((current) => ({
        ...current,
        [incidentId]: "",
      }));

      setNoteInputs((current) => ({
        ...current,
        [incidentId]: "",
      }));

      await fetchAuthorityData();
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Unable to assign response team.")
      );
    } finally {
      setUpdatingIncidentId(null);
    }
  };

  const handleStatusUpdate = async (incidentId, status) => {
    setActionError("");
    setSuccessMessage("");
    setUpdatingIncidentId(incidentId);

    try {
      const response = await api.patch(
        `/authority/emergencies/${incidentId}/status`,
        {
          status,
          assignedTeam: teamInputs[incidentId]?.trim() || "",
          note:
            noteInputs[incidentId]?.trim() ||
            `Incident marked ${status} from authority dashboard.`,
        }
      );

      setIncidents((currentIncidents) =>
        updateIncidentCollection(
          currentIncidents,
          response.data.data
        )
      );

      setSuccessMessage(
        response.data.message || "Incident updated successfully."
      );

      setNoteInputs((current) => ({
        ...current,
        [incidentId]: "",
      }));

      await fetchAuthorityData();
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Unable to update incident.")
      );
    } finally {
      setUpdatingIncidentId(null);
    }
  };

  const highestPriorityIncident = useMemo(() => {
    return [...incidents]
      .filter((incident) =>
        ["active", "acknowledged", "responding"].includes(
          incident.status
        )
      )
      .sort(
        (first, second) =>
          second.priorityScore - first.priorityScore
      )[0];
  }, [incidents]);

  if (!hasAuthorityAccess) {
    return (
      <div className="page authority-dashboard-page">
        <section className="authority-access-denied">
          <ShieldAlert size={48} />

          <p className="eyebrow">RESTRICTED MODULE</p>

          <h1>Authority access required</h1>

          <p>
            Your current role is <strong>{user?.role}</strong>. This
            dashboard is available only to verified responders,
            hospitals, police, shelters, authorities, and admins.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="page authority-dashboard-page">
      <header className="page-heading authority-page-heading">
        <div>
          <p className="eyebrow">VERIFIED RESPONSE NETWORK</p>
          <h1>Authority Dashboard</h1>
          <p>
            Monitor incoming SOS incidents, assign response teams, and
            coordinate emergency resolution.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={fetchAuthorityData}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={loading ? "messages-refreshing" : ""}
          />
          Refresh
        </button>
      </header>

      {highestPriorityIncident && (
        <section className="authority-critical-banner">
          <div>
            <Siren size={30} />
          </div>

          <span>
            <small>HIGHEST PRIORITY INCIDENT</small>

            <strong>
              {highestPriorityIncident.emergencyId} ·{" "}
              {formatLabel(highestPriorityIncident.type)}
            </strong>

            <p>
              {highestPriorityIncident.location?.zone ||
                "Unknown location"}{" "}
              · Priority {highestPriorityIncident.priorityScore}/100
            </p>
          </span>
        </section>
      )}

      <section className="authority-summary-grid">
        <article className="authority-summary-card">
          <Siren size={22} />

          <span>
            <small>Active incidents</small>
            <strong>{summary.totalActive || 0}</strong>
          </span>
        </article>

        <article className="authority-summary-card critical">
          <AlertTriangle size={22} />

          <span>
            <small>Critical</small>
            <strong>{summary.critical || 0}</strong>
          </span>
        </article>

        <article className="authority-summary-card">
          <ShieldAlert size={22} />

          <span>
            <small>Acknowledged</small>
            <strong>{summary.acknowledged || 0}</strong>
          </span>
        </article>

        <article className="authority-summary-card">
          <Navigation size={22} />

          <span>
            <small>Responding</small>
            <strong>{summary.responding || 0}</strong>
          </span>
        </article>

        <article className="authority-summary-card safe">
          <CheckCircle2 size={22} />

          <span>
            <small>Resolved</small>
            <strong>{summary.resolved || 0}</strong>
          </span>
        </article>

        <article className="authority-summary-card">
          <Activity size={22} />

          <span>
            <small>Average priority</small>
            <strong>
              {Math.round(summary.averagePriority || 0)}
            </strong>
          </span>
        </article>
      </section>

      <section className="panel authority-filter-panel">
        <div className="authority-filter-heading">
          <Filter size={19} />
          <strong>Incident filters</strong>
        </div>

        <div className="authority-filter-grid">
          <div className="authority-search-field">
            <Search size={18} />

            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search ID, Narada ID, location..."
            />
          </div>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                Status: {formatLabel(status)}
              </option>
            ))}
          </select>

          <select
            name="severity"
            value={filters.severity}
            onChange={handleFilterChange}
          >
            {severityOptions.map((severity) => (
              <option key={severity} value={severity}>
                Severity: {formatLabel(severity)}
              </option>
            ))}
          </select>

          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                Type: {formatLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {pageError && (
        <div className="messages-page-error">
          <AlertTriangle size={20} />

          <div>
            <strong>Authority data unavailable</strong>
            <span>{pageError}</span>
          </div>

          <button type="button" onClick={fetchAuthorityData}>
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div className="messages-form-alert error">
          <AlertTriangle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {successMessage && (
        <div className="messages-form-alert success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <section className="panel authority-incidents-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">PRIORITY QUEUE</p>
            <h2>Emergency incidents</h2>
          </div>

          <ShieldAlert size={23} />
        </div>

        {loading ? (
          <div className="messages-loading-state">
            <div className="messages-loading-radar">
              <span />
              <span />
            </div>

            <strong>LOADING AUTHORITY NETWORK</strong>
          </div>
        ) : incidents.length === 0 ? (
          <div className="messages-empty-state">
            <CheckCircle2 size={42} />

            <strong>No matching incidents</strong>

            <span>
              No SOS incidents currently match the selected filters.
            </span>
          </div>
        ) : (
          <div className="authority-incident-list">
            {incidents.map((incident) => {
              const isClosed = ["resolved", "cancelled"].includes(
                incident.status
              );

              const isUpdating =
                updatingIncidentId === incident._id;

              return (
                <article
                  key={incident._id}
                  className={`authority-incident-card severity-${incident.severity}`}
                >
                  <div className="authority-incident-top">
                    <div>
                      <span>{incident.emergencyId}</span>

                      <strong>
                        {formatLabel(incident.type)}
                      </strong>
                    </div>

                    <IncidentStatus status={incident.status} />
                  </div>

                  <p className="authority-incident-description">
                    {incident.description}
                  </p>

                  <div className="authority-incident-details">
                    <div>
                      <Users size={17} />

                      <span>
                        <small>Citizen</small>
                        <strong>
                          {incident.user?.name || incident.naradaId}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <MapPin size={17} />

                      <span>
                        <small>Location</small>
                        <strong>
                          {incident.location?.zone || "Unknown"}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <AlertTriangle size={17} />

                      <span>
                        <small>Severity</small>
                        <strong>{incident.severity}</strong>
                      </span>
                    </div>

                    <div>
                      <Users size={17} />

                      <span>
                        <small>People affected</small>
                        <strong>{incident.peopleAffected}</strong>
                      </span>
                    </div>

                    <div>
                      <Clock3 size={17} />

                      <span>
                        <small>Created</small>
                        <strong>
                          {formatDate(incident.createdAt)}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <HeartPulse size={17} />

                      <span>
                        <small>Assigned team</small>
                        <strong>
                          {incident.assignedTeam || "Not assigned"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="authority-priority-block">
                    <div>
                      <span>Priority score</span>
                      <strong>
                        {incident.priorityScore}/100
                      </strong>
                    </div>

                    <div className="authority-priority-track">
                      <span
                        style={{
                          width: `${incident.priorityScore}%`,
                        }}
                      />
                    </div>
                  </div>

                  {incident.updates?.length > 0 && (
                    <div className="authority-latest-update">
                      <span>LATEST UPDATE</span>

                      <p>
                        {
                          incident.updates[
                            incident.updates.length - 1
                          ]?.note
                        }
                      </p>
                    </div>
                  )}

                  {!isClosed && (
                    <div className="authority-action-area">
                      <div className="authority-action-fields">
                        <input
                          value={teamInputs[incident._id] || ""}
                          onChange={(event) =>
                            setTeamInputs((current) => ({
                              ...current,
                              [incident._id]: event.target.value,
                            }))
                          }
                          placeholder="Response team name"
                        />

                        <input
                          value={noteInputs[incident._id] || ""}
                          onChange={(event) =>
                            setNoteInputs((current) => ({
                              ...current,
                              [incident._id]: event.target.value,
                            }))
                          }
                          placeholder="Authority note"
                        />
                      </div>

                      <div className="authority-action-buttons">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(
                              incident._id,
                              "acknowledged"
                            )
                          }
                          disabled={isUpdating}
                        >
                          <ShieldAlert size={16} />
                          Acknowledge
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAssignTeam(incident._id)
                          }
                          disabled={isUpdating}
                        >
                          <Users size={16} />
                          Assign team
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(
                              incident._id,
                              "responding"
                            )
                          }
                          disabled={isUpdating}
                        >
                          <Navigation size={16} />
                          Responding
                        </button>

                        <button
                          type="button"
                          className="resolve"
                          onClick={() =>
                            handleStatusUpdate(
                              incident._id,
                              "resolved"
                            )
                          }
                          disabled={isUpdating}
                        >
                          <CheckCircle2 size={16} />
                          Resolve
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default AuthorityDashboard;