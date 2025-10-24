# Acta Diurna - Setup Instructions

## 🎉 Your App is Ready!

Your Acta Diurna app is now running with core functionality. Follow the steps below to enable optional features like image uploads and email notifications.

---

## 📧 SendGrid Setup (For Email Notifications)

SendGrid allows you to send email notifications when users receive friend requests.

### Steps:

1. **Sign Up for SendGrid**
   - Go to https://signup.sendgrid.com/
   - Create a free account (100 emails/day free tier)

2. **Create an API Key**
   - After logging in, go to Settings → API Keys
   - Click "Create API Key"
   - Give it a name (e.g., "Acta Diurna")
   - Select "Full Access" or "Restricted Access" with Mail Send permissions
   - Click "Create & View"
   - **Copy the API key immediately** (you won't be able to see it again)

3. **Add to Your App**
   - Open `/app/backend/.env` file
   - Uncomment and add your key:
     ```
     SENDGRID_API_KEY="your-actual-api-key-here"
     ```
   - Restart the backend: `sudo supervisorctl restart backend`

---

## 📸 Cloudinary Setup (For Image Uploads)

Cloudinary provides free cloud storage for user-uploaded photos in stories.

### Steps:

1. **Sign Up for Cloudinary**
   - Go to https://cloudinary.com/users/register/free
   - Create a free account (25 credits/month, plenty for testing)

2. **Get Your Credentials**
   - After logging in, go to your Dashboard
   - You'll see three important values:
     - **Cloud Name** (e.g., "dzxyz123")
     - **API Key** (e.g., "123456789012345")
     - **API Secret** (e.g., "abcdefghijklmnopqrstuvwxyz123")

3. **Add to Your App**
   - Open `/app/backend/.env` file
   - Uncomment and add your credentials:
     ```
     CLOUDINARY_CLOUD_NAME="your-cloud-name"
     CLOUDINARY_API_KEY="your-api-key"
     CLOUDINARY_API_SECRET="your-api-secret"
     ```
   - Restart the backend: `sudo supervisorctl restart backend`

---

## ✅ What Works Without Setup

The following features work immediately without any additional configuration:

- ✅ User Registration & Login (JWT Authentication)
- ✅ Create Stories (text-only)
- ✅ Send & Accept Friend Requests
- ✅ View Friends' Stories Feed
- ✅ Flipbook View of Stories

---

## 🚀 Features That Need Setup

- 📧 **Email Notifications** - Requires SendGrid API key
- 📸 **Photo Uploads** - Requires Cloudinary credentials

---

## 🧪 Testing Your App

1. **Create Two Accounts**
   - Register two users with different emails
   - This allows you to test the friend system

2. **Send a Friend Request**
   - User A sends a friend request to User B's email
   - User B logs in and accepts the request

3. **Create Stories**
   - Both users can now create stories
   - Stories will appear in each other's feeds

4. **Try the Flipbook**
   - Click "Open Flipbook" to view stories in a beautiful page-turning format

---

## 📝 Environment Variables Reference

Your `/app/backend/.env` file should look like this:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="acta_diurna"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production-xYz123"

# Optional: Add these when you get your credentials
# SENDGRID_API_KEY="your-sendgrid-api-key"
# CLOUDINARY_CLOUD_NAME="your-cloud-name"
# CLOUDINARY_API_KEY="your-api-key"
# CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 🛠️ Troubleshooting

**Backend not starting?**
```bash
tail -n 50 /var/log/supervisor/backend.*.log
```

**Frontend issues?**
```bash
tail -n 50 /var/log/supervisor/frontend.*.log
```

**Restart services:**
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

---

## 🎨 Features Included

✅ Elegant Roman-inspired design matching your CSS
✅ JWT-based authentication
✅ MongoDB database with user, story, and friendship models
✅ Real-time friend request system
✅ Story creation with text and photos
✅ Beautiful flipbook modal for reading stories
✅ Responsive design for mobile and desktop
✅ Toast notifications for user feedback

---

Enjoy your Acta Diurna app! 📜✨
