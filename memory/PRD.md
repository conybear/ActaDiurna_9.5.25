# Acta Diurna - Product Requirements Document

## Original Problem Statement
Build a full-stack story-sharing application called "Acta Diurna" where users can write, save, edit, and delete stories, connect with friends, and view friends' stories in a flipbook format.

## Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React with Shadcn/UI components
- **Database**: MongoDB
- **Authentication**: JWT-based

## Third-Party Integrations
- **Resend**: Email invitations from verified domain `conybear.com`
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
- [x] Photos displayed below headline, before text content
- [x] Full images shown (no cropping) using object-contain

### Friends System
- [x] Send friend requests by email
- [x] Accept/reject friend requests
- [x] Friends list display
- [x] Real email invitations from `noreply@conybear.com`

### Flipbook Features
- [x] Friends' Flipbook - view friends' published stories
- [x] My Stories Flipbook - view your own stories in flipbook format
- [x] Page navigation (Previous/Next)
- [x] Proper HTML rendering with formatting preserved
- [x] Centered layout (title, author, photos)

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

## Environment Variables
- `APP_URL` - Production app URL for email links (https://ancient-posts.emergent.host)
- `RESEND_API_KEY` - Email service API key
- `CLOUDINARY_*` - Image storage credentials
- `MONGO_URL`, `DB_NAME` - Database connection
- `JWT_SECRET` - Authentication secret

## Session Updates

### March 6, 2026 (Latest)
**Completed:**
- Fixed image layout: photos now appear below headline, before text
- Fixed image cropping: using `object-contain` to show full images
- Centered Flipbook layout (title, author, photos)
- Configured real email system with verified domain `conybear.com`
- Emails now send from `noreply@conybear.com` to actual recipients
- Added `APP_URL` environment variable for production email links
- All users can now send real email invitations

### January 18, 2026
**Completed:**
- Replaced markdown-based editor with true WYSIWYG (contentEditable)
- Fixed story content not loading when editing
- Added bullet and numbered list support
- Added "My Stories Flipbook" feature
- Fixed HTML rendering in Flipbook
- Created test friend accounts in preview environment

## Deployment Notes
- Preview and deployed environments use separate MongoDB databases
- Test data in preview doesn't appear in production
- APP_URL must be set correctly for email invitation links to work
- Bcrypt warning in logs is harmless (passlib compatibility)

## Backlog / Future Tasks
- [ ] Draft saving functionality
- [ ] Story categories/tags
- [ ] Search functionality
- [ ] User profile pages
- [ ] Story comments/reactions
- [ ] Image editing/cropping before upload
