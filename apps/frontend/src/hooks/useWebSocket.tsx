import { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  messagesAtom,
  selectedWhiteboardIdAtom,
  sessionIdAtom,
  webSocketAtom,
} from "../atoms";

export function useWebSocket() {
  const sessionId = useAtomValue(sessionIdAtom);
  const selectedWhiteboardId = useAtomValue(selectedWhiteboardIdAtom);
  const setMessages = useSetAtom(messagesAtom);
  const [webSocket, setWebSocket] = useAtom(webSocketAtom);

  useEffect(() => {
    if (!sessionId || !selectedWhiteboardId) return;

    const url = new URL("/web_socket", import.meta.env.VITE_BACKEND_BASE_URL);
    url.protocol = "ws:";
    url.searchParams.set("whiteboard_id", selectedWhiteboardId);
    const socket = new WebSocket(url);

    socket.onopen = () => console.log("WebSocket connected");
    socket.onmessage = (event) => setMessages((prev) => [...prev, event.data]);
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = () => console.log("WebSocket closed");

    setWebSocket(socket);

    return () => {
      socket.close();
      setWebSocket(null);
    };
  }, [sessionId]);

  return { sendMessage: (message: string) => webSocket?.send(message) };
}
