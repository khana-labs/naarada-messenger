import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Database,
  HardDrive,
  Lock,
  Route,
  Search,
  Shield,
  Wifi,
} from "lucide-react";

const packets = [
  {
    id: "PKT-8A12FF",
    source: "NRD-SHAS",
    destination: "NRD-ALISHA",
    size: "256 Bytes",
    encryption: "AES-256",
    latency: "143 ms",
    status: "Delivered",
    route: [
      "NRD-SHAS",
      "RELAY-01",
      "RELAY-02",
      "NRD-ALISHA",
    ],
    createdAt: "16 Jul 16:12",
  },
  {
    id: "PKT-91B7AA",
    source: "NRD-HRIDYA",
    destination: "NRD-PREM",
    size: "128 Bytes",
    encryption: "AES-256",
    latency: "187 ms",
    status: "Delivered",
    route: [
      "NRD-HRIDYA",
      "RELAY-02",
      "NRD-PREM",
    ],
    createdAt: "16 Jul 16:20",
  },
  {
    id: "PKT-SOS-01",
    source: "NRD-USER",
    destination: "AUTHORITY",
    size: "512 Bytes",
    encryption: "AES-256",
    latency: "229 ms",
    status: "Critical",
    route: [
      "NRD-USER",
      "RELAY-01",
      "RELAY-02",
      "AUTHORITY",
    ],
    createdAt: "16 Jul 16:24",
  },
];

function PacketInspector() {
  const [selectedPacket, setSelectedPacket] =
    useState(packets[0]);

  useEffect(() => {
    document.title =
      "Packet Inspector | Narada Messenger";
  }, []);

  return (
    <div className="page packet-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">
            PACKET ANALYSIS ENGINE
          </p>

          <h1>Packet Inspector</h1>

          <p>
            Inspect metadata, routes, encryption,
            latency and delivery status of Narada
            packets.
          </p>
        </div>
      </header>

      <section className="packet-layout">
        <aside className="panel packet-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">RECENT PACKETS</p>
              <h2>Packet Queue</h2>
            </div>

            <Search size={20} />
          </div>

          <div className="packet-list">
            {packets.map((packet) => (
              <button
                key={packet.id}
                className={
                  selectedPacket.id === packet.id
                    ? "packet-item selected"
                    : "packet-item"
                }
                onClick={() =>
                  setSelectedPacket(packet)
                }
              >
                <strong>{packet.id}</strong>

                <span>
                  {packet.source} →{" "}
                  {packet.destination}
                </span>

                <small>{packet.createdAt}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="panel packet-details">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                PACKET METADATA
              </p>

              <h2>{selectedPacket.id}</h2>
            </div>

            <Database size={22} />
          </div>

          <div className="packet-metrics">
            <div>
              <Wifi size={18} />
              <span>
                <small>Latency</small>
                <strong>
                  {selectedPacket.latency}
                </strong>
              </span>
            </div>

            <div>
              <Lock size={18} />
              <span>
                <small>Encryption</small>
                <strong>
                  {selectedPacket.encryption}
                </strong>
              </span>
            </div>

            <div>
              <HardDrive size={18} />
              <span>
                <small>Size</small>
                <strong>
                  {selectedPacket.size}
                </strong>
              </span>
            </div>

            <div>
              <Shield size={18} />
              <span>
                <small>Status</small>
                <strong>
                  {selectedPacket.status}
                </strong>
              </span>
            </div>
          </div>

          <div className="packet-route">
            <div className="packet-route-heading">
              <Route size={18} />
              ROUTE TRACE
            </div>

            <div className="packet-route-path">
              {selectedPacket.route.map(
                (node, index) => (
                  <div key={node}>
                    <span>{node}</span>

                    {index <
                      selectedPacket.route.length -
                        1 && <small>↓</small>}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="packet-footer">
            <Clock3 size={18} />

            <span>
              Packet generated on{" "}
              {selectedPacket.createdAt}
            </span>

            <CheckCircle2 size={18} />

            <span>
              Delivery verification successful
            </span>
          </div>
        </section>
      </section>
    </div>
  );
}

export default PacketInspector;