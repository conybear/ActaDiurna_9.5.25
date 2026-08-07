from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import cloudinary
import cloudinary.uploader
import resend
from fastapi import UploadFile, File

import crud

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
# bcrypt fix: pin to bcrypt backend explicitly to suppress passlib deprecation warning
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"

# Cloudinary config (optional - will work without it)
if os.environ.get('CLOUDINARY_CLOUD_NAME'):
    cloudinary.config(
        cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
        api_key=os.environ.get('CLOUDINARY_API_KEY'),
        api_secret=os.environ.get('CLOUDINARY_API_SECRET')
    )

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create the main app
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — must be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Story(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    title: str
    content: str
    photos: List[str] = []
    is_draft: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None  # ← added

class StoryCreate(BaseModel):
    title: str
    content: str
    photos: List[str] = []
    is_draft: bool = False

class FriendRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    from_username: str
    to_user_id: str
    to_username: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FriendRequestCreate(BaseModel):
    to_email: str

class FriendRequestAction(BaseModel):
    request_id: str
    action: str  # accept or reject

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await crud.get_user_by_id(db, user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def send_email(to_email: str, subject: str, content: str):
    resend_key = os.environ.get('RESEND_API_KEY')
    if not resend_key:
        logging.warning("Resend API key not configured - email not sent")
        return False
    try:
        resend.api_key = resend_key
        params = {
            "from": "Acta Diurna <noreply@conybear.com>",
            "to": [to_email],
            "subject": subject,
            "html": content,
        }
        response = resend.Emails.send(params)
        logging.info(f"Email sent successfully to {to_email}: {response}")
        return True
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {e}")
        return False

# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------

@api_router.post("/auth/register", response_model=Token)
@limiter.limit("5/minute")  # ← rate limiting: max 5 registrations per minute per IP
async def register(request: Request, user_data: UserCreate):
    existing = await crud.get_user_by_email(db, user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_obj = User(email=user_data.email, username=user_data.username)
    user_dict = user_obj.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()

    await crud.create_user(db, user_dict)
    token = create_access_token({"sub": user_obj.id})
    return Token(access_token=token, token_type="bearer", user=user_obj)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await crud.get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_obj = User(
        id=user['id'],
        email=user['email'],
        username=user['username'],
        created_at=datetime.fromisoformat(user['created_at'])
        if isinstance(user['created_at'], str)
        else user['created_at'],
    )
    token = create_access_token({"sub": user_obj.id})
    return Token(access_token=token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# ---------------------------------------------------------------------------
# Story routes
# ---------------------------------------------------------------------------

@api_router.post("/stories", response_model=Story)
async def create_story(
    story_data: StoryCreate, current_user: dict = Depends(get_current_user)
):
    story_obj = Story(
        user_id=current_user['id'],
        username=current_user['username'],
        title=story_data.title,
        content=story_data.content,
        photos=story_data.photos,
        is_draft=story_data.is_draft,
    )
    story_dict = story_obj.model_dump()
    story_dict['created_at'] = story_dict['created_at'].isoformat()
    await crud.create_story(db, story_dict)
    return story_obj

@api_router.get("/stories", response_model=List[Story])
async def get_stories(current_user: dict = Depends(get_current_user)):
    friendships = await crud.get_accepted_friendships(db, current_user['id'])
    friend_ids = []
    for f in friendships:
        if f['from_user_id'] == current_user['id']:
            friend_ids.append(f['to_user_id'])
        else:
            friend_ids.append(f['from_user_id'])
    return await crud.get_feed_stories(db, friend_ids)

@api_router.get("/stories/my", response_model=List[Story])
async def get_my_stories(current_user: dict = Depends(get_current_user)):
    return await crud.get_stories_by_user(db, current_user['id'])

@api_router.put("/stories/{story_id}", response_model=Story)
async def update_story(
    story_id: str,
    story_data: StoryCreate,
    current_user: dict = Depends(get_current_user),
):
    story = await crud.get_story_by_id_and_user(db, story_id, current_user['id'])
    if not story:
        raise HTTPException(status_code=404, detail="Story not found or unauthorized")

    update_data = {
        "title": story_data.title,
        "content": story_data.content,
        "photos": story_data.photos,
        "is_draft": story_data.is_draft,
    }
    updated = await crud.update_story(db, story_id, update_data)
    return Story(**updated)

@api_router.delete("/stories/{story_id}")
async def delete_story(
    story_id: str, current_user: dict = Depends(get_current_user)
):
    story = await crud.get_story_by_id_and_user(db, story_id, current_user['id'])
    if not story:
        raise HTTPException(status_code=404, detail="Story not found or unauthorized")
    await crud.delete_story(db, story_id)
    return {"message": "Story deleted"}

# ---------------------------------------------------------------------------
# Image upload
# ---------------------------------------------------------------------------

@api_router.post("/upload")
async def upload_image(
    file: UploadFile = File(...), current_user: dict = Depends(get_current_user)
):
    if not os.environ.get('CLOUDINARY_CLOUD_NAME'):
        raise HTTPException(
            status_code=400,
            detail="Cloudinary not configured. Please add credentials to .env",
        )
    try:
        result = cloudinary.uploader.upload(file.file)
        return {"url": result['secure_url']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# ---------------------------------------------------------------------------
# Friend routes
# ---------------------------------------------------------------------------

@api_router.post("/friends/request")
async def send_friend_request(
    request_data: FriendRequestCreate, current_user: dict = Depends(get_current_user)
):
    to_user = await crud.get_user_by_email(db, request_data.to_email)
    if not to_user:
        app_url = os.environ.get('APP_URL', 'https://conybear.com')
        email_sent = await send_email(
            request_data.to_email,
            f"{current_user['username']} invited you to join Acta Diurna",
            f"""
            <h2>You've been invited to Acta Diurna!</h2>
            <p>{current_user['username']} wants to connect with you on Acta Diurna,
            a story-sharing platform.</p>
            <p><a href="{app_url}" style="background-color:#b45309;color:white;
            padding:12px 24px;text-decoration:none;border-radius:8px;
            display:inline-block;">Sign up here</a></p>
            """,
        )
        detail = (
            f"User with email '{request_data.to_email}' hasn't joined yet. "
            + ("An invitation email has been sent!" if email_sent
               else "Email invitations are currently unavailable.")
        )
        raise HTTPException(status_code=404, detail=detail)

    if to_user['id'] == current_user['id']:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")

    existing = await crud.get_existing_friend_request(db, current_user['id'], to_user['id'])
    if existing:
        raise HTTPException(status_code=400, detail="Friend request already exists")

    friend_request = FriendRequest(
        from_user_id=current_user['id'],
        from_username=current_user['username'],
        to_user_id=to_user['id'],
        to_username=to_user['username'],
    )
    request_dict = friend_request.model_dump()
    request_dict['created_at'] = request_dict['created_at'].isoformat()
    await crud.create_friend_request(db, request_dict)

    await send_email(
        to_user['email'],
        f"{current_user['username']} sent you a friend request",
        f"<p>{current_user['username']} wants to connect with you on Acta Diurna!</p>",
    )
    return {"message": "Friend request sent"}

@api_router.get("/friends/requests")
async def get_friend_requests(current_user: dict = Depends(get_current_user)):
    return await crud.get_pending_requests_for_user(db, current_user['id'])

@api_router.post("/friends/action")
async def handle_friend_request(
    action_data: FriendRequestAction, current_user: dict = Depends(get_current_user)
):
    friend_request = await crud.get_friend_request_by_id(db, action_data.request_id)
    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")
    if friend_request['to_user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_status = "accepted" if action_data.action == "accept" else "rejected"
    await crud.update_friend_request_status(db, action_data.request_id, new_status)
    return {"message": f"Friend request {new_status}"}

@api_router.get("/friends")
async def get_friends(current_user: dict = Depends(get_current_user)):
    friendships = await crud.get_accepted_friendships(db, current_user['id'])
    friends = []
    for f in friendships:
        if f['from_user_id'] == current_user['id']:
            friends.append({"id": f['to_user_id'], "username": f['to_username'], "status": "active"})
        else:
            friends.append({"id": f['from_user_id'], "username": f['from_username'], "status": "active"})
    return friends

# ---------------------------------------------------------------------------
# User search
# ---------------------------------------------------------------------------

@api_router.get("/users/search")
async def search_users(query: str, current_user: dict = Depends(get_current_user)):
    return await crud.search_users(db, query, current_user['id'])

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app.include_router(api_router)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
