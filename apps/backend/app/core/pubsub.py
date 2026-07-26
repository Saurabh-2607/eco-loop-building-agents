import asyncio
import json
import redis.asyncio as aioredis
from loguru import logger
from collections import defaultdict
from typing import AsyncGenerator, Dict, List, Any

from app.core.config import settings

class PubSubBroker:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(PubSubBroker, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.redis_client = None
        self.use_redis = False
        self._init_task = None
        
        # Local in-memory pub-sub fallback lists of asyncio.Queue
        self._subscribers: Dict[str, List[asyncio.Queue]] = defaultdict(list)

    async def ensure_initialized(self):
        if self._init_task is None:
            self._init_task = asyncio.create_task(self._init_redis())
            await asyncio.sleep(0)  # Yield control to let task begin executing

    async def _init_redis(self):
        try:
            logger.info(f"Connecting to Redis for Pub/Sub: {settings.REDIS_URL}")
            self.redis_client = aioredis.from_url(settings.REDIS_URL, socket_timeout=2.0)
            await self.redis_client.ping()
            self.use_redis = True
            logger.info("Successfully connected to Redis. Redis Pub/Sub activated.")
        except Exception as e:
            self.use_redis = False
            logger.warning(f"Redis not available ({e}). Falling back to local in-memory async Pub/Sub.")

    async def publish(self, channel: str, message: Any):
        """
        Publish a message to a channel.
        """
        await self.ensure_initialized()
        message_str = json.dumps(message) if isinstance(message, (dict, list)) else str(message)
        
        if self.use_redis and self.redis_client:
            try:
                await self.redis_client.publish(channel, message_str)
                return
            except Exception as e:
                logger.warning(f"Failed publishing to Redis, falling back to local memory: {e}")

        # In-memory fallback
        if channel in self._subscribers:
            queues = self._subscribers[channel]
            dead_queues = []
            for q in list(queues):
                try:
                    q.put_nowait(message_str)
                except asyncio.QueueFull:
                    # Clear oldest message to prevent blocking
                    try:
                        q.get_nowait()
                    except asyncio.QueueEmpty:
                        pass
                    q.put_nowait(message_str)
                except Exception:
                    dead_queues.append(q)
            
            for dq in dead_queues:
                if dq in self._subscribers[channel]:
                    self._subscribers[channel].remove(dq)

    async def subscribe(self, channel: str) -> AsyncGenerator[str, None]:
        """
        Subscribe to a channel and yield messages as they arrive.
        """
        await self.ensure_initialized()
        if self.use_redis and self.redis_client:
            pubsub = self.redis_client.pubsub()
            try:
                await pubsub.subscribe(channel)
                logger.info(f"Subscribed to Redis channel: {channel}")
                try:
                    while True:
                        message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                        if message and message["type"] == "message":
                            data = message["data"]
                            if isinstance(data, bytes):
                                data = data.decode("utf-8")
                            yield data
                        await asyncio.sleep(0.01)
                finally:
                    await pubsub.unsubscribe(channel)
                    await pubsub.close()
                return
            except Exception as e:
                logger.warning(f"Redis subscribe failed ({e}), switching to local memory.")

        # In-memory subscription
        q = asyncio.Queue(maxsize=100)
        self._subscribers[channel].append(q)
        logger.info(f"Subscribed to local in-memory channel: {channel}")
        try:
            while True:
                msg = await q.get()
                yield msg
        finally:
            if q in self._subscribers[channel]:
                self._subscribers[channel].remove(q)

pubsub_broker = PubSubBroker()
