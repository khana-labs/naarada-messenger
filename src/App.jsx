import { Navigate, Route, Routes } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CircleUserRound,
  Map,
  MessageSquare,
  PackageSearch,
  RadioTower,
  Settings,
  ShieldAlert,
  Siren,
} from "lucide-react";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

function PlaceholderPage({ icon: Icon, title, description }) {
  return (
    <section className="page placeholder-page">
      <div className="placeholder-icon" aria-hidden="true">
        <Icon size={36} />
      </div>

      <p className="eyebrow">NARADA MODULE</p>
      <h1>{title}</h1>
      <p>{description}</p>

      <div className="system-notice">
        <Activity size={18} />
        <span>This module will be connected in the next development step.</span>
      </div>
    </section>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/messages"
          element={
            <PlaceholderPage
              icon={MessageSquare}
              title="Messages"
              description="Search contacts, create encrypted packets, and monitor message delivery."
            />
          }
        />

        <Route
          path="/network"
          element={
            <PlaceholderPage
              icon={Map}
              title="Network Map"
              description="View nearby devices, relay routes, disconnected zones, shelters, and authority nodes."
            />
          }
        />

        <Route
          path="/routing"
          element={
            <PlaceholderPage
              icon={RadioTower}
              title="Routing Simulator"
              description="Compare nearby devices and select the safest route toward the receiver."
            />
          }
        />

        <Route
          path="/emergency"
          element={
            <PlaceholderPage
              icon={Siren}
              title="Emergency Centre"
              description="Create an SOS packet and request medical, rescue, shelter, or evacuation support."
            />
          }
        />

        <Route
          path="/authority"
          element={
            <PlaceholderPage
              icon={ShieldAlert}
              title="Authority Dashboard"
              description="Monitor critical incidents and coordinate verified emergency response teams."
            />
          }
        />

        <Route
          path="/packet"
          element={
            <PlaceholderPage
              icon={PackageSearch}
              title="Packet Inspector"
              description="Inspect encrypted message metadata, signatures, relay hops, and expiry information."
            />
          }
        />

        <Route
          path="/analytics"
          element={
            <PlaceholderPage
              icon={BarChart3}
              title="Network Analytics"
              description="Review network health, delivery performance, relay reliability, and coverage."
            />
          }
        />

        <Route
          path="/simulation"
          element={
            <PlaceholderPage
              icon={Activity}
              title="Simulation Control"
              description="Trigger network failures, move relay nodes, and demonstrate delivery scenarios."
            />
          }
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

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;