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
- [x] Email links work correctly after deployment

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

## Production URL
- **Deployed App**: https://ancient-posts.emergent.host
- **Email From**: noreply@conybear.com

## Session Updates

### March 6, 2026 (Latest)
**Completed:**
- ✅ Email system fully working with verified domain `conybear.com`
- ✅ Users can send real invitations that go to actual recipients
- ✅ Email links point to correct production URL
- ✅ New users can sign up via email invitation link
- ✅ Friend connections working between users
- ✅ Friends can see each other's stories
- ✅ Image layout: photos below headline, before text
- ✅ Full images displayed (no cropping)
- ✅ Centered Flipbook layout

**Testing Verified:**
- User sent invitation → Recipient received email → Clicked link → Created account → Connected as friends → Can see each other's stories ✅

**Known Behavior:**
- Friends list doesn't auto-refresh; users need to refresh page to see new friends
- This is normal but could be improved in future

### Potential Future Improvements (Discussed)
- [ ] Auto-refresh friends list (every 30 seconds)
- [ ] Store pending invitations so friend request auto-creates when new user signs up
- [ ] Real-time updates without page refresh
- [ ] Draft saving functionality
- [ ] Story categories/tags
- [ ] Search functionality
- [ ] User profile pages
- [ ] Story comments/reactions
- [ ] Image editing/cropping before upload

## Deployment Notes
- Preview and deployed environments use separate MongoDB databases
- APP_URL must be set correctly for email invitation links
- Bcrypt warning in logs is harmless (passlib compatibility)
- Always redeploy after .env changes
