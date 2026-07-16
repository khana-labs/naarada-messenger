import {
  Activity,
  MapPin,
  Navigation,
  RadioTower,
  ShieldCheck,
} from "lucide-react";

const nodes = [
  {
    id: "NODE-A",
    name: "Shashank",
    type: "sender",
    x: 12,
    y: 65,
  },
  {
    id: "NODE-B",
    name: "Relay Node",
    type: "relay",
    x: 48,
    y: 38,
  },
  {
    id: "NODE-C",
    name: "Alisha",
    type: "receiver",
    x: 84,
    y: 62,
  },
];

function NetworkMap() {
  return (
    <div className="page network-map-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">LIVE NETWORK TOPOLOGY</p>
          <h1>Network Map</h1>
          <p>
            View simulated devices, relay connections, and the active message
            route.
          </p>
        </div>
      </header>

      <section className="primary-network-banner">
        <div className="network-banner-icon">
          <RadioTower size={30} />
        </div>

        <div className="network-banner-copy">
          <div className="network-banner-title">
            <span className="status-dot status-dot-cyan" />
            <strong>LOCAL RELAY NETWORK ACTIVE</strong>
          </div>

          <p>
            Three Narada nodes are connected in the current simulation.
          </p>
        </div>
      </section>

      <section className="simple-network-layout">
        <article className="panel simple-network-map">
          <div className="map-grid-overlay" />

          <svg
            className="simple-network-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line x1="12" y1="65" x2="48" y2="38" />
            <line x1="48" y1="38" x2="84" y2="62" />
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className={`simple-map-node simple-map-node-${node.type}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
              }}
            >
              <div className="simple-map-node-icon">
                {node.type === "sender" && <Navigation size={22} />}
                {node.type === "relay" && <RadioTower size={22} />}
                {node.type === "receiver" && <MapPin size={22} />}
              </div>

              <strong>{node.name}</strong>
              <span>{node.id}</span>
            </div>
          ))}

          <div className="simple-packet">
            <Navigation size={14} />
            PACKET
          </div>
        </article>

        <aside className="panel simple-network-details">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ACTIVE ROUTE</p>
              <h2>Message delivery</h2>
            </div>

            <Activity size={22} />
          </div>

          <div className="simple-route-step complete">
            <ShieldCheck size={19} />
            <div>
              <strong>Message created</strong>
              <span>Encrypted on Node A</span>
            </div>
          </div>

          <div className="simple-route-step active">
            <RadioTower size={19} />
            <div>
              <strong>Relay Node B</strong>
              <span>Packet stored and forwarding</span>
            </div>
          </div>

          <div className="simple-route-step">
            <MapPin size={19} />
            <div>
              <strong>Receiver Node C</strong>
              <span>Waiting for packet</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default NetworkMap;