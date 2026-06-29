import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

export function useSocket(onNewSubmission, onTimerUpdated) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket connected"));
    socket.on("new-submission", (data) => { if (onNewSubmission) onNewSubmission(data); });
    socket.on("timer-updated", (data) => { if (onTimerUpdated) onTimerUpdated(data); });

    return () => { socket.disconnect(); };
  }, []);

  return socketRef.current;
}
