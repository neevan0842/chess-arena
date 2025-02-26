from fastapi import APIRouter, Depends, status
from redis.asyncio import Redis
from sqlalchemy.orm import Session
from app.schemas.game import GameResponse, JoinRequest, MoveRequest, MoveResponse
from app.dependencies import get_db, get_redis_client
from app.models.user import User
from app.services.auth import get_current_active_user
from app.models.game import Game
from app.core.constants import GameType
from app.services.game import (
    join_existing_game_multiplayer,
    publish_move,
    publish_resign,
    resign_game_multiplayer,
    validate_and_update_move_multiplayer,
)


router = APIRouter(prefix="/game", tags=["game"])


@router.post(
    "/create", response_model=GameResponse, status_code=status.HTTP_201_CREATED
)
async def create_game(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    game = Game(player_white_id=current_user.id, game_type=GameType.MULTIPLAYER)
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
    game: Game = join_existing_game_multiplayer(
        game_id=payload.game_id, db=db, player_id=current_user.id
    )
    return game


@router.post("/move")
async def make_move(
    payload: MoveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    redis_client: Redis = Depends(get_redis_client),
):
    game, next_turn = validate_and_update_move_multiplayer(
        payload.game_id, payload.move, current_user.id, db
    )
    await publish_move(game=game, next_turn=next_turn, redis_client=redis_client)
    return MoveResponse(fen=game.fen, status=game.status, winner=game.winner)


@router.post("/resign")
async def resign_game(
    payload: JoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    redis_client: Redis = Depends(get_redis_client),
):
    game: Game = resign_game_multiplayer(
        game_id=payload.game_id, db=db, player_id=current_user.id
    )

    await publish_resign(game, redis_client)

    return MoveResponse(fen=game.fen, status=game.status, winner=game.winner)
