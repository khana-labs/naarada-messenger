import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BatteryMedium,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  RadioTower,
  RefreshCw,
  Route,
  ShieldCheck,
  Signal,
  Users,
  WifiOff,
  Zap,
} from "lucide-react";

const initialNodes = [
  {
    id: "NRD-SENDER",
    name: "Sender Node",
    type: "sender",
    distance: 0,
    signal: 100,
    battery: 82,
    reliability: 98,
    status: "online",
    zone: "Hostel Block C",
  },
  {
    id: "RELAY-01",
    name: "Hostel Relay",
    type: "relay",
    distance: 120,
    signal: 91,
    battery: 77,
    reliability: 96,
    status: "online",
    zone: "Central Road",
  },
  {
    id: "RELAY-02",
    name: "Medical Relay",
    type: "relay",
    distance: 210,
    signal: 84,
    battery: 61,
    reliability: 92,
    status: "online",
    zone: "Medical Centre",
  },
  {
    id: "RELAY-03",
    name: "Gate Relay",
    type: "relay",
    distance: 260,
    signal: 68,
    battery: 48,
    reliability: 79,
    status: "online",
    zone: "Main Gate",
  },
  {
    id: "NRD-RECEIVER",
    name: "Receiver Node",
    type: "receiver",
    distance: 340,
    signal: 88,
    battery: 69,
    reliability: 95,
    status: "online",
    zone: "Safe Zone",
  },
];

const routeOptions = [
  {
    id: "route-fast",
    label: "Fastest Route",
    description: "Lowest estimated delay.",
    path: ["NRD-SENDER", "RELAY-01", "NRD-RECEIVER"],
    latency: 145,
    reliability: 88,
    batteryCost: 18,
    distance: 340,
  },
  {
    id: "route-safe",
    label: "Safest Route",
    description: "Highest relay reliability.",
    path: [
      "NRD-SENDER",
      "RELAY-01",
      "RELAY-02",
      "NRD-RECEIVER",
    ],
    latency: 220,
    reliability: 97,
    batteryCost: 25,
    distance: 390,
  },
  {
    id: "route-power",
    label: "Battery Saver",
    description: "Uses nodes with stronger battery levels.",
    path: ["NRD-SENDER", "RELAY-02", "NRD-RECEIVER"],
    latency: 185,
    reliability: 92,
    batteryCost: 12,
    distance: 365,
  },
];

function RouteMetric({ icon: Icon, label, value }) {
  return (
    <div className="routing-metric">
      <Icon size={17} />

      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function RoutingSimulator() {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedRouteId, setSelectedRouteId] =
    useState("route-safe");

  const [running, setRunning] = useState(false);
  const [currentHop, setCurrentHop] = useState(0);
  const [simulationStatus, setSimulationStatus] =
    useState("Ready");

  const selectedRoute = useMemo(
    () =>
      routeOptions.find(
        (routeOption) => routeOption.id === selectedRouteId
      ) || routeOptions[0],
    [selectedRouteId]
  );

  useEffect(() => {
    document.title = "Routing Simulator | Narada Messenger";
  }, []);

  const resetSimulation = () => {
    setRunning(false);
    setCurrentHop(0);
    setSimulationStatus("Ready");
    setNodes(initialNodes);
  };

  const simulateFailure = () => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === "RELAY-01"
          ? {
              ...node,
              status: "offline",
              signal: 0,
            }
          : node
      )
    );

    setSelectedRouteId("route-power");
    setCurrentHop(0);
    setSimulationStatus("Route recalculated");
  };

  const startRouting = () => {
    if (running) {
      return;
    }

    setRunning(true);
    setCurrentHop(0);
    setSimulationStatus("Packet created");

    selectedRoute.path.forEach((nodeId, index) => {
      window.setTimeout(() => {
        setCurrentHop(index);
        setSimulationStatus(
          index === selectedRoute.path.length - 1
            ? "Packet delivered"
            : `Packet reached ${nodeId}`
        );

        if (index === selectedRoute.path.length - 1) {
          setRunning(false);
        }
      }, index * 1700);
    });
  };

  return (
    <div className="page routing-simulator-page">
      <header className="page-heading routing-page-heading">
        <div>
          <p className="eyebrow">MULTI-HOP DECISION ENGINE</p>

          <h1>Routing Simulator</h1>

          <p>
            Compare possible routes and simulate packet movement
            toward the receiver.
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
        className={`routing-status-banner ${
          simulationStatus === "Packet delivered"
            ? "delivered"
            : running
              ? "active"
              : ""
        }`}
      >
        <div>
          {simulationStatus === "Packet delivered" ? (
            <CheckCircle2 size={29} />
          ) : (
            <Route size={29} />
          )}
        </div>

        <span>
          <small>ROUTING STATUS</small>
          <strong>{simulationStatus}</strong>
          <p>
            Selected strategy: {selectedRoute.label}
          </p>
        </span>
      </section>

      <section className="routing-summary-grid">
        <RouteMetric
          icon={Clock3}
          label="Estimated latency"
          value={`${selectedRoute.latency} ms`}
        />

        <RouteMetric
          icon={ShieldCheck}
          label="Reliability"
          value={`${selectedRoute.reliability}%`}
        />

        <RouteMetric
          icon={BatteryMedium}
          label="Battery cost"
          value={`${selectedRoute.batteryCost}%`}
        />

        <RouteMetric
          icon={MapPin}
          label="Route distance"
          value={`${selectedRoute.distance} m`}
        />
      </section>

      <section className="routing-main-layout">
        <article className="panel routing-network-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ACTIVE TOPOLOGY</p>
              <h2>Relay network</h2>
            </div>

            <RadioTower size={23} />
          </div>

          <div className="routing-network-map">
            <div className="routing-grid-background" />

            <svg
              className="routing-network-lines"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line x1="10" y1="72" x2="32" y2="42" />
              <line x1="32" y1="42" x2="56" y2="62" />
              <line x1="56" y1="62" x2="78" y2="36" />
              <line x1="78" y1="36" x2="92" y2="70" />
              <line x1="32" y1="42" x2="92" y2="70" />
              <line x1="10" y1="72" x2="56" y2="62" />
            </svg>

            {nodes.map((node, index) => {
              const routeIndex =
                selectedRoute.path.indexOf(node.id);

              const isOnRoute = routeIndex !== -1;
              const isComplete =
                isOnRoute && routeIndex < currentHop;
              const isActive =
                isOnRoute &&
                routeIndex === currentHop &&
                running;
              const isDelivered =
                isOnRoute &&
                routeIndex ===
                  selectedRoute.path.length - 1 &&
                simulationStatus === "Packet delivered";

              return (
                <div
                  key={node.id}
                  className={[
                    "routing-node",
                    `routing-node-${index}`,
                    node.status === "offline"
                      ? "offline"
                      : "",
                    isOnRoute ? "selected" : "",
                    isComplete ? "complete" : "",
                    isActive ? "active" : "",
                    isDelivered ? "delivered" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {node.status === "offline" ? (
                    <WifiOff size={21} />
                  ) : node.type === "sender" ? (
                    <Navigation size={21} />
                  ) : node.type === "receiver" ? (
                    <MapPin size={21} />
                  ) : (
                    <RadioTower size={21} />
                  )}

                  <strong>{node.id}</strong>
                  <span>{node.zone}</span>
                </div>
              );
            })}

            {running && (
              <div className="routing-active-packet">
                <Zap size={14} />
                PACKET
              </div>
            )}
          </div>
        </article>

        <aside className="routing-side-column">
          <article className="panel routing-options-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">ROUTE STRATEGY</p>
                <h2>Select route</h2>
              </div>

              <Activity size={22} />
            </div>

            <div className="routing-option-list">
              {routeOptions.map((routeOption) => (
                <button
                  type="button"
                  key={routeOption.id}
                  className={
                    selectedRouteId === routeOption.id
                      ? "routing-option selected"
                      : "routing-option"
                  }
                  onClick={() => {
                    setSelectedRouteId(routeOption.id);
                    setCurrentHop(0);
                    setSimulationStatus("Ready");
                  }}
                  disabled={running}
                >
                  <span>
                    <strong>{routeOption.label}</strong>
                    <small>{routeOption.description}</small>
                  </span>

                  <span>
                    {routeOption.path.length - 2} relays
                  </span>
                </button>
              ))}
            </div>
          </article>

          <article className="panel routing-control-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">SIMULATION</p>
                <h2>Route control</h2>
              </div>

              <Signal size={22} />
            </div>

            <div className="routing-control-body">
              <div className="routing-path-preview">
                {selectedRoute.path.map((nodeId, index) => (
                  <div key={nodeId}>
                    <span
                      className={
                        index <= currentHop
                          ? "routing-path-node reached"
                          : "routing-path-node"
                      }
                    >
                      {nodeId}
                    </span>

                    {index <
                      selectedRoute.path.length - 1 && (
                      <span className="routing-path-arrow">
                        ↓
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="routing-start-button"
                onClick={startRouting}
                disabled={running}
              >
                <Navigation size={18} />
                {running
                  ? "ROUTING PACKET..."
                  : "START ROUTING"}
              </button>

              <button
                type="button"
                className="routing-failure-button"
                onClick={simulateFailure}
                disabled={running}
              >
                <WifiOff size={18} />
                SIMULATE RELAY FAILURE
              </button>
            </div>
          </article>
        </aside>
      </section>

      <section className="panel routing-node-table-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">NODE ANALYSIS</p>
            <h2>Available devices</h2>
          </div>

          <Users size={23} />
        </div>

        <div className="routing-node-table">
          <div className="routing-node-row header">
            <span>Node</span>
            <span>Zone</span>
            <span>Signal</span>
            <span>Battery</span>
            <span>Reliability</span>
            <span>Status</span>
          </div>

          {nodes.map((node) => (
            <div
              className="routing-node-row"
              key={node.id}
            >
              <span>
                <strong>{node.id}</strong>
                <small>{node.name}</small>
              </span>

              <span>{node.zone}</span>
              <span>{node.signal}%</span>
              <span>{node.battery}%</span>
              <span>{node.reliability}%</span>

              <span
                className={
                  node.status === "online"
                    ? "routing-node-status online"
                    : "routing-node-status offline"
                }
              >
                {node.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RoutingSimulator;