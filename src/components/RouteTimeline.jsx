import {
  Check,
  CircleDot,
  MapPin,
  RadioTower,
  Send,
} from "lucide-react";

const events = [
  {
    title: "Message created",
    detail: "Encrypted for NRD-45B7D1",
    time: "18:21",
    icon: Send,
    state: "complete",
  },
  {
    title: "Forwarded to Node 04",
    detail: "Relay score: 86 / 100",
    time: "18:22",
    icon: RadioTower,
    state: "complete",
  },
  {
    title: "Carried by Bus Relay",
    detail: "Moving toward destination zone",
    time: "18:24",
    icon: MapPin,
    state: "active",
  },
  {
    title: "Awaiting next relay",
    detail: "Receiver estimated 2.8 km away",
    time: "Now",
    icon: CircleDot,
    state: "pending",
  },
];

function RouteTimeline() {
  return (
    <div className="route-timeline">
      {events.map((event, index) => {
        const Icon = event.icon;

        return (
          <div
            className={`timeline-item timeline-${event.state}`}
            key={`${event.title}-${event.time}`}
          >
            <div className="timeline-marker">
              {event.state === "complete" ? (
                <Check size={15} />
              ) : (
                <Icon size={15} />
              )}
            </div>

            {index < events.length - 1 && (
              <span className="timeline-line" aria-hidden="true" />
            )}

            <div className="timeline-content">
              <div>
                <strong>{event.title}</strong>
                <span>{event.detail}</span>
              </div>

              <time>{event.time}</time>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RouteTimeline;