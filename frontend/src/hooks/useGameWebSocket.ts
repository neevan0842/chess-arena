import useAuthStore from "@/store/useAuthStore";
import useGameStore from "@/store/useGameStore";
import useResultStore from "@/store/useResultStore";
import { useEffect, useState } from "react";
import { GameStatus, WebSocketMessageType } from "../utils/constants";

export const useGameWebSocket = () => {
  const { gameId, updateGame } = useGameStore();
  const { setShowModel, setWinner } = useResultStore();
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
          if (data.type === WebSocketMessageType.MOVE) {
            updateGame(data.fen, data.status);
            if (data.status === GameStatus.FINISHED) {
              setTimeout(() => {
                setShowModel(true);
                setWinner(data.winner);
              }, 1000);
            }
          } else if (data.type === WebSocketMessageType.RESIGN) {
            setShowModel(true);
            setWinner(data.winner);
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
