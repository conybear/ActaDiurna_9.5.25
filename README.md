# Acta Diurna

A full-stack story-sharing platform where friends write, publish, and read each other's stories in a digital flipbook format. Named after the ancient Roman daily gazette — the world's first newspaper.

## Features

**Story Writing & Publishing**
- Rich text editor (WYSIWYG) with bold, italic, underline, and list formatting
- Photo uploads attached to stories via Cloudinary
- Save drafts and publish when ready
- Edit and delete your own stories

**Friends & Social**
- Send friend requests by email
- Accept or reject incoming requests
- Invite non-users via email — they receive a branded invitation from `noreply@conybear.com`
- View a feed of your friends' published stories

**Flipbook Reader**
- Browse friends' stories in a page-by-page flipbook UI
- Separate "My Flipbook" to review your own published work
- Full image display (uncropped) with centered layouts

**Authentication**
- JWT-based registration and login
- 7-day token expiry
- Protected routes on both frontend and backend

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 19, Tailwind CSS, Shadcn/UI       |
| Backend    | Python, FastAPI                         |
| Database   | MongoDB (via Motor async driver)        |
| Auth       | JWT (PyJWT), bcrypt (passlib)           |
| Email      | Resend (verified domain: conybear.com)  |
| Storage    | Cloudinary (image uploads)              |

---

## Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI app — all API routes and DB logic
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js          # Root component, routing, auth state
│   │   ├── App.css         # Global styles
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx    # Login & registration
│   │   │   └── HomePage.jsx    # Dashboard, feed, flipbook triggers
│   │   └── components/
│   │       ├── StoryEditorModal.jsx  # WYSIWYG story editor
│   │       ├── FlipbookModal.jsx     # Flipbook reader UI
│   │       └── ui/                   # Shadcn/UI component library
│   ├── package.json
│   └── tailwind.config.js
└── memory/
    └── PRD.md              # Product requirements document
```

---

## Environment Variables

Create a `.env` file in `/backend` with:

```env
MONGO_URL=<mongodb-connection-string>
DB_NAME=<database-name>
JWT_SECRET=<random-secret-key>
RESEND_API_KEY=<resend-api-key>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
APP_URL=<your-deployed-frontend-url>
```

Create a `.env` file in `/frontend` with:

```env
REACT_APP_BACKEND_URL=<backend-api-base-url>
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Yarn
- MongoDB instance (local or Atlas)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend
yarn install
yarn start
```

The frontend runs on port 3000 and proxies `/api` requests to the backend on port 8001.

---

## API Reference

### Auth

| Method | Endpoint              | Description           | Auth |
|--------|-----------------------|-----------------------|------|
| POST   | `/api/auth/register`  | Create a new account  | No   |
| POST   | `/api/auth/login`     | Log in, receive JWT   | No   |
| GET    | `/api/auth/me`        | Get current user info | Yes  |

### Stories

| Method | Endpoint                  | Description                       | Auth |
|--------|---------------------------|-----------------------------------|------|
| GET    | `/api/stories`            | Friends' published stories (feed) | Yes  |
| GET    | `/api/stories/my`         | Current user's stories            | Yes  |
| POST   | `/api/stories`            | Create a new story                | Yes  |
| PUT    | `/api/stories/{story_id}` | Update a story                    | Yes  |
| DELETE | `/api/stories/{story_id}` | Delete a story                    | Yes  |

### Friends

| Method | Endpoint                  | Description                              | Auth |
|--------|---------------------------|------------------------------------------|------|
| POST   | `/api/friends/request`    | Send friend request (or email invite)    | Yes  |
| GET    | `/api/friends/requests`   | List pending incoming requests           | Yes  |
| POST   | `/api/friends/action`     | Accept or reject a friend request        | Yes  |
| GET    | `/api/friends`            | List current friends                     | Yes  |

### Other

| Method | Endpoint              | Description           | Auth |
|--------|-----------------------|-----------------------|------|
| POST   | `/api/upload`         | Upload an image       | Yes  |
| GET    | `/api/users/search`   | Search users by name/email | Yes |

---

## Database Schema

**users**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "displayname",
  "password": "bcrypt-hash",
  "created_at": "ISO-8601"
}
```

**stories**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "username": "author-name",
  "title": "Story Title",
  "content": "<p>Rich HTML content</p>",
  "photos": ["https://cloudinary-url/..."],
  "is_draft": false,
  "created_at": "ISO-8601"
}
```

**friend_requests**
```json
{
  "id": "uuid",
  "from_user_id": "uuid",
  "from_username": "sender",
  "to_user_id": "uuid",
  "to_username": "recipient",
  "status": "pending | accepted | rejected",
  "created_at": "ISO-8601"
}
```

---

## Deployment Notes

- The `APP_URL` environment variable must point to the deployed frontend URL so that email invitation links work correctly.
- Emails are sent from `noreply@conybear.com` via Resend using a verified custom domain.
- A bcrypt/passlib deprecation warning may appear in logs — this is cosmetic and does not affect functionality.
- Preview and production environments use separate MongoDB databases.

---

## License

Private project.
