from fastapi import HTTPException, status
from redis.asyncio import Redis
from sqlalchemy.orm import Session
from app.models.game import Game
from app.core.constants import GameStatus, Winner
import chess
import json


def join_existing_game_multiplayer(game_id: int, db: Session, player_id: str):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    if game.status == GameStatus.ONGOING and player_id in (
        game.player_white_id,
        game.player_black_id,
    ):
        return game
    if game.player_white_id == player_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already in the game",
        )
    if game.player_black_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Game is full"
        )
    game.player_black_id = player_id
    game.status = GameStatus.ONGOING
    db.commit()
    db.refresh(game)
    return game


# Validate and update the move in a multiplayer game and return the updated game and next turn
def validate_and_update_move_multiplayer(
    game_id: int, move: str, player_id: str, db: Session
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )

    # Ensure the game is ongoing.
    if game.status != GameStatus.ONGOING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Game is not ongoing"
        )

    # Ensure current_user is one of the game participants.
    if player_id not in (game.player_white_id, game.player_black_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You are not in the game"
        )

    # Initialize the board from the current FEN.
    board = chess.Board() if game.fen == "startpos" else chess.Board(game.fen)

    # Check if it is the current player's turn.
    if player_id == game.player_white_id and board.turn != chess.WHITE:
        raise HTTPException(status_code=400, detail="It is not your turn (White)")
    if player_id == game.player_black_id and board.turn != chess.BLACK:
        raise HTTPException(status_code=400, detail="It is not your turn (Black)")

    # Try to parse the move. This will raise an exception if the move is invalid.
    try:
        player_move = board.parse_san(move)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid move format")

    # Verify that the piece being moved belongs to the current player.
    piece = board.piece_at(player_move.from_square)
    if piece is None:
        raise HTTPException(status_code=400, detail="No piece at the source square")
    if player_id == game.player_white_id and piece.color != chess.WHITE:
        raise HTTPException(
            status_code=400, detail="You can only move your own pieces (White)"
        )
    if player_id == game.player_black_id and piece.color != chess.BLACK:
        raise HTTPException(
            status_code=400, detail="You can only move your own pieces (Black)"
        )

    # Push the move onto the board.
    board.push(player_move)
    game.fen = board.fen()

    # Update game status if checkmate, draw, or stalemate is reached.
    if board.is_checkmate():
        game.status = GameStatus.FINISHED  # Game over by checkmate
        game.winner = Winner.WHITE if board.turn == chess.BLACK else Winner.BLACK
    elif (
        board.is_stalemate()
        or board.is_insufficient_material()
        or board.can_claim_fifty_moves()
    ):
        game.status = (
            GameStatus.FINISHED
        )  # Game drawn by stalemate, insufficient material, or fifty-move rule
        game.winner = Winner.DRAW

    db.commit()
    db.refresh(game)

    return game, board.turn


def resign_game_multiplayer(game_id: int, db: Session, player_id: str):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    if game.status != GameStatus.ONGOING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Game is not ongoing"
        )

    # Determine winner
    if game.player_white_id == player_id:
        game.winner = Winner.BLACK
    elif game.player_black_id == player_id:
        game.winner = Winner.WHITE
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You are not in the game"
        )
    game.status = GameStatus.FINISHED
    db.commit()
    db.refresh(game)
    return game


async def publish_move(game: Game, next_turn: str, redis_client: Redis):
    payload = {
        "type": "move",
        "game_id": game.id,
        "fen": game.fen,
        "status": game.status,
        "winner": game.winner,
        "next_turn": next_turn,
    }
    try:
        await redis_client.publish(f"game_{game.id}", json.dumps(payload))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to publish move")


async def publish_resign(game: Game, redis_client: Redis):
    payload = {
        "type": "resign",
        "game_id": game.id,
        "fen": game.fen,
        "status": game.status,
        "winner": game.winner,
    }
    try:
        await redis_client.publish(f"game_{game.id}", json.dumps(payload))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to publish move")
