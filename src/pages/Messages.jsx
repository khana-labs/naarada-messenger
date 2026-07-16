import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Inbox,
  LockKeyhole,
  MessageSquare,
  RadioTower,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  WifiOff,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api, { getApiErrorMessage } from "../services/api";

const formatDate = (value) => {
  if (!value) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

function MessageStatus({ status }) {
  const normalizedStatus = status || "pending";

  if (normalizedStatus === "delivered") {
    return (
      <span className="message-page-status delivered">
        <CheckCircle2 size={14} />
        Delivered
      </span>
    );
  }

  if (normalizedStatus === "relaying") {
    return (
      <span className="message-page-status relaying">
        <RadioTower size={14} />
        Relaying
      </span>
    );
  }

  return (
    <span className="message-page-status pending">
      <Clock3 size={14} />
      Pending
    </span>
  );
}

function MessageRoute({ message }) {
  const route = Array.isArray(message.route) ? message.route : [];
  const currentHop = Number(message.currentHop || 0);

  if (route.length === 0) {
    return null;
  }

  return (
    <div className="message-route-display">
      <div className="message-route-heading">
        <RadioTower size={14} />
        <span>PACKET ROUTE</span>
      </div>

      <div className="message-route-nodes">
        {route.map((nodeId, index) => {
          const isComplete = index < currentHop;
          const isActive =
            index === currentHop && message.status !== "delivered";
          const isDelivered =
            message.status === "delivered" &&
            index === route.length - 1;

          return (
            <div
              className="message-route-item"
              key={`${message._id}-${nodeId}-${index}`}
            >
              <div
                className={[
                  "message-route-node",
                  isComplete ? "complete" : "",
                  isActive ? "active" : "",
                  isDelivered ? "delivered" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="message-route-marker">
                  {isComplete || isDelivered ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <RadioTower size={14} />
                  )}
                </span>

                <span>{nodeId}</span>
              </div>

              {index < route.length - 1 && (
                <ChevronRight
                  size={14}
                  className={
                    index < currentHop
                      ? "message-route-arrow complete"
                      : "message-route-arrow"
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Messages() {
  const { user } = useAuth();
  const socket = useSocket();

  const [activeTab, setActiveTab] = useState("inbox");
  const [receiverNaradaId, setReceiverNaradaId] = useState("");
  const [content, setContent] = useState("");

  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    setPageError("");

    try {
      const [inboxResponse, sentResponse] = await Promise.all([
        api.get("/messages/inbox"),
        api.get("/messages/sent"),
      ]);

      setInboxMessages(inboxResponse.data.data || []);
      setSentMessages(sentResponse.data.data || []);
    } catch (error) {
      setPageError(
        getApiErrorMessage(
          error,
          "Unable to load messages from the Narada server."
        )
      );
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const updateMessageCollection = useCallback(
    (messages, updatedMessage) => {
      const exists = messages.some(
        (message) => message._id === updatedMessage._id
      );

      if (!exists) {
        return [updatedMessage, ...messages];
      }

      return messages.map((message) =>
        message._id === updatedMessage._id
          ? updatedMessage
          : message
      );
    },
    []
  );

  useEffect(() => {
    document.title = "Messages | Narada Messenger";
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleIncomingMessage = (message) => {
      setInboxMessages((previousMessages) =>
        updateMessageCollection(previousMessages, message)
      );

      setSendSuccess("New encrypted packet received.");
    };

    const handleMessageStatusUpdate = (message) => {
      const isSender =
        message.senderNaradaId === user?.naradaId;

      const isReceiver =
        message.receiverNaradaId === user?.naradaId;

      if (isSender) {
        setSentMessages((previousMessages) =>
          updateMessageCollection(previousMessages, message)
        );
      }

      if (isReceiver) {
        setInboxMessages((previousMessages) =>
          updateMessageCollection(previousMessages, message)
        );
      }
    };

    socket.on("receive-message", handleIncomingMessage);
    socket.on(
      "message-status-update",
      handleMessageStatusUpdate
    );

    return () => {
      socket.off("receive-message", handleIncomingMessage);
      socket.off(
        "message-status-update",
        handleMessageStatusUpdate
      );
    };
  }, [socket, updateMessageCollection, user?.naradaId]);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const normalizedReceiverId = receiverNaradaId
      .trim()
      .toUpperCase();

    const trimmedContent = content.trim();

    setSendError("");
    setSendSuccess("");

    if (!normalizedReceiverId) {
      setSendError("Enter the receiver's Narada ID.");
      return;
    }

    if (!trimmedContent) {
      setSendError("Enter a message.");
      return;
    }

    if (normalizedReceiverId === user?.naradaId) {
      setSendError(
        "You cannot send a message to your own Narada ID."
      );
      return;
    }

    setSending(true);

    try {
      const response = await api.post("/messages/send", {
        receiverNaradaId: normalizedReceiverId,
        content: trimmedContent,
      });

      const createdMessage = response.data.data;

      setSentMessages((previousMessages) =>
        updateMessageCollection(
          previousMessages,
          createdMessage
        )
      );

      setSendSuccess(
        response.data.message ||
          "Packet created and relay simulation started."
      );

      setReceiverNaradaId("");
      setContent("");
      setActiveTab("sent");
    } catch (error) {
      setSendError(
        getApiErrorMessage(
          error,
          "Message could not be sent."
        )
      );
    } finally {
      setSending(false);
    }
  };

  const currentMessages =
    activeTab === "inbox"
      ? inboxMessages
      : sentMessages;

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return currentMessages;
    }

    return currentMessages.filter((message) => {
      const senderName = message.sender?.name || "";
      const receiverName = message.receiver?.name || "";
      const senderNaradaId =
        message.senderNaradaId || "";
      const receiverId =
        message.receiverNaradaId || "";
      const messageContent = message.content || "";

      return [
        senderName,
        receiverName,
        senderNaradaId,
        receiverId,
        messageContent,
      ].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }, [currentMessages, searchQuery]);

  return (
    <div className="page messages-page">
      <header className="page-heading messages-page-heading">
        <div>
          <p className="eyebrow">
            ENCRYPTED COMMUNICATION
          </p>

          <h1>Messages</h1>

          <p>
            Create encrypted packets and monitor their
            simulated relay path across the Narada network.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button messages-refresh-button"
          onClick={fetchMessages}
          disabled={loadingMessages}
        >
          <RefreshCw
            size={18}
            className={
              loadingMessages
                ? "messages-refreshing"
                : ""
            }
          />
          Refresh
        </button>
      </header>

      <section className="messages-identity-strip">
        <div>
          <UserRound size={20} />

          <span>
            <small>ACTIVE IDENTITY</small>
            <strong>{user?.name}</strong>
          </span>
        </div>

        <div>
          <ShieldCheck size={20} />

          <span>
            <small>NARADA ID</small>
            <strong>{user?.naradaId}</strong>
          </span>
        </div>

        <div>
          <LockKeyhole size={20} />

          <span>
            <small>SESSION</small>
            <strong>AUTHENTICATED</strong>
          </span>
        </div>
      </section>

      <section className="messages-layout">
        <article className="panel compose-message-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CREATE PACKET</p>
              <h2>Send message</h2>
            </div>

            <Send size={23} />
          </div>

          <form
            className="compose-message-form"
            onSubmit={handleSendMessage}
          >
            <label htmlFor="receiver-narada-id">
              Receiver Narada ID
            </label>

            <div className="input-with-icon">
              <UserRound size={19} />

              <input
                id="receiver-narada-id"
                value={receiverNaradaId}
                onChange={(event) =>
                  setReceiverNaradaId(
                    event.target.value.toUpperCase()
                  )
                }
                placeholder="NRD-ABC123"
                autoComplete="off"
                maxLength={20}
              />
            </div>

            <div className="compose-message-help">
              Enter the Narada ID of another registered
              user.
            </div>

            <label htmlFor="message-content">
              Message
            </label>

            <textarea
              id="message-content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="Write one short and clear emergency message..."
              maxLength={1000}
              rows={7}
            />

            <div className="compose-message-count">
              {content.length}/1000
            </div>

            {sendError && (
              <div
                className="messages-form-alert error"
                role="alert"
              >
                <AlertTriangle size={18} />
                <span>{sendError}</span>
              </div>
            )}

            {sendSuccess && (
              <div
                className="messages-form-alert success"
                role="status"
              >
                <CheckCircle2 size={18} />
                <span>{sendSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="primary-button compose-send-button"
              disabled={sending}
            >
              {sending ? (
                <>
                  <RadioTower size={19} />
                  Creating packet...
                </>
              ) : (
                <>
                  <Send size={19} />
                  Encrypt and send
                </>
              )}
            </button>
          </form>

          <div className="message-security-note">
            <LockKeyhole size={18} />

            <div>
              <strong>Protected API request</strong>

              <span>
                Your authenticated identity is attached
                automatically.
              </span>
            </div>
          </div>
        </article>

        <article className="panel message-list-panel">
          <div className="messages-tabs">
            <button
              type="button"
              className={
                activeTab === "inbox" ? "active" : ""
              }
              onClick={() => setActiveTab("inbox")}
            >
              <Inbox size={18} />
              Inbox
              <span>{inboxMessages.length}</span>
            </button>

            <button
              type="button"
              className={
                activeTab === "sent" ? "active" : ""
              }
              onClick={() => setActiveTab("sent")}
            >
              <Send size={18} />
              Sent
              <span>{sentMessages.length}</span>
            </button>
          </div>

          <div className="messages-search">
            <Search size={18} />

            <input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search messages, names, or Narada IDs"
            />
          </div>

          {pageError && (
            <div className="messages-page-error">
              <WifiOff size={20} />

              <div>
                <strong>Could not load messages</strong>
                <span>{pageError}</span>
              </div>

              <button
                type="button"
                onClick={fetchMessages}
              >
                Retry
              </button>
            </div>
          )}

          {loadingMessages ? (
            <div className="messages-loading-state">
              <div className="messages-loading-radar">
                <span />
                <span />
              </div>

              <strong>LOADING MESSAGE PACKETS</strong>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="messages-empty-state">
              <MessageSquare size={38} />

              <strong>
                {activeTab === "inbox"
                  ? "No received messages"
                  : "No sent messages"}
              </strong>

              <span>
                {activeTab === "inbox"
                  ? "Delivered packets will appear here."
                  : "Create your first encrypted packet using the form."}
              </span>
            </div>
          ) : (
            <div className="messages-list">
              {filteredMessages.map((message) => {
                const contact =
                  activeTab === "inbox"
                    ? message.sender
                    : message.receiver;

                const fallbackNaradaId =
                  activeTab === "inbox"
                    ? message.senderNaradaId
                    : message.receiverNaradaId;

                return (
                  <article
                    className="message-list-item"
                    key={message._id}
                  >
                    <div className="message-list-avatar">
                      <UserRound size={21} />
                    </div>

                    <div className="message-list-content">
                      <div className="message-list-header">
                        <div>
                          <strong>
                            {contact?.name ||
                              fallbackNaradaId ||
                              "Unknown user"}
                          </strong>

                          <span>
                            {contact?.naradaId ||
                              fallbackNaradaId}
                          </span>
                        </div>

                        <time>
                          {formatDate(message.createdAt)}
                        </time>
                      </div>

                      <p>{message.content}</p>

                      <div className="message-list-footer">
                        <MessageStatus
                          status={message.status}
                        />

                        <span className="encrypted-message-label">
                          <LockKeyhole size={13} />
                          Encrypted packet
                        </span>

                        {message.hops?.length > 0 && (
                          <span className="message-hop-count">
                            <RadioTower size={13} />
                            {message.hops.length} hop
                            {message.hops.length !== 1
                              ? "s"
                              : ""}
                          </span>
                        )}
                      </div>

                      <MessageRoute message={message} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default Messages;