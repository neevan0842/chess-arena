from fastapi import APIRouter, Depends, Request, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.game import (
    GameAIRequest,
    GameAIResponse,
    GameResponse,
    JoinRequest,
    MoveRequest,
    MoveResponse,
)
from app.dependencies import get_db, get_redis_client
from app.models.user import User
from app.services.auth import get_current_active_user
from app.models.game import Game
from app.core.constants import GameStatus, GameType, RedisPublishType
from app.services.game import (
    join_existing_game_multiplayer,
    publish_redis,
    resign_ai_game,
    resign_game_multiplayer,
    validate_and_update_move_ai,
    validate_and_update_move_multiplayer,
)


router = APIRouter(prefix="/game", tags=["game"])


@router.post(
    "/create", response_model=GameResponse, status_code=status.HTTP_201_CREATED
)
async def create_game(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    game = Game(player_white_id=current_user.id, game_type=GameType.MULTIPLAYER)
    db.add(game)
    await db.commit()
    await db.refresh(game)
    return game


@router.post("/join", response_model=GameResponse)
async def join_game(
    payload: JoinRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    redis_client: Redis = Depends(get_redis_client),
):
    game: Game = await join_existing_game_multiplayer(
        game_id=payload.game_id, db=db, player_id=current_user.id
    )
    await publish_redis(
        game=game, type=RedisPublishType.JOIN, redis_client=redis_client
    )
    return game


@router.post("/move")
async def make_move(
    payload: MoveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    redis_client: Redis = Depends(get_redis_client),
):
    game = await validate_and_update_move_multiplayer(
        payload.game_id, payload.move, current_user.id, db
    )
    await publish_redis(
        game=game, type=RedisPublishType.MOVE, redis_client=redis_client
    )
    return MoveResponse(fen=game.fen, status=game.status, winner=game.winner)


@router.post("/resign")
async def resign_game(
    payload: JoinRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    redis_client: Redis = Depends(get_redis_client),
):
    game: Game = await resign_game_multiplayer(
        game_id=payload.game_id, db=db, player_id=current_user.id
    )

    await publish_redis(
        game=game, type=RedisPublishType.RESIGN, redis_client=redis_client
    )
    return MoveResponse(fen=game.fen, status=game.status, winner=game.winner)


@router.post(
    "/ai/create", response_model=GameAIResponse, status_code=status.HTTP_201_CREATED
)
async def create_game_ai(
    payload: GameAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ai_difficulty = payload.ai_difficulty
    game = Game(
        player_white_id=current_user.id,
        game_type=GameType.AI,
        ai_difficulty=ai_difficulty,
        status=GameStatus.ONGOING,
    )
    db.add(game)
    await db.commit()
    await db.refresh(game)
    return game


@router.post("/ai/move")
async def make_move_ai(
    payload: MoveRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    game = await validate_and_update_move_ai(
        game_id=payload.game_id,
        move=payload.move,
        player_id=current_user.id,
        db=db,
        request=request,
    )
    return MoveResponse(fen=game.fen, status=game.status, winner=game.winner)


@router.post("/ai/resign")
async def resign_game_ai(
    payload: JoinRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    game = await resign_ai_game(
        game_id=payload.game_id, db=db, player_id=current_user.id
    )
    return MoveResponse(fen=game.fen, status=game.status, winner=game.winner)
