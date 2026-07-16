import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Network,
  RadioTower,
  RefreshCw,
  ShieldAlert,
  Signal,
  Siren,
  TrendingUp,
  Users,
  WifiOff,
} from "lucide-react";

const messageActivity = [
  { label: "08:00", value: 18 },
  { label: "10:00", value: 34 },
  { label: "12:00", value: 52 },
  { label: "14:00", value: 41 },
  { label: "16:00", value: 68 },
  { label: "18:00", value: 57 },
];

const sosDistribution = [
  { label: "Medical", value: 8 },
  { label: "Fire", value: 4 },
  { label: "Evacuation", value: 6 },
  { label: "Police", value: 3 },
  { label: "Shelter", value: 5 },
];

const routePerformance = [
  {
    name: "Fastest Route",
    usage: 42,
    reliability: 88,
    latency: 145,
  },
  {
    name: "Safest Route",
    usage: 37,
    reliability: 97,
    latency: 220,
  },
  {
    name: "Battery Saver",
    usage: 21,
    reliability: 92,
    latency: 185,
  },
];

const nodeHealth = [
  {
    id: "RELAY-01",
    zone: "Hostel Block",
    signal: 91,
    battery: 77,
    reliability: 96,
    status: "online",
  },
  {
    id: "RELAY-02",
    zone: "Medical Centre",
    signal: 84,
    battery: 61,
    reliability: 92,
    status: "online",
  },
  {
    id: "RELAY-03",
    zone: "Main Gate",
    signal: 68,
    battery: 48,
    reliability: 79,
    status: "warning",
  },
  {
    id: "RELAY-04",
    zone: "Safe Zone",
    signal: 0,
    battery: 12,
    reliability: 41,
    status: "offline",
  },
];

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
}) {
  return (
    <article className={`analytics-metric-card ${tone}`}>
      <Icon size={23} />

      <span>
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{detail}</em>
      </span>
    </article>
  );
}

function Analytics() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    document.title = "Analytics | Narada Messenger";
  }, []);

  const maxMessageActivity = useMemo(() => {
    return Math.max(...messageActivity.map((item) => item.value));
  }, []);

  const maxSosValue = useMemo(() => {
    return Math.max(...sosDistribution.map((item) => item.value));
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);

    window.setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
    }, 700);
  };

  return (
    <div className="page analytics-page">
      <header className="page-heading analytics-page-heading">
        <div>
          <p className="eyebrow">NETWORK INTELLIGENCE</p>

          <h1>Analytics</h1>

          <p>
            Monitor communication performance, node reliability,
            emergency activity, and relay-network health.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={18}
            className={refreshing ? "messages-refreshing" : ""}
          />
          Refresh
        </button>
      </header>

      <section className="analytics-status-banner">
        <div>
          <Activity size={29} />
        </div>

        <span>
          <small>NETWORK CONDITION</small>
          <strong>OPERATIONAL</strong>

          <p>
            Last updated{" "}
            {lastUpdated.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </span>

        <div className="analytics-health-score">
          94%
          <small>HEALTH</small>
        </div>
      </section>

      <section className="analytics-metric-grid">
        <MetricCard
          icon={MessageSquare}
          label="Messages routed"
          value="148"
          detail="+23 today"
        />

        <MetricCard
          icon={Siren}
          label="SOS incidents"
          value="26"
          detail="4 active"
          tone="danger"
        />

        <MetricCard
          icon={RadioTower}
          label="Active nodes"
          value="17"
          detail="1 offline"
        />

        <MetricCard
          icon={Clock3}
          label="Average latency"
          value="164 ms"
          detail="-18 ms"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Delivery rate"
          value="96.8%"
          detail="+1.4%"
          tone="safe"
        />

        <MetricCard
          icon={ShieldAlert}
          label="Authorities online"
          value="3"
          detail="2 teams active"
        />
      </section>

      <section className="analytics-main-grid">
        <article className="panel analytics-chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">TRAFFIC OVERVIEW</p>
              <h2>Messages routed</h2>
            </div>

            <TrendingUp size={23} />
          </div>

          <div className="analytics-bar-chart">
            {messageActivity.map((item) => (
              <div
                className="analytics-bar-column"
                key={item.label}
              >
                <div className="analytics-bar-track">
                  <span
                    style={{
                      height: `${
                        (item.value / maxMessageActivity) * 100
                      }%`,
                    }}
                  />
                </div>

                <strong>{item.value}</strong>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel analytics-chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">EMERGENCY ACTIVITY</p>
              <h2>SOS distribution</h2>
            </div>

            <Siren size={23} />
          </div>

          <div className="analytics-horizontal-chart">
            {sosDistribution.map((item) => (
              <div
                className="analytics-horizontal-row"
                key={item.label}
              >
                <span>{item.label}</span>

                <div>
                  <span
                    style={{
                      width: `${
                        (item.value / maxSosValue) * 100
                      }%`,
                    }}
                  />
                </div>

                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="analytics-secondary-grid">
        <article className="panel analytics-route-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ROUTE PERFORMANCE</p>
              <h2>Strategy usage</h2>
            </div>

            <Network size={23} />
          </div>

          <div className="analytics-route-list">
            {routePerformance.map((route) => (
              <div
                className="analytics-route-card"
                key={route.name}
              >
                <div>
                  <strong>{route.name}</strong>
                  <span>{route.usage}% of traffic</span>
                </div>

                <div className="analytics-route-metrics">
                  <span>
                    <small>Reliability</small>
                    <strong>{route.reliability}%</strong>
                  </span>

                  <span>
                    <small>Latency</small>
                    <strong>{route.latency} ms</strong>
                  </span>
                </div>

                <div className="analytics-route-track">
                  <span
                    style={{
                      width: `${route.usage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel analytics-alert-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SYSTEM WARNINGS</p>
              <h2>Attention required</h2>
            </div>

            <AlertTriangle size={23} />
          </div>

          <div className="analytics-alert-list">
            <div className="analytics-alert-item danger">
              <WifiOff size={19} />

              <span>
                <strong>RELAY-04 offline</strong>
                <small>
                  Last signal received 12 minutes ago.
                </small>
              </span>
            </div>

            <div className="analytics-alert-item warning">
              <Signal size={19} />

              <span>
                <strong>RELAY-03 weak signal</strong>
                <small>
                  Signal strength dropped below 70%.
                </small>
              </span>
            </div>

            <div className="analytics-alert-item">
              <Users size={19} />

              <span>
                <strong>Response team load</strong>
                <small>
                  Medical Unit Alpha is handling 3 incidents.
                </small>
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="panel analytics-node-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">NODE HEALTH</p>
            <h2>Relay performance</h2>
          </div>

          <BarChart3 size={23} />
        </div>

        <div className="analytics-node-table">
          <div className="analytics-node-row header">
            <span>Node</span>
            <span>Zone</span>
            <span>Signal</span>
            <span>Battery</span>
            <span>Reliability</span>
            <span>Status</span>
          </div>

          {nodeHealth.map((node) => (
            <div
              className="analytics-node-row"
              key={node.id}
            >
              <span>
                <strong>{node.id}</strong>
              </span>

              <span>{node.zone}</span>
              <span>{node.signal}%</span>
              <span>{node.battery}%</span>
              <span>{node.reliability}%</span>

              <span
                className={`analytics-node-status ${node.status}`}
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

export default Analytics;