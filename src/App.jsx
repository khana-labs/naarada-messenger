import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  Activity,
  BarChart3,
  CircleUserRound,
  PackageSearch,
  RadioTower,
  Settings,
  ShieldAlert,
  Siren,
} from "lucide-react";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Messages from "./pages/Messages";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NetworkMap from "./pages/NetworkMap";
import Register from "./pages/Register";
import EmergencyCentre from "./pages/EmergencyCentre";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import SimulationControl from "./pages/SimulationControl";
import RoutingSimulator from "./pages/RoutingSimulator";
import PacketInspector from "./pages/PacketInspector";
import Analytics from "./pages/Analytics";

function PlaceholderPage({
  icon: Icon,
  title,
  description,
}) {
  return (
    <section className="page placeholder-page">
      <div className="placeholder-icon">
        <Icon size={36} />
      </div>

      <p className="eyebrow">NARADA MODULE</p>

      <h1>{title}</h1>

      <p>{description}</p>

      <div className="system-notice">
        <Activity size={18} />

        <span>
          This module will be connected in the next
          development step.
        </span>
      </div>
    </section>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route path="/messages" element={<Messages />} />

        <Route
          path="/network"
          element={<NetworkMap />}
        />

        <Route
          path="/routing"
          element={<RoutingSimulator />}
        />

        <Route
          path="/emergency"
          element={<EmergencyCentre />}
        />

        <Route
          path="/authority"
          element={<AuthorityDashboard />}
        />

        <Route
          path="/packet"
          element={<PacketInspector />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/simulation"
           element={<SimulationControl />}
        />

        <Route
          path="/profile"
          element={
            <PlaceholderPage
              icon={CircleUserRound}
              title="Narada Identity"
              description="Manage the active Narada ID, trusted contacts, and emergency profile."
            />
          }
        />

        <Route
          path="/settings"
          element={
            <PlaceholderPage
              icon={Settings}
              title="Settings"
              description="Configure battery saver, scanning frequency, location sharing, and accessibility."
            />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to="/dashboard" replace />
        }
      />
    </Routes>
  );
}

export default App;