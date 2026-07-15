import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [batterySaver, setBatterySaver] = useState(() => {
    return localStorage.getItem("narada-battery-saver") === "true";
  });

  useEffect(() => {
    localStorage.setItem(
      "narada-battery-saver",
      batterySaver ? "true" : "false"
    );

    document.documentElement.dataset.batterySaver = batterySaver
      ? "true"
      : "false";
  }, [batterySaver]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="app-main">
        <Topbar
          batterySaver={batterySaver}
          onBatterySaverChange={setBatterySaver}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;