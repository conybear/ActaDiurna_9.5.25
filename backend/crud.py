"""
crud.py — Database query functions for Acta Diurna.
All MongoDB operations live here; server.py imports and calls these.
"""

from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[dict]:
    return await db.users.find_one({"email": email})


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> Optional[dict]:
    return await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})


async def create_user(db: AsyncIOMotorDatabase, user_dict: dict) -> None:
    await db.users.insert_one(user_dict)


async def search_users(db: AsyncIOMotorDatabase, query: str, exclude_user_id: str) -> list:
    users = await db.users.find(
        {
            "$or": [
                {"username": {"$regex": query, "$options": "i"}},
                {"email": {"$regex": query, "$options": "i"}},
            ],
            "id": {"$ne": exclude_user_id},
        },
        {"_id": 0, "password": 0},
    ).limit(10).to_list(10)
    return users


# ---------------------------------------------------------------------------
# Stories
# ---------------------------------------------------------------------------

async def create_story(db: AsyncIOMotorDatabase, story_dict: dict) -> None:
    await db.stories.insert_one(story_dict)


async def get_stories_by_user(db: AsyncIOMotorDatabase, user_id: str) -> list:
    stories = await db.stories.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return _parse_story_dates(stories)


async def get_feed_stories(db: AsyncIOMotorDatabase, friend_ids: list) -> list:
    stories = await db.stories.find(
        {
            "user_id": {"$in": friend_ids},
            "is_draft": {"$ne": True},
        },
        {"_id": 0},
    ).sort("created_at", -1).to_list(1000)
    return _parse_story_dates(stories)


async def get_story_by_id(db: AsyncIOMotorDatabase, story_id: str) -> Optional[dict]:
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    if story:
        story = _parse_story_dates([story])[0]
    return story


async def get_story_by_id_and_user(
    db: AsyncIOMotorDatabase, story_id: str, user_id: str
) -> Optional[dict]:
    story = await db.stories.find_one({"id": story_id, "user_id": user_id})
    return story


async def update_story(
    db: AsyncIOMotorDatabase, story_id: str, update_data: dict
) -> Optional[dict]:
    # Always stamp updated_at
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.stories.update_one({"id": story_id}, {"$set": update_data})
    return await get_story_by_id(db, story_id)


async def delete_story(db: AsyncIOMotorDatabase, story_id: str) -> None:
    await db.stories.delete_one({"id": story_id})


# ---------------------------------------------------------------------------
# Friend requests
# ---------------------------------------------------------------------------

async def create_friend_request(db: AsyncIOMotorDatabase, request_dict: dict) -> None:
    await db.friend_requests.insert_one(request_dict)


async def get_existing_friend_request(
    db: AsyncIOMotorDatabase, user_id_a: str, user_id_b: str
) -> Optional[dict]:
    return await db.friend_requests.find_one(
        {
            "$or": [
                {"from_user_id": user_id_a, "to_user_id": user_id_b},
                {"from_user_id": user_id_b, "to_user_id": user_id_a},
            ]
        }
    )


async def get_pending_requests_for_user(
    db: AsyncIOMotorDatabase, user_id: str
) -> list:
    requests = await db.friend_requests.find(
        {"to_user_id": user_id, "status": "pending"}, {"_id": 0}
    ).to_list(1000)
    for req in requests:
        if isinstance(req.get("created_at"), str):
            req["created_at"] = datetime.fromisoformat(req["created_at"])
    return requests


async def get_friend_request_by_id(
    db: AsyncIOMotorDatabase, request_id: str
) -> Optional[dict]:
    return await db.friend_requests.find_one({"id": request_id})


async def update_friend_request_status(
    db: AsyncIOMotorDatabase, request_id: str, status: str
) -> None:
    await db.friend_requests.update_one(
        {"id": request_id}, {"$set": {"status": status}}
    )


async def get_accepted_friendships(
    db: AsyncIOMotorDatabase, user_id: str
) -> list:
    return await db.friend_requests.find(
        {
            "$or": [
                {"from_user_id": user_id, "status": "accepted"},
                {"to_user_id": user_id, "status": "accepted"},
            ]
        },
        {"_id": 0},
    ).to_list(1000)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_story_dates(stories: list) -> list:
    for story in stories:
        if isinstance(story.get("created_at"), str):
            story["created_at"] = datetime.fromisoformat(story["created_at"])
        if isinstance(story.get("updated_at"), str):
            story["updated_at"] = datetime.fromisoformat(story["updated_at"])
    return stories
