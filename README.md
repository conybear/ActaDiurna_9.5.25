# ActaDiurna_9.5.25
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acta Diurna - Your Personal Daily Chronicle</title>
    <meta name="description" content="Share stories with friends and receive weekly digital flipbook chronicles">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #d4630a 0%, #f4a640 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            background: rgba(139, 69, 19, 0.8);
            padding: 40px 20px;
            border-radius: 15px;
            color: white;
        }

        .header h1 {
            font-size: 3.5em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }

        .scroll-icon {
            font-size: 0.8em;
        }

        .header p {
            font-size: 1.3em;
            font-style: italic;
            margin-bottom: 15px;
        }

        .header .subtitle {
            font-size: 1em;
            background: rgba(255, 255, 255, 0.2);
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
        }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .card-title {
            font-size: 1.5em;
            color: #8b4513;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #d4630a;
        }

        .writing-tools {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
            padding: 8px;
            background: #f5f5f5;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
        }

        .tool-btn {
            background: white;
            border: 1px solid #ccc;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
        }

        .tool-btn:hover {
            background: #e0e0e0;
        }

        .tool-btn.active {
            background: #d4630a;
            color: white;
            border-color: #d4630a;
        }

        .story-editor {
            min-height: 120px;
            resize: vertical;
            font-family: inherit;
        }

        .photo-section {
            margin-bottom: 20px;
        }

        .photo-upload {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 10px;
        }

        .photo-btn {
            background: #f8f9fa;
            border: 2px dashed #d4630a;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            color: #d4630a;
            font-weight: 500;
            transition: background-color 0.3s ease;
        }

        .photo-btn:hover {
            background: #f0f0f0;
        }

        .photo-preview {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .photo-item {
            position: relative;
            display: inline-block;
        }

        .photo-item img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
        }

        .photo-remove {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            border: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn {
            background: #d4630a;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.3s ease;
        }

        .btn:hover {
            background: #b85609;
        }

        .btn:active {
            transform: translateY(1px);
        }

        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }

        .friends-list {
            max-height: 200px;
            overflow-y: auto;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .friend-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            border-bottom: 1px solid #f0f0f0;
        }

        .friend-item:last-child {
            border-bottom: none;
        }

        .friend-info {
            flex: 1;
        }

        .friend-name {
            font-weight: 600;
            color: #333;
        }

        .friend-status {
            font-size: 0.8em;
            margin-top: 2px;
        }

        .friend-status.active {
            color: #28a745;
        }

        .friend-status.pending {
            color: #ffc107;
        }

        .friend-count {
            background: #d4630a;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
        }

        .invite-section {
            margin-bottom: 20px;
        }

        .stories-section {
            grid-column: 1 / -1;
        }

        .stories-header {
            color: #8b4513;
            font-size: 1.5em;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 3px solid #d4630a;
            padding-bottom: 10px;
        }

        .no-stories {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 40px;
        }

        .no-stories p {
            margin-bottom: 5px;
        }

        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }

        .flipbook-info {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #ffc107;
        }

        .flipbook-info h4 {
            margin-bottom: 8px;
        }

        .story-item {
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            background: #fafafa;
        }

        .story-title {
            color: #8b4513;
            margin-bottom: 10px;
            font-size: 1.2em;
            font-weight: 600;
        }

        .story-meta {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 15px;
        }

        .story-content {
            line-height: 1.6;
            color: #333;
            white-space: pre-wrap;
            margin-bottom: 15px;
        }

        .story-photos {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .story-photos img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
        }

        .clear-data-btn {
            background: #dc3545;
            font-size: 0.9em;
            padding: 8px 16px;
            margin-top: 10px;
        }

        .clear-data-btn:hover {
            background: #c82333;
        }

        .test-notice {
            background: #e7f3ff;
            border: 2px solid #007bff;
            color: #004085;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }

        .test-notice h4 {
            margin-bottom: 8px;
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .header h1 {
                font-size: 2.5em;
            }
            
            .card {
                padding: 20px;
            }

            .writing-tools {
                flex-wrap: wrap;
            }

            .photo-upload {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="test-notice">
            <h4>🧪 Test Version</h4>
            <p>This is a demo version of Acta Diurna. Data persists between sessions using your browser's local storage. Perfect for testing with friends!</p>
        </div>

        <header class="header">
            <h1>
                <span class="scroll-icon">📜</span>
                Acta Diurna
            </h1>
            <p>Your Personal Daily Chronicle</p>
            <div class="subtitle">Share stories and read the latest news from your friends</div>
        </header>

        <div class="main-content">
            <!-- Share Your Story Card -->
            <div class="card">
                <h2 class="card-title">
                    <span>📝</span>
                    Share Your Story
                </h2>
                <form id="storyForm">
                    <div class="form-group">
                        <label for="storyTitle">Story Title *</label>
                        <input 
                            type="text" 
                            id="storyTitle" 
                            placeholder="What happened? Give your story a compelling title"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="authorName">Author</label>
                        <input 
                            type="text" 
                            id="authorName" 
                            placeholder="Your name (optional - defaults to Anonymous)"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="storyContent">Your Story *</label>
                        <div class="writing-tools">
                            <button type="button" class="tool-btn" data-tool="bold"><strong>B</strong></button>
                            <button type="button" class="tool-btn" data-tool="italic"><em>I</em></button>
                            <button type="button" class="tool-btn" data-tool="underline"><u>U</u></button>
                            <button type="button" class="tool-btn" data-tool="strikethrough"><s>S</s></button>
                            <div style="width: 1px; height: 20px; background: #ccc; margin: 0 5px;"></div>
                            <button type="button" class="tool-btn" data-tool="h1">H1</button>
                            <button type="button" class="tool-btn" data-tool="h2">H2</button>
                            <button type="button" class="tool-btn" data-tool="quote">❝</button>
                        </div>
                        <textarea 
                            id="storyContent" 
                            class="story-editor"
                            placeholder="Share your story with your friends... What happened? How did it make you feel? What did you learn?"
                            required
                        ></textarea>
                    </div>

                    <div class="photo-section">
                        <label>Add Photos (up to 2)</label>
                        <div class="photo-upload">
                            <input type="file" id="photoInput" accept="image/*" multiple style="display: none;">
                            <button type="button" class="photo-btn" onclick="document.getElementById('photoInput').click()">
                                📷 Add Photo
                            </button>
                            <span id="photoCount">0/2 photos</span>
                        </div>
                        <div id="photoPreview" class="photo-preview"></div>
                    </div>
                    
                    <button type="submit" class="btn">Share Your Story</button>
                </form>
            </div>

            <!-- Invite Friends Card -->
            <div class="card">
                <h2 class="card-title">
                    <span>👥</span>
                    Invite Friends
                </h2>

                <div class="flipbook-info">
                    <h4>📖 Weekly Flipbook Chronicle</h4>
                    <p>Every Monday, we compile one story from each friend into a beautiful digital flipbook. Your stories appear in your friends' flipbooks too!</p>
                </div>
                
                <div class="success-message" id="inviteSuccess">
                    Friend invited successfully! They'll receive an invitation to join your chronicle.
                </div>
                
                <div class="invite-section">
                    <form id="inviteForm">
                        <div class="form-group">
                            <label for="friendEmail">Invite a Friend</label>
                            <input 
                                type="email" 
                                id="friendEmail" 
                                placeholder="Enter friend's email address"
                                required
                            >
                        </div>
                        
                        <button type="submit" class="btn" id="inviteBtn">Send Invitation</button>
                    </form>
                </div>

                <div class="friends-list" id="friendsList">
                    <!-- Friends will be populated by JavaScript -->
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <span class="friend-count" id="friendCount">0/50 friends</span>
                    <small style="color: #666;">Limit: 50 friends per chronicle</small>
                </div>

                <button type="button" class="btn clear-data-btn" onclick="clearFriendsData()">
                    Clear Friends (Test)
                </button>
            </div>

            <!-- Latest Stories Section -->
            <div class="card stories-section">
                <h2 class="stories-header">
                    <span>📚</span>
                    This Week's Stories Preview
                </h2>
                
                <div class="flipbook-info">
                    <h4>Next Flipbook: Monday, <span id="nextMonday"></span></h4>
                    <p>Stories collected this week will be compiled into your weekly chronicle flipbook.</p>
                </div>
                
                <div id="storiesContainer">
                    <!-- Stories will be populated by JavaScript -->
                </div>

                <button type="button" class="btn clear-data-btn" onclick="clearStoriesData()">
                    Clear Stories (Test)
                </button>
            </div>
        </div>
    </div>

    <script>
        // Data storage keys
        const STORIES_KEY = 'actaDiurna_stories';
        const FRIENDS_KEY = 'actaDiurna_friends';
        const PHOTOS_KEY = 'actaDiurna_photos';

        // In-memory state
        let uploadedPhotos = [];
        let friends = [];
        let stories = [];

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadData();
            updateNextMonday();
            updateDisplay();
        });

        // Data persistence functions
        function saveData() {
            try {
                localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
                localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
            } catch (e) {
                console.warn('Could not save data to localStorage:', e);
            }
        }

        function loadData() {
            try {
                const savedStories = localStorage.getItem(STORIES_KEY);
                const savedFriends = localStorage.getItem(FRIENDS_KEY);
                
                stories = savedStories ? JSON.parse(savedStories) : [];
                friends = savedFriends ? JSON.parse(savedFriends) : [
                    { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'active' },
                    { id: 2, name: 'Mike Chen', email: 'mike@example.com', status: 'active' },
                    { id: 3, name: 'Emma Rodriguez', email: 'emma@example.com', status: 'pending' }
                ];
                
                // Save initial friends if first time
                if (!savedFriends) {
                    saveData();
                }
            } catch (e) {
                console.warn('Could not load data from localStorage:', e);
                friends = [
                    { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'active' },
                    { id: 2, name: 'Mike Chen', email: 'mike@example.com', status: 'active' },
                    { id: 3, name: 'Emma Rodriguez', email: 'emma@example.com', status: 'pending' }
                ];
                stories = [];
            }
        }

        function updateDisplay() {
            updateFriendsDisplay();
            updateStoriesDisplay();
        }

        function updateFriendsDisplay() {
            const friendsList = document.getElementById('friendsList');
            const friendCount = document.getElementById('friendCount');
            const inviteBtn = document.getElementById('inviteBtn');

            friendsList.innerHTML = friends.map(friend => `
                <div class="friend-item">
                    <div class="friend-info">
                        <div class="friend-name">${friend.name}</div>
                        <div class="friend-status ${friend.status}">
                            ${friend.status === 'active' ? '✅ Active Writer' : '⏳ Invitation Pending'}
                        </div>
                    </div>
                </div>
            `).join('');

            friendCount.textContent = `${friends.length}/50 friends`;
            
            // Disable invite button if at limit
            if (friends.length >= 50) {
                inviteBtn.disabled = true;
                inviteBtn.textContent = 'Friend Limit Reached';
            } else {
                inviteBtn.disabled = false;
                inviteBtn.textContent = 'Send Invitation';
            }
        }

        function updateStoriesDisplay() {
            const storiesContainer = document.getElementById('storiesContainer');

            if (stories.length === 0) {
                storiesContainer.innerHTML = `
                    <div class="no-stories">
                        <p><em>No stories submitted yet this week</em></p>
                        <p>Be the first to share a story for this week's flipbook!</p>
                    </div>
                `;
            } else {
                storiesContainer.innerHTML = stories.map(story => `
                    <div class="story-item">
                        <h3 class="story-title">${story.title}</h3>
                        <p class="story-meta">By ${story.author} • ${story.date}</p>
                        <div class="story-content">${story.content}</div>
                        ${story.photos && story.photos.length > 0 ? `
                            <div class="story-photos">
                                ${story.photos.map(photo => `<img src="${photo}" alt="Story photo">`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            }
        }

        function updateNextMonday() {
            const today = new Date();
            const nextMonday = new Date(today);
            const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7;
            nextMonday.setDate(today.getDate() + daysUntilMonday);
            
            const options = { month: 'long', day: 'numeric' };
            document.getElementById('nextMonday').textContent = nextMonday.toLocaleDateString('en-US', options);
        }

        // Writing tools functionality
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const tool = this.dataset.tool;
                const textarea = document.getElementById('storyContent');
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                const selectedText = text.substring(start, end);
                
                let newText = '';
                let cursorOffset = 0;
                
                switch(tool) {
                    case 'bold':
                        newText = `**${selectedText || 'bold text'}**`;
                        cursorOffset = selectedText ? 0 : -11;
                        break;
                    case 'italic':
                        newText = `*${selectedText || 'italic text'}*`;
                        cursorOffset = selectedText ? 0 : -12;
                        break;
                    case 'underline':
                        newText = `<u>${selectedText || 'underlined text'}</u>`;
                        cursorOffset = selectedText ? 0 : -18;
                        break;
                    case 'strikethrough':
                        newText = `~~${selectedText || 'strikethrough text'}~~`;
                        cursorOffset = selectedText ? 0 : -20;
                        break;
                    case 'h1':
                        newText = `# ${selectedText || 'Heading 1'}`;
                        cursorOffset = selectedText ? 0 : -11;
                        break;
                    case 'h2':
                        newText = `## ${selectedText || 'Heading 2'}`;
                        cursorOffset = selectedText ? 0 : -12;
                        break;
                    case 'quote':
                        newText = `> ${selectedText || 'Quote text'}`;
                        cursorOffset = selectedText ? 0 : -12;
                        break;
                }
                
                textarea.value = text.substring(0, start) + newText + text.substring(end);
                textarea.focus();
                
                const newPos = start + newText.length + cursorOffset;
                textarea.setSelectionRange(newPos, newPos);
            });
        });

        // Photo upload functionality
        document.getElementById('photoInput').addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            
            files.forEach(file => {
                if (uploadedPhotos.length < 2 && file.size <= 5 * 1024 * 1024) { // 5MB limit
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const photoObj = {
                            id: Date.now() + Math.random(),
                            src: e.target.result,
                            name: file.name
                        };
                        uploadedPhotos.push(photoObj);
                        updatePhotoPreview();
                    };
                    reader.readAsDataURL(file);
                } else if (file.size > 5 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Maximum size is 5MB.`);
                }
            });
        });

        function updatePhotoPreview() {
            const preview = document.getElementById('photoPreview');
            const count = document.getElementById('photoCount');
            
            preview.innerHTML = uploadedPhotos.map(photo => `
                <div class="photo-item">
                    <img src="${photo.src}" alt="${photo.name}">
                    <button class="photo-remove" onclick="removePhoto('${photo.id}')">×</button>
                </div>
            `).join('');
            
            count.textContent = `${uploadedPhotos.length}/2 photos`;
        }

        function removePhoto(id) {
            uploadedPhotos = uploadedPhotos.filter(photo => photo.id !== id);
            updatePhotoPreview();
        }

        // Handle story submission
        document.getElementById('storyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('storyTitle').value.trim();
            const author = document.getElementById('authorName').value.trim() || 'Anonymous';
            const content = document.getElementById('storyContent').value.trim();
            
            if (!title || !content) {
                alert('Please fill in both title and story content.');
                return;
            }
            
            // Create story object
            const story = {
                id: Date.now(),
                title: title,
                author: author,
                content: content,
                photos: uploadedPhotos.map(photo => photo.src),
                date: new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            
            // Add to stories array
            stories.unshift(story); // Add to beginning of array
            
            // Save to localStorage
            saveData();
            
            // Update display
            updateStoriesDisplay();
            
            // Reset form
            this.reset();
            uploadedPhotos = [];
            updatePhotoPreview();
            
            // Show success feedback
            alert('Story submitted for this week\'s flipbook! 📖✨');
        });
        
        // Handle friend invitation
        document.getElementById('inviteForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (friends.length >= 50) {
                alert('You\'ve reached the maximum of 50 friends per chronicle.');
                return;
            }
            
            const email = document.getElementById('friendEmail').value.trim();
            
            // Check if friend already exists
            if (friends.some(friend => friend.email.toLowerCase() === email.toLowerCase())) {
                alert('This friend is already in your chronicle!');
                return;
            }
            
            const name = email.split('@')[0].replace(/[._]/g, ' '); // Simple name extraction
            
            // Add friend to array
            const friend = {
                id: Date.now(),
                name: name.charAt(0).toUpperCase() + name.slice(1),
                email: email,
                status: 'pending'
            };
            
            friends.push(friend);
            
            // Save to localStorage
            saveData();
            
            // Update display
            updateFriendsDisplay();
            
            // Show success message
            const successMsg = document.getElementById('inviteSuccess');
            successMsg.style.display = 'block';
            
            // Reset form
            this.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 5000);
        });

        // Test/admin functions
        function clearFriendsData() {
            if (confirm('Are you sure you want to clear all friends? This cannot be undone.')) {
                friends = [];
                saveData();
                updateFriendsDisplay();
            }
        }

        function clearStoriesData() {
            if (confirm('Are you sure you want to clear all stories? This cannot be undone.')) {
                stories = [];
                saveData();
                updateStoriesDisplay();
            }
        }

        // Clear all data function (can be called from browser console)
        window.clearAllData = function() {
            if (confirm('This will clear ALL data including friends and stories. Continue?')) {
                localStorage.removeItem(STORIES_KEY);
                localStorage.removeItem(FRIENDS_KEY);
                location.reload();
            }
        };
    </script>
</body>
