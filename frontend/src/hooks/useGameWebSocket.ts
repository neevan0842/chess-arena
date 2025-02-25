import useAuthStore from "@/store/useAuthStore";
import useGameStore from "@/store/useGameStore";
import { useEffect, useState } from "react";

export const useGameWebSocket = () => {
  const { gameId, updateGame } = useGameStore();
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (gameId) {
      const accessToken = useAuthStore.getState().accessToken;
      if (!accessToken) {
        console.error("ws:No access token found");
        return;
      }

      const wsUrl = `${import.meta.env.VITE_WS_URL}/api/v1/ws/game/${gameId}`;
      const socket = new WebSocket(wsUrl, accessToken);
      setWs(socket);

      socket.onopen = () => {
        console.log("WebSocket connected:", wsUrl);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "move" || data.type === "resign") {
            updateGame(data.fen, data.status, data.winner);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = (event) => {
        console.log("WebSocket closed:", event);
        setWs(null);
      };

      return () => {
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
      };
    }
  }, [gameId, updateGame]);

  return ws;
};
