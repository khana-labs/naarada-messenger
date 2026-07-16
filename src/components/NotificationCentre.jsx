import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  X,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

function NotificationCentre() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [open, setOpen] = useState(false);

  return (
    <div className="notification-centre">
      <button
        className="notification-button"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <strong>Notifications</strong>

            <button
              onClick={markAllAsRead}
            >
              <Check size={16} />
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="notification-empty">
              No notifications.
            </p>
          ) : (
            notifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.read
                      ? ""
                      : "unread"
                  }`}
                >
                  <div
                    onClick={() =>
                      markAsRead(
                        notification.id
                      )
                    }
                  >
                    <strong>
                      {notification.title}
                    </strong>

                    <p>
                      {
                        notification.message
                      }
                    </p>

                    <small>
                      {new Date(
                        notification.createdAt
                      ).toLocaleTimeString()}
                    </small>
                  </div>

                  <button
                    onClick={() =>
                      removeNotification(
                        notification.id
                      )
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            )
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCentre;