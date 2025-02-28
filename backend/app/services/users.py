from typing import List
from sqlalchemy.sql import case
from sqlalchemy.future import select
from app.models.game import Game
from app.core.constants import GameType, Winner
from app.schemas.users import RecentGameResponse, UserStatsResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


async def get_player_stats(user_id: str, db: AsyncSession) -> List[UserStatsResponse]:
    result = await db.execute(
        select(Game).where(
            (Game.player_white_id == user_id) | (Game.player_black_id == user_id)
        )
    )
    games = result.scalars().all()
    if not games:
        return UserStatsResponse(
            total_games=0,
            wins=0,
            losses=0,
            win_rate="0%",
            most_played_color=None,
            best_streak=0,
            ai_games=0,
            ai_wins=0,
            ai_losses=0,
            ai_win_rate="0%",
        )

    total_games = len(games)

    # Multiplayer games (human vs human)
    multiplayer_games = [
        game for game in games if game.game_type == GameType.MULTIPLAYER
    ]
    total_multiplayer_games = len(multiplayer_games)
    multiplayer_wins = sum(
        1
        for game in multiplayer_games
        if (game.winner == Winner.WHITE and game.player_white_id == user_id)
        or (game.winner == Winner.BLACK and game.player_black_id == user_id)
    )
    multiplayer_losses = sum(
        1
        for game in multiplayer_games
        if game.winner in [Winner.WHITE, Winner.BLACK]
        and game.winner != Winner.ONGOING
        and (
            (game.winner == Winner.WHITE and game.player_black_id == user_id)
            or (game.winner == Winner.BLACK and game.player_white_id == user_id)
        )
    )
    multiplayer_win_rate = (
        f"{(multiplayer_wins / total_multiplayer_games * 100):.2f}%"
        if total_multiplayer_games
        else "0%"
    )

    # AI games (human vs bot)
    ai_games = [game for game in games if game.game_type == GameType.AI]
    total_ai_games = len(ai_games)
    ai_wins = sum(
        1
        for game in ai_games
        if (game.winner == Winner.WHITE and game.player_white_id == user_id)
        or (game.winner == Winner.BLACK and game.player_black_id == user_id)
    )
    ai_losses = (
        total_ai_games - ai_wins
    )  # Since AI games are always 1vAI, losses = total - wins
    ai_win_rate = f"{(ai_wins / total_ai_games * 100):.2f}%" if total_ai_games else "0%"

    # Determine most played color (across all games)
    white_games = sum(1 for game in games if game.player_white_id == user_id)
    black_games = total_games - white_games
    most_played_color = "White" if white_games > black_games else "Black"

    # Calculate the best winning streak (multiplayer + AI)
    best_streak = 0
    current_streak = 0
    for game in sorted(games, key=lambda g: g.created_at):  # Sort games chronologically
        if (game.winner == Winner.WHITE and game.player_white_id == user_id) or (
            game.winner == Winner.BLACK and game.player_black_id == user_id
        ):
            current_streak += 1
            best_streak = max(best_streak, current_streak)
        else:
            current_streak = 0  # Reset streak on a loss or draw
    return UserStatsResponse(
        total_games=total_games,
        wins=multiplayer_wins,
        losses=multiplayer_losses,
        win_rate=multiplayer_win_rate,
        most_played_color=most_played_color,
        best_streak=best_streak,
        ai_games=total_ai_games,
        ai_wins=ai_wins,
        ai_losses=ai_losses,
        ai_win_rate=ai_win_rate,
    )


async def get_recent_games_details(
    user_id: str, db: AsyncSession
) -> List[RecentGameResponse]:
    opponent_alias = case(
        (Game.player_white_id == user_id, Game.player_black_id),
        else_=Game.player_white_id,
    )
    result = await db.execute(
        select(Game, User.username)
        .outerjoin(
            User,
            (User.id == opponent_alias),
        )
        .where((Game.player_white_id == user_id) | (Game.player_black_id == user_id))
        .order_by(Game.created_at.desc())
        .limit(5)
    )

    games = result.all()

    return [
        RecentGameResponse(
            opponent=(
                "AI"
                if game.game_type == GameType.AI
                else (opponent_username or "Unknown")
            ),
            result=(
                "win"
                if (
                    (game.winner == Winner.WHITE and game.player_white_id == user_id)
                    or (game.winner == Winner.BLACK and game.player_black_id == user_id)
                )
                else (
                    "loss"
                    if (
                        game.winner in [Winner.WHITE, Winner.BLACK]
                        and (
                            (
                                game.winner == Winner.WHITE
                                and game.player_black_id == user_id
                            )
                            or (
                                game.winner == Winner.BLACK
                                and game.player_white_id == user_id
                            )
                        )
                    )
                    else "draw"
                )
            ),
            game_type=game.game_type,
            date=game.created_at,
        )
        for game, opponent_username in games
    ]
