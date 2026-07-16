import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext(null);

const MAX_NOTIFICATIONS = 50;

const createNotificationId = () => {
  return `notification-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
};

const getStorageKey = (naradaId) => {
  return naradaId
    ? `narada-notifications-${naradaId}`
    : "narada-notifications";
};

const getStoredNotifications = (naradaId) => {
  if (!naradaId) {
    return [];
  }

  try {
    const storedValue = localStorage.getItem(
      getStorageKey(naradaId)
    );

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? parsedValue
      : [];
  } catch {
    return [];
  }
};

const saveNotifications = (
  naradaId,
  notifications
) => {
  if (!naradaId) {
    return;
  }

  localStorage.setItem(
    getStorageKey(naradaId),
    JSON.stringify(
      notifications.slice(0, MAX_NOTIFICATIONS)
    )
  );
};

const createNotification = ({
  title,
  message,
  type = "info",
  category = "system",
  link = null,
  metadata = {},
}) => {
  return {
    id: createNotificationId(),
    title,
    message,
    type,
    category,
    link,
    metadata,
    read: false,
    createdAt: new Date().toISOString(),
  };
};

export function NotificationProvider({
  children,
}) {
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();

  const [notifications, setNotifications] =
    useState([]);

  const [permission, setPermission] =
    useState(() => {
      if (
        typeof window === "undefined" ||
        !("Notification" in window)
      ) {
        return "unsupported";
      }

      return window.Notification.permission;
    });

  const naradaId = user?.naradaId;

  useEffect(() => {
    if (!isAuthenticated || !naradaId) {
      setNotifications([]);
      return;
    }

    setNotifications(
      getStoredNotifications(naradaId)
    );
  }, [isAuthenticated, naradaId]);

  useEffect(() => {
    if (!naradaId) {
      return;
    }

    saveNotifications(
      naradaId,
      notifications
    );
  }, [naradaId, notifications]);

  const showBrowserNotification =
    useCallback(
      (notification) => {
        if (
          typeof window === "undefined" ||
          !("Notification" in window) ||
          window.Notification.permission !==
            "granted"
        ) {
          return;
        }

        const browserNotification =
          new window.Notification(
            notification.title,
            {
              body: notification.message,
              icon: "/vite.svg",
              tag:
                notification.metadata
                  ?.eventId ||
                notification.id,
            }
          );

        browserNotification.onclick = () => {
          window.focus();

          if (notification.link) {
            window.location.href =
              notification.link;
          }

          browserNotification.close();
        };
      },
      []
    );

  const addNotification = useCallback(
    (notificationData) => {
      const notification =
        createNotification(
          notificationData
        );

      setNotifications((current) => [
        notification,
        ...current,
      ].slice(0, MAX_NOTIFICATIONS));

      showBrowserNotification(
        notification
      );

      return notification;
    },
    [showBrowserNotification]
  );

  const requestPermission =
    useCallback(async () => {
      if (
        typeof window === "undefined" ||
        !("Notification" in window)
      ) {
        setPermission("unsupported");

        return {
          success: false,
          permission: "unsupported",
        };
      }

      try {
        const result =
          await window.Notification.requestPermission();

        setPermission(result);

        return {
          success: result === "granted",
          permission: result,
        };
      } catch {
        return {
          success: false,
          permission:
            window.Notification.permission,
        };
      }
    }, []);

  const markAsRead = useCallback(
    (notificationId) => {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id ===
          notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    },
    []
  );

  const markAllAsRead =
    useCallback(() => {
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    }, []);

  const removeNotification =
    useCallback((notificationId) => {
      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !==
            notificationId
        )
      );
    }, []);

  const clearNotifications =
    useCallback(() => {
      setNotifications([]);
    }, []);

  useEffect(() => {
    if (!socket || !naradaId) {
      return undefined;
    }

    const handleIncomingMessage = (
      message
    ) => {
      if (
        message.receiverNaradaId !==
        naradaId
      ) {
        return;
      }

      addNotification({
        title: "New encrypted message",
        message: `${
          message.sender?.name ||
          message.senderNaradaId ||
          "Narada user"
        }: ${message.content}`,
        type: "message",
        category: "message",
        link: "/messages",
        metadata: {
          eventId: message._id,
          senderNaradaId:
            message.senderNaradaId,
        },
      });
    };

    const handleMessageStatusUpdate = (
      message
    ) => {
      if (
        message.senderNaradaId !==
          naradaId ||
        message.status !== "delivered"
      ) {
        return;
      }

      addNotification({
        title: "Packet delivered",
        message: `Your message reached ${message.receiverNaradaId}.`,
        type: "success",
        category: "message",
        link: "/messages",
        metadata: {
          eventId: `delivered-${message._id}`,
        },
      });
    };

    const handleEmergencyUpdate = (
      emergency
    ) => {
      if (
        emergency.naradaId !== naradaId
      ) {
        return;
      }

      const latestUpdate =
        emergency.updates?.[
          emergency.updates.length - 1
        ];

      addNotification({
        title: `SOS ${emergency.status}`,
        message:
          latestUpdate?.note ||
          `${emergency.emergencyId} was updated.`,
        type:
          emergency.status === "resolved"
            ? "success"
            : emergency.status ===
                "cancelled"
              ? "info"
              : "emergency",
        category: "emergency",
        link: "/emergency",
        metadata: {
          eventId: `${
            emergency._id
          }-${emergency.status}-${
            emergency.currentHop
          }`,
        },
      });
    };

    const handleNewEmergency = (
      emergency
    ) => {
      const authorityRoles = [
        "responder",
        "hospital",
        "police",
        "shelter",
        "authority",
        "admin",
      ];

      if (
        !authorityRoles.includes(
          user?.role
        )
      ) {
        return;
      }

      addNotification({
        title: "Critical SOS received",
        message: `${emergency.emergencyId}: ${emergency.description}`,
        type: "emergency",
        category: "authority",
        link: "/authority",
        metadata: {
          eventId: emergency._id,
          severity:
            emergency.severity,
        },
      });
    };

    socket.on(
      "receive-message",
      handleIncomingMessage
    );

    socket.on(
      "message-status-update",
      handleMessageStatusUpdate
    );

    socket.on(
      "emergency:update",
      handleEmergencyUpdate
    );

    socket.on(
      "emergency:new",
      handleNewEmergency
    );

    return () => {
      socket.off(
        "receive-message",
        handleIncomingMessage
      );

      socket.off(
        "message-status-update",
        handleMessageStatusUpdate
      );

      socket.off(
        "emergency:update",
        handleEmergencyUpdate
      );

      socket.off(
        "emergency:new",
        handleNewEmergency
      );
    };
  }, [
    socket,
    naradaId,
    user?.role,
    addNotification,
  ]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      permission,
      addNotification,
      requestPermission,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearNotifications,
    }),
    [
      notifications,
      unreadCount,
      permission,
      addNotification,
      requestPermission,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearNotifications,
    ]
  );

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(
    NotificationContext
  );

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}