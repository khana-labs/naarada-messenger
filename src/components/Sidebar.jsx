import {
  Activity,
  BarChart3,
  BatteryMedium,
  CircleUserRound,
  LayoutDashboard,
  Map,
  MessageSquare,
  PackageSearch,
  RadioTower,
  Settings,
  ShieldAlert,
  Siren,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const primaryLinks = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Messages",
    path: "/messages",
    icon: MessageSquare,
  },
  {
    label: "Network Map",
    path: "/network",
    icon: Map,
  },
  {
    label: "Routing",
    path: "/routing",
    icon: RadioTower,
  },
  {
    label: "Emergency",
    path: "/emergency",
    icon: Siren,
    critical: true,
  },
];

const systemLinks = [
  {
    label: "Authority",
    path: "/authority",
    icon: ShieldAlert,
  },
  {
    label: "Packet Inspector",
    path: "/packet",
    icon: PackageSearch,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Simulation",
    path: "/simulation",
    icon: Activity,
  },
];

function SidebarLink({ item, onClick }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "sidebar-link",
          isActive ? "active" : "",
          item.critical ? "critical-link" : "",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <Icon size={20} aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );
}

function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <div className="brand-mark" aria-hidden="true">
          <RadioTower size={26} />
        </div>

        <div className="brand-copy">
          <strong>NARADA</strong>
          <span>EMERGENCY NETWORK</span>
        </div>

        <button
          className="icon-button sidebar-close"
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={22} />
        </button>
      </div>

      <div className="network-mode">
        <span className="status-dot status-dot-cyan" />
        <div>
          <strong>NETWORK ACTIVE</strong>
          <span>Decentralized relay mode</span>
        </div>
      </div>

      <nav className="sidebar-navigation" aria-label="Main navigation">
        <p className="sidebar-section-label">OPERATIONS</p>

        {primaryLinks.map((item) => (
          <SidebarLink key={item.path} item={item} onClick={onClose} />
        ))}

        <p className="sidebar-section-label sidebar-section-spaced">
          SYSTEM
        </p>

        {systemLinks.map((item) => (
          <SidebarLink key={item.path} item={item} onClick={onClose} />
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/profile"
          className="profile-card"
          onClick={onClose}
        >
          <div className="profile-avatar">
            <CircleUserRound size={25} />
          </div>

          <div>
            <strong>Shashank</strong>
            <span>NRD-8F29A7</span>
          </div>
        </NavLink>

        <NavLink
          to="/settings"
          className="sidebar-footer-link"
          onClick={onClose}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <div className="battery-summary">
          <BatteryMedium size={18} />
          <span>Device battery</span>
          <strong>68%</strong>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;