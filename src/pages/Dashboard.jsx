import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BatteryMedium,
  CheckCircle2,
  Clock3,
  LocateFixed,
  MapPin,
  MessageSquare,
  Navigation,
  RadioTower,
  Search,
  Send,
  ShieldCheck,
  Signal,
  Siren,
  Users,
  WifiOff,
} from "lucide-react";

import RouteTimeline from "../components/RouteTimeline";
import StatusCard from "../components/StatusCard";

const nearbyNodes = [
  {
    id: "NODE-04",
    name: "Civilian Relay",
    distance: "32 m",
    battery: "81%",
    score: 86,
    status: "Available",
  },
  {
    id: "BUS-12",
    name: "Bus Relay",
    distance: "118 m",
    battery: "74%",
    score: 93,
    status: "Moving east",
  },
  {
    id: "AUTH-02",
    name: "Medical Authority",
    distance: "410 m",
    battery: "External",
    score: 98,
    status: "Verified",
  },
];

const recentMessages = [
  {
    recipient: "Alisha Sharma",
    message: "I am safe. Moving toward the central shelter.",
    status: "Relaying",
    time: "18:21",
    tone: "warning",
  },
  {
    recipient: "Premanshu Dey",
    message: "Meet near the verified medical node.",
    status: "Delivered",
    time: "18:08",
    tone: "safe",
  },
  {
    recipient: "Hridya Sharma",
    message: "Confirm your current location when possible.",
    status: "Stored",
    time: "17:54",
    tone: "neutral",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [sendFeedback, setSendFeedback] = useState("");

  const handleQuickSend = (event) => {
    event.preventDefault();

    if (!recipient.trim() || !message.trim()) {
      setSendFeedback("Select a recipient and enter a short message.");
      return;
    }

    setSendFeedback("Message encrypted and added to relay queue.");
    setMessage("");

    window.setTimeout(() => {
      setSendFeedback("");
    }, 3500);
  };

  return (
    <div className="page dashboard-page">
      <header className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">CIVILIAN CONTROL CENTRE</p>
          <h1>Emergency Overview</h1>
          <p>
            Local devices are carrying encrypted messages without internet or
            cellular infrastructure.
          </p>
        </div>

        <button
          type="button"
          className="sos-button"
          onClick={() => navigate("/emergency")}
        >
          <Siren size={25} />
          <span>
            <strong>SEND SOS</strong>
            <small>Request immediate help</small>
          </span>
        </button>
      </header>

      <section className="primary-network-banner">
        <div className="network-banner-icon">
          <RadioTower size={30} />
          <span className="radar-ring radar-ring-one" />
          <span className="radar-ring radar-ring-two" />
        </div>

        <div className="network-banner-copy">
          <div className="network-banner-title">
            <span className="status-dot status-dot-cyan" />
            <strong>NARADA NETWORK ACTIVE</strong>
          </div>

          <p>
            12 nearby devices detected. A route to the nearest authority node
            is available.
          </p>
        </div>

        <div className="network-banner-metrics">
          <div>
            <span>Signal quality</span>
            <strong>
              <Signal size={17} />
              Strong
            </strong>
          </div>

          <div>
            <span>Encryption</span>
            <strong>
              <ShieldCheck size={17} />
              Active
            </strong>
          </div>
        </div>
      </section>

      <section className="status-grid" aria-label="Current network status">
        <StatusCard
          icon={RadioTower}
          label="Nearby relays"
          value="12"
          helper="3 high-reliability nodes"
          tone="cyan"
        />

        <StatusCard
          icon={Clock3}
          label="Pending packets"
          value="03"
          helper="Oldest waiting 11 minutes"
          tone="yellow"
        />

        <StatusCard
          icon={CheckCircle2}
          label="Delivered today"
          value="18"
          helper="94% delivery success"
          tone="cyan"
        />

        <StatusCard
          icon={BatteryMedium}
          label="Device battery"
          value="68%"
          helper="Estimated relay time: 7 hours"
          tone="neutral"
        />
      </section>

      <section className="dashboard-main-grid">
        <article className="panel quick-message-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">PRIMARY ACTION</p>
              <h2>Send a message</h2>
            </div>

            <MessageSquare size={23} />
          </div>

          <form className="quick-message-form" onSubmit={handleQuickSend}>
            <label htmlFor="quick-recipient">Recipient</label>

            <div className="input-with-icon">
              <Search size={19} />
              <input
                id="quick-recipient"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="Name or Narada ID"
                autoComplete="off"
              />
            </div>

            <label htmlFor="quick-message">Message</label>

            <textarea
              id="quick-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={180}
              placeholder="Write one clear, short message..."
              rows={4}
            />

            <div className="message-form-footer">
              <span>{message.length}/180</span>

              <button type="submit" className="primary-button">
                <Send size={19} />
                Encrypt and send
              </button>
            </div>

            {sendFeedback && (
              <div className="form-feedback" role="status">
                <ShieldCheck size={18} />
                <span>{sendFeedback}</span>
              </div>
            )}
          </form>

          <button
            type="button"
            className="text-action"
            onClick={() => navigate("/messages")}
          >
            Open full messages
            <ArrowRight size={17} />
          </button>
        </article>

        <article className="panel message-route-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LIVE PACKET</p>
              <h2>Message route</h2>
            </div>

            <div className="route-live-label">
              <span className="status-dot status-dot-yellow" />
              RELAYING
            </div>
          </div>

          <div className="route-summary">
            <div>
              <span>To</span>
              <strong>Alisha Sharma</strong>
            </div>

            <ArrowRight size={19} />

            <div>
              <span>Destination zone</span>
              <strong>NIT Main Gate</strong>
            </div>
          </div>

          <RouteTimeline />

          <button
            type="button"
            className="secondary-button full-width-button"
            onClick={() => navigate("/network")}
          >
            <Navigation size={18} />
            View on network map
          </button>
        </article>
      </section>

      <section className="dashboard-secondary-grid">
        <article className="panel nearby-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">DEVICE DISCOVERY</p>
              <h2>Nearby relay devices</h2>
            </div>

            <div className="scan-label">
              <Activity size={17} />
              Scanning
            </div>
          </div>

          <div className="node-list">
            {nearbyNodes.map((node) => (
              <div className="node-row" key={node.id}>
                <div className="node-symbol">
                  {node.id.startsWith("AUTH") ? (
                    <ShieldCheck size={21} />
                  ) : node.id.startsWith("BUS") ? (
                    <Navigation size={21} />
                  ) : (
                    <RadioTower size={21} />
                  )}
                </div>

                <div className="node-main">
                  <div>
                    <strong>{node.name}</strong>
                    <span>{node.id}</span>
                  </div>

                  <div className="node-status">
                    <span>{node.status}</span>
                  </div>
                </div>

                <div className="node-details">
                  <span>
                    <MapPin size={14} />
                    {node.distance}
                  </span>

                  <span>
                    <BatteryMedium size={14} />
                    {node.battery}
                  </span>

                  <strong>{node.score}</strong>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="text-action"
            onClick={() => navigate("/routing")}
          >
            Explain relay selection
            <ArrowRight size={17} />
          </button>
        </article>

        <article className="panel safety-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">PERSONAL STATUS</p>
              <h2>Your safety</h2>
            </div>

            <LocateFixed size={22} />
          </div>

          <div className="safety-state">
            <div className="safety-state-icon">
              <CheckCircle2 size={29} />
            </div>

            <div>
              <span>CURRENT STATUS</span>
              <strong>MARKED SAFE</strong>
              <p>Last confirmed at 18:16</p>
            </div>
          </div>

          <div className="location-card">
            <MapPin size={21} />

            <div>
              <span>Last known location</span>
              <strong>NIT Jalandhar · Hostel Zone</strong>
              <small>Accuracy ±22 metres</small>
            </div>
          </div>

          <div className="safety-actions">
            <button type="button" className="secondary-button">
              <CheckCircle2 size={18} />
              Confirm safe
            </button>

            <button
              type="button"
              className="danger-outline-button"
              onClick={() => navigate("/emergency")}
            >
              <Siren size={18} />
              Need help
            </button>
          </div>
        </article>
      </section>

      <section className="panel recent-messages-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">COMMUNICATION LOG</p>
            <h2>Recent messages</h2>
          </div>

          <button
            type="button"
            className="text-action compact-action"
            onClick={() => navigate("/messages")}
          >
            View all
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="recent-message-list">
          {recentMessages.map((item) => (
            <article
              className="recent-message-row"
              key={`${item.recipient}-${item.time}`}
            >
              <div
                className={`message-status-symbol message-status-${item.tone}`}
              >
                {item.tone === "safe" ? (
                  <CheckCircle2 size={19} />
                ) : item.tone === "warning" ? (
                  <RadioTower size={19} />
                ) : (
                  <WifiOff size={19} />
                )}
              </div>

              <div className="recent-message-content">
                <div>
                  <strong>{item.recipient}</strong>
                  <time>{item.time}</time>
                </div>

                <p>{item.message}</p>
              </div>

              <span className={`status-badge status-badge-${item.tone}`}>
                {item.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="emergency-guidance">
        <Siren size={23} />

        <div>
          <strong>In immediate danger?</strong>
          <span>
            Send an SOS packet. It receives priority routing and additional
            relay copies.
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/emergency")}
        >
          Open Emergency Centre
          <ArrowRight size={17} />
        </button>
      </section>
    </div>
  );
}

export default Dashboard;