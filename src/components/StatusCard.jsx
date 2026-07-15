function StatusCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "neutral",
}) {
  return (
    <article className={`status-card status-card-${tone}`}>
      <div className="status-card-top">
        <div className="status-card-icon">
          <Icon size={21} aria-hidden="true" />
        </div>

        <span className="status-card-label">{label}</span>
      </div>

      <strong className="status-card-value">{value}</strong>
      <span className="status-card-helper">{helper}</span>
    </article>
  );
}

export default StatusCard;