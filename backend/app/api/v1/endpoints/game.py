from fastapi import APIRouter, Depends, HTTPException, status
from redis.asyncio import Redis
from sqlalchemy.orm import Session
from app.schemas.game import GameResponse, JoinRequest, MoveRequest, MoveResponse
from app.dependencies import get_db, get_redis_client
from app.models.user import User
from app.services.auth import get_current_active_user
from app.models.game import Game
from app.core.constants import GameStatus, Winner
from app.services.game import publish_move, publish_resign, validate_and_update_move


router = APIRouter(prefix="/game", tags=["game"])


@router.post(
    "/create", response_model=GameResponse, status_code=status.HTTP_201_CREATED
)
async def create_game(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    game = Game(player_white_id=current_user.id)
    db.add(game)
    db.commit()
    db.refresh(game)
    return game


@router.post("/join", response_model=GameResponse)
async def join_game(
    payload: JoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    game_id = payload.game_id
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    if game.player_white_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already in the game",
        )
    if game.player_black_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Game is full"
        )
    game.player_black_id = current_user.id
    game.status = GameStatus.ONGOING
    db.commit()
    db.refresh(game)
    return game


@router.post("/move")
async def make_move(
    payload: MoveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    redis_client: Redis = Depends(get_redis_client),
):
    game: Game = validate_and_update_move(
        payload.game_id, payload.move, current_user.id, db
    )
    await publish_move(game, redis_client)
    return MoveResponse(fen=game.fen, status=game.status, winner=game.winner)


@router.post("/resign")
async def resign_game(
    payload: JoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    redis_client: Redis = Depends(get_redis_client),
):
    game_id = payload.game_id
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
    if game.player_white_id == current_user.id:
        game.winner = Winner.BLACK
    elif game.player_black_id == current_user.id:
        game.winner = Winner.WHITE
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You are not in the game"
        )
    game.status = GameStatus.FINISHED
    db.commit()
    db.refresh(game)

    await publish_resign(game, redis_client)

    return MoveResponse(fen=game.fen, status=game.status, winner=game.winner)
