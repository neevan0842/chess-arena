export enum GameStatus {
  WAITING = "waiting",
  ONGOING = "ongoing",
  FINISHED = "finished",
}

export enum Winner {
  WHITE = "white",
  BLACK = "black",
  DRAW = "draw",
}

export enum Player {
  WHITE = "white",
  BLACK = "black",
}

export enum WebSocketMessageType {
  RESIGN = "resign",
  MOVE = "move",
}
