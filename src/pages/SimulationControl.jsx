import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Flame,
  HeartPulse,
  Network,
  Pause,
  Play,
  RadioTower,
  RefreshCw,
  ShieldAlert,
  Siren,
  Users,
  WifiOff,
} from "lucide-react";

const initialTimeline = [
  {
    id: 1,
    time: "00:00",
    type: "system",
    title: "Simulation ready",
    description: "Emergency network is standing by.",
    status: "complete",
  },
];

const simulationEvents = [
  {
    delay: 1500,
    time: "00:02",
    type: "danger",
    title: "Primary network failure",
    description:
      "Cellular towers and conventional internet access are unavailable.",
  },
  {
    delay: 3500,
    time: "00:04",
    type: "warning",
    title: "Nearby devices detected",
    description:
      "Narada activated four temporary communication nodes.",
  },
  {
    delay: 5500,
    time: "00:06",
    type: "medical",
    title: "Critical medical SOS",
    description:
      "One unconscious person reported near Hostel Block C.",
  },
  {
    delay: 7500,
    time: "00:08",
    type: "relay",
    title: "Relay route established",
    description:
      "Packet route: USER → RELAY-01 → RELAY-02 → AUTHORITY.",
  },
  {
    delay: 9500,
    time: "00:10",
    type: "fire",
    title: "Fire incident detected",
    description:
      "Smoke and electrical fire reported near the Main Gate.",
  },
  {
    delay: 11500,
    time: "00:12",
    type: "authority",
    title: "Authority network alerted",
    description:
      "Medical and fire response queues have been updated.",
  },
  {
    delay: 13500,
    time: "00:14",
    type: "team",
    title: "Response teams assigned",
    description:
      "Medical Unit Alpha and Fire Unit Bravo dispatched.",
  },
  {
    delay: 15500,
    time: "00:16",
    type: "success",
    title: "Emergency coordination active",
    description:
      "Narada network remains operational despite infrastructure failure.",
  },
];

const getEventIcon = (type) => {
  if (type === "danger") {
    return WifiOff;
  }

  if (type === "warning") {
    return RadioTower;
  }

  if (type === "medical") {
    return HeartPulse;
  }

  if (type === "relay") {
    return Network;
  }

  if (type === "fire") {
    return Flame;
  }

  if (type === "authority") {
    return ShieldAlert;
  }

  if (type === "team") {
    return Users;
  }

  if (type === "success") {
    return CheckCircle2;
  }

  return Activity;
};

function SimulationControl() {
  const timersRef = useRef([]);

  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeline, setTimeline] = useState(initialTimeline);

  const [networkState, setNetworkState] = useState({
    status: "READY",
    activeNodes: 1,
    offlineNodes: 0,
    messagesRouted: 0,
    activeSos: 0,
    authoritiesOnline: 1,
    latency: 0,
    progress: 0,
  });

  const latestEvent = timeline[timeline.length - 1];

  const progressLabel = useMemo(() => {
    if (completed) {
      return "SIMULATION COMPLETE";
    }

    if (running) {
      return "DISASTER SIMULATION ACTIVE";
    }

    return "SYSTEM READY";
  }, [completed, running]);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    timersRef.current = [];
  };

  const resetSimulation = () => {
    clearTimers();

    setRunning(false);
    setCompleted(false);
    setTimeline(initialTimeline);

    setNetworkState({
      status: "READY",
      activeNodes: 1,
      offlineNodes: 0,
      messagesRouted: 0,
      activeSos: 0,
      authoritiesOnline: 1,
      latency: 0,
      progress: 0,
    });
  };

  const applyEventState = (index, event) => {
    const progress = Math.round(
      ((index + 1) / simulationEvents.length) * 100
    );

    setTimeline((current) => [
      ...current,
      {
        id: Date.now() + index,
        time: event.time,
        type: event.type,
        title: event.title,
        description: event.description,
        status: "complete",
      },
    ]);

    setNetworkState((current) => {
      const next = {
        ...current,
        progress,
        latency: Math.floor(Math.random() * 80) + 70,
      };

      if (event.type === "danger") {
        next.status = "BLACKOUT MODE";
        next.offlineNodes = 3;
      }

      if (event.type === "warning") {
        next.status = "RELAY NETWORK ACTIVE";
        next.activeNodes = 5;
      }

      if (event.type === "medical") {
        next.activeSos = 1;
      }

      if (event.type === "relay") {
        next.messagesRouted = 1;
      }

      if (event.type === "fire") {
        next.activeSos = 2;
      }

      if (event.type === "authority") {
        next.authoritiesOnline = 2;
      }

      if (event.type === "team") {
        next.messagesRouted = 4;
      }

      if (event.type === "success") {
        next.status = "OPERATIONAL";
        next.messagesRouted = 7;
      }

      return next;
    });

    if (index === simulationEvents.length - 1) {
      setRunning(false);
      setCompleted(true);
    }
  };

  const startSimulation = () => {
    resetSimulation();

    setRunning(true);

    setNetworkState((current) => ({
      ...current,
      status: "INITIALIZING",
    }));

    simulationEvents.forEach((event, index) => {
      const timer = window.setTimeout(() => {
        applyEventState(index, event);
      }, event.delay);

      timersRef.current.push(timer);
    });
  };

  const stopSimulation = () => {
    clearTimers();
    setRunning(false);

    setNetworkState((current) => ({
      ...current,
      status: "PAUSED",
    }));
  };

  useEffect(() => {
    document.title =
      "Simulation Control | Narada Messenger";

    return () => {
      clearTimers();
    };
  }, []);

  return (
    <div className="page simulation-control-page">
      <header className="page-heading simulation-page-heading">
        <div>
          <p className="eyebrow">
            EMERGENCY DEMONSTRATION MODE
          </p>

          <h1>Simulation Control</h1>

          <p>
            Demonstrate how Narada responds when conventional
            communication infrastructure fails.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={resetSimulation}
        >
          <RefreshCw size={18} />
          Reset
        </button>
      </header>

      <section
        className={`simulation-status-banner ${
          running
            ? "running"
            : completed
              ? "complete"
              : "ready"
        }`}
      >
        <div className="simulation-status-icon">
          {running ? (
            <Siren size={31} />
          ) : completed ? (
            <CheckCircle2 size={31} />
          ) : (
            <Activity size={31} />
          )}
        </div>

        <div>
          <span>{progressLabel}</span>
          <strong>{networkState.status}</strong>

          <p>
            {latestEvent?.description ||
              "Start the simulation to demonstrate Narada emergency routing."}
          </p>
        </div>

        <div className="simulation-progress-value">
          {networkState.progress}%
        </div>
      </section>

      <section className="simulation-progress-track">
        <span
          style={{
            width: `${networkState.progress}%`,
          }}
        />
      </section>

      <section className="simulation-action-panel panel">
        <div>
          <p className="eyebrow">DEMO CONTROL</p>
          <h2>Infrastructure failure scenario</h2>

          <p>
            The simulation creates network failure, discovers relay
            nodes, generates SOS incidents, and alerts authorities.
          </p>
        </div>

        <div className="simulation-action-buttons">
          {!running ? (
            <button
              type="button"
              className="simulation-start-button"
              onClick={startSimulation}
            >
              <Play size={21} />
              {completed
                ? "RUN SIMULATION AGAIN"
                : "START DISASTER SIMULATION"}
            </button>
          ) : (
            <button
              type="button"
              className="simulation-stop-button"
              onClick={stopSimulation}
            >
              <Pause size={21} />
              PAUSE SIMULATION
            </button>
          )}
        </div>
      </section>

      <section className="simulation-stats-grid">
        <article className="simulation-stat-card">
          <RadioTower size={22} />

          <span>
            <small>Active nodes</small>
            <strong>{networkState.activeNodes}</strong>
          </span>
        </article>

        <article className="simulation-stat-card danger">
          <WifiOff size={22} />

          <span>
            <small>Offline nodes</small>
            <strong>{networkState.offlineNodes}</strong>
          </span>
        </article>

        <article className="simulation-stat-card">
          <Network size={22} />

          <span>
            <small>Packets routed</small>
            <strong>{networkState.messagesRouted}</strong>
          </span>
        </article>

        <article className="simulation-stat-card danger">
          <Siren size={22} />

          <span>
            <small>Active SOS</small>
            <strong>{networkState.activeSos}</strong>
          </span>
        </article>

        <article className="simulation-stat-card safe">
          <ShieldAlert size={22} />

          <span>
            <small>Authorities online</small>
            <strong>
              {networkState.authoritiesOnline}
            </strong>
          </span>
        </article>

        <article className="simulation-stat-card">
          <Clock3 size={22} />

          <span>
            <small>Simulated latency</small>
            <strong>
              {networkState.latency
                ? `${networkState.latency} ms`
                : "—"}
            </strong>
          </span>
        </article>
      </section>

      <section className="simulation-main-layout">
        <article className="panel simulation-network-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                LIVE TOPOLOGY
              </p>
              <h2>Narada relay network</h2>
            </div>

            <Network size={23} />
          </div>

          <div className="simulation-network-map">
            <div className="simulation-grid-background" />

            <svg
              className="simulation-network-lines"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line x1="50" y1="86" x2="50" y2="64" />
              <line x1="50" y1="64" x2="30" y2="38" />
              <line x1="50" y1="64" x2="70" y2="38" />
              <line x1="30" y1="38" x2="50" y2="13" />
              <line x1="70" y1="38" x2="50" y2="13" />
            </svg>

            <div className="simulation-node user-node">
              <Users size={22} />
              <strong>CITIZEN</strong>
              <span>NRD-USER</span>
            </div>

            <div className="simulation-node relay-one-node">
              <RadioTower size={22} />
              <strong>RELAY-01</strong>
              <span>ACTIVE</span>
            </div>

            <div className="simulation-node relay-two-node">
              <RadioTower size={22} />
              <strong>RELAY-02</strong>
              <span>ACTIVE</span>
            </div>

            <div className="simulation-node relay-three-node">
              <RadioTower size={22} />
              <strong>RELAY-03</strong>
              <span>ACTIVE</span>
            </div>

            <div className="simulation-node authority-node">
              <ShieldAlert size={22} />
              <strong>AUTHORITY</strong>
              <span>ONLINE</span>
            </div>

            {running && (
              <>
                <span className="simulation-packet packet-one" />
                <span className="simulation-packet packet-two" />
                <span className="simulation-packet packet-three" />
              </>
            )}

            {networkState.activeSos > 0 && (
              <div className="simulation-critical-marker">
                <AlertTriangle size={19} />
                CRITICAL SOS
              </div>
            )}
          </div>
        </article>

        <article className="panel simulation-timeline-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                EVENT LOG
              </p>
              <h2>Disaster timeline</h2>
            </div>

            <Clock3 size={23} />
          </div>

          <div className="simulation-timeline">
            {timeline
              .slice()
              .reverse()
              .map((event) => {
                const EventIcon = getEventIcon(event.type);

                return (
                  <article
                    key={event.id}
                    className={`simulation-timeline-event event-${event.type}`}
                  >
                    <div className="simulation-event-icon">
                      <EventIcon size={18} />
                    </div>

                    <div>
                      <div>
                        <time>{event.time}</time>
                        <strong>{event.title}</strong>
                      </div>

                      <p>{event.description}</p>
                    </div>
                  </article>
                );
              })}
          </div>
        </article>
      </section>
    </div>
  );
}

export default SimulationControl;