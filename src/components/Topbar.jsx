import {
  BatteryCharging,
  Menu,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import NotificationCentre from "./NotificationCentre";

function Topbar({
  batterySaver,
  onBatterySaverChange,
  onMenuClick,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-button mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={23} />
        </button>

        <div className="topbar-status">
          <RadioTower size={18} />
          <div>
            <strong>LOCAL MESH ONLINE</strong>
            <span>12 relay devices detected</span>
          </div>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="battery-saver-control">
          <BatteryCharging size={18} />
          <span>Battery saver</span>

          <input
            type="checkbox"
            checked={batterySaver}
            onChange={(event) =>
              onBatterySaverChange(event.target.checked)
            }
          />

          <span className="toggle-track" aria-hidden="true">
            <span className="toggle-thumb" />
          </span>
        </label>

        <div className="secure-indicator">
          <ShieldCheck size={18} />
          <span>Encrypted</span>
        </div>

        <NotificationCentre />
      </div>
    </header>
  );
}

export default Topbar;