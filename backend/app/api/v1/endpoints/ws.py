import asyncio
import json
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from redis.asyncio import Redis
from app.dependencies import get_redis_client
from app.services.auth import verify_logged_in_user_ws

router = APIRouter(prefix="/ws", tags=["ws"])


@router.websocket("/game/{game_id}")
async def game_ws(
    websocket: WebSocket,
    game_id: int,
    redis_client: Redis = Depends(get_redis_client),
    access_token: str = Depends(verify_logged_in_user_ws),
):
    # Accept the connection and echo the token as the subprotocol.
    await websocket.accept(subprotocol=access_token)
    pubsub = redis_client.pubsub()
    channel = f"game_{game_id}"
    await pubsub.subscribe(channel)

    try:
        while True:
            try:
                message = await pubsub.get_message(
                    ignore_subscribe_messages=True, timeout=1.0
                )
            except asyncio.CancelledError:
                break

            if message:
                try:
                    data = json.loads(message["data"])
                    await websocket.send_json(data)
                except json.JSONDecodeError:
                    continue  # skip bad JSON messages
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        await pubsub.unsubscribe(channel)
    finally:
        await pubsub.close()
        try:
            await websocket.close()
        except RuntimeError:
            # Connection already closed, ignore.
            pass
