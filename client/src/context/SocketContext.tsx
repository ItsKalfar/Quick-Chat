import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import socketio from "socket.io-client";
import { LocalStorage } from "../utils/LocalStorage";

type SocketContextType = {
  socket: ReturnType<typeof socketio> | null;
};

const getSocket = () => {
  const token = LocalStorage.get("token");

  // Create a socket connection with the provided URI and authentication
  return socketio(import.meta.env.VITE_SOCKET_URI, {
    withCredentials: true,
    auth: { token },
  });
};

export const SocketContext = createContext({} as SocketContextType);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(
    null
  );

  useEffect(() => {
    setSocket(getSocket());
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
