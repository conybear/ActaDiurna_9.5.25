# Acta Diurna - Product Requirements Document

## Original Problem Statement
Build a full-stack story-sharing application called "Acta Diurna" where users can write, save, edit, and delete stories, connect with friends, and view friends' stories in a flipbook format.

## Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React with Shadcn/UI components
- **Database**: MongoDB
- **Authentication**: JWT-based

## Third-Party Integrations
- **Resend**: Email invitations to new users (free tier - emails redirected to verified address)
- **Cloudinary**: Image storage for story photos

## Core Features (Completed)

### Authentication
- [x] User registration with email, username, password
- [x] JWT-based login/logout
- [x] Protected routes

### Story Management
- [x] Create stories with WYSIWYG editor (contentEditable)
- [x] Rich text formatting: Bold, Italic, Underline
- [x] Bullet and numbered lists
- [x] Edit existing stories (content loads correctly)
- [x] Delete stories
- [x] Photo uploads via Cloudinary

### Friends System
- [x] Send friend requests by email
- [x] Accept/reject friend requests
- [x] Friends list display
- [x] Email invitations for non-registered users

### Flipbook Features
- [x] Friends' Flipbook - view friends' published stories
- [x] My Stories Flipbook - view your own stories in flipbook format
- [x] Page navigation (Previous/Next)
- [x] Proper HTML rendering with formatting preserved

## Key Files
- `/app/backend/server.py` - All backend API endpoints
- `/app/frontend/src/components/StoryEditorModal.jsx` - WYSIWYG story editor
- `/app/frontend/src/components/FlipbookModal.jsx` - Flipbook component
- `/app/frontend/src/pages/HomePage.jsx` - Main dashboard
- `/app/frontend/src/pages/AuthPage.jsx` - Login/registration

## Database Schema
- `users`: {id, username, email, hashed_password, created_at}
- `stories`: {id, user_id, username, title, content, photos[], is_draft, created_at}
- `friend_requests`: {id, from_user_id, from_username, to_user_id, to_username, status, created_at}

## API Endpoints
- POST `/api/auth/register`, `/api/auth/login`
- GET/POST `/api/stories`, GET/PUT/DELETE `/api/stories/{id}`
- GET `/api/stories/my`
- POST `/api/friends/request`, `/api/friends/action`
- GET `/api/friends`, `/api/friends/requests`
- POST `/api/upload` (photos)

## Known Limitations
1. **Email**: Using Resend free tier - all invitation emails redirect to verified address (joel.conybear@gmail.com)
2. **Separate Databases**: Preview and deployed environments use different MongoDB instances. Test data created in preview doesn't appear in production.

## Session Updates

### January 18, 2026
**Completed:**
- Replaced markdown-based editor with true WYSIWYG (contentEditable)
- Fixed story content not loading when editing (added setTimeout for DOM readiness)
- Added bullet and numbered list support with proper CSS styling
- Added "My Stories Flipbook" feature with dedicated button
- Fixed HTML rendering in Flipbook (using dangerouslySetInnerHTML)
- Created test friend accounts and stories in preview environment:
  - Marcus Aurelius (2 stories)
  - Emily Writer (2 stories)
  - Storyteller Sam (2 stories)

**Note:** Test friends/stories only exist in preview database. Production requires real friends via email invitations.

## Backlog / Future Tasks
- [ ] Upgrade to paid email API for production friend invitations
- [ ] Draft saving functionality
- [ ] Story categories/tags
- [ ] Search functionality
- [ ] User profile pages
- [ ] Story comments/reactions
