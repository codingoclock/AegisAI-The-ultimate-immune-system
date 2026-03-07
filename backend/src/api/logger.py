import asyncio
import collections
import dataclasses
import datetime
import json
from typing import Any, Dict, List


@dataclasses.dataclass
class LogRecord:
    timestamp: str
    level: str
    service: str
    message: str
    meta: Dict[str, Any]

    def to_dict(self):
        return {
            "timestamp": self.timestamp,
            "level": self.level,
            "service": self.service,
            "message": self.message,
            "meta": self.meta,
        }


class LogManager:
    def __init__(self, maxlen: int = 500):
        self.buffer = collections.deque(maxlen=maxlen)
        self.lock = asyncio.Lock()
        # map websocket -> asyncio.Queue for per-client delivery
        self.clients = {}

    async def add(self, level: str, service: str, message: str, meta: Dict[str, Any] = None):
        meta = meta or {}
        ts = datetime.datetime.utcnow().isoformat() + "Z"
        rec = LogRecord(timestamp=ts, level=level.upper(), service=service, message=message, meta=meta)

        # formatted output to stdout for Docker logs
        formatted = f"{rec.timestamp} | {rec.level} | {rec.service} | {rec.message}"
        if meta:
            try:
                formatted += " | " + json.dumps(meta, default=str)
            except Exception:
                formatted += " | <meta>"

        print(formatted, flush=True)

        async with self.lock:
            self.buffer.append(rec)
            # broadcast to clients' queues
            for q in list(self.clients.values()):
                try:
                    q.put_nowait(rec.to_dict())
                except asyncio.QueueFull:
                    # drop if client's queue is full
                    pass

    async def get_recent(self) -> List[Dict[str, Any]]:
        async with self.lock:
            return [r.to_dict() for r in list(self.buffer)]

    async def register(self, websocket_id: str):
        # create queue for this client
        q = asyncio.Queue(maxsize=1000)
        async with self.lock:
            self.clients[websocket_id] = q
        return q

    async def unregister(self, websocket_id: str):
        async with self.lock:
            if websocket_id in self.clients:
                del self.clients[websocket_id]


# singleton manager
manager = LogManager(maxlen=500)


def sync_log(level: str, service: str, message: str, meta: Dict[str, Any] = None):
    """
    Sync-friendly helper that schedules the async add() on the running loop.
    Use this when logging from non-async contexts.
    """
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.add(level, service, message, meta))
    except RuntimeError:
        # no running loop; fallback to printing
        ts = datetime.datetime.utcnow().isoformat() + "Z"
        print(f"{ts} | {level.upper()} | {service} | {message} | {meta}")


async def log_info(service: str, message: str, meta: Dict[str, Any] = None):
    await manager.add("INFO", service, message, meta)


async def log_warning(service: str, message: str, meta: Dict[str, Any] = None):
    await manager.add("WARNING", service, message, meta)


async def log_error(service: str, message: str, meta: Dict[str, Any] = None):
    await manager.add("ERROR", service, message, meta)
