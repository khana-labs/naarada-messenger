import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io("http://localhost:5000");

    socketInstance.on("connect", () => {
      console.log("Connected:", socketInstance.id);

      socketInstance.emit(
        "join",
        user.naradaId
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () =>
  useContext(SocketContext);