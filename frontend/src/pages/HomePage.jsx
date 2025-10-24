import { useState, useEffect } from 'react';
import { authAxios } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Scroll, PenTool, Users, BookOpen, LogOut, Upload, X, UserPlus, Check, XIcon } from 'lucide-react';
import FlipbookModal from '@/components/FlipbookModal';

const HomePage = ({ user, setUser }) => {
  const [stories, setStories] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [newStory, setNewStory] = useState({ title: '', content: '', photos: [] });
  const [friendEmail, setFriendEmail] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showFlipbook, setShowFlipbook] = useState(false);

  useEffect(() => {
    fetchStories();
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await authAxios.get('/stories');
      setStories(res.data);
    } catch (error) {
      console.error('Failed to fetch stories', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await authAxios.get('/friends');
      setFriends(res.data);
    } catch (error) {
      console.error('Failed to fetch friends', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await authAxios.get('/friends/requests');
      setFriendRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch friend requests', error);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newStory.title.trim() || !newStory.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    try {
      await authAxios.post('/stories', newStory);
      toast.success('Story published!');
      setNewStory({ title: '', content: '', photos: [] });
      fetchStories();
    } catch (error) {
      toast.error('Failed to create story');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authAxios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewStory({ ...newStory, photos: [...newStory.photos, res.data.url] });
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Image upload failed. Please add Cloudinary credentials.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removePhoto = (index) => {
    setNewStory({
      ...newStory,
      photos: newStory.photos.filter((_, i) => i !== index)
    });
  };

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendEmail.trim()) return;

    try {
      await authAxios.post('/friends/request', { to_email: friendEmail });
      toast.success('Friend request sent!');
      setFriendEmail('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send friend request');
    }
  };

  const handleFriendRequestAction = async (requestId, action) => {
    try {
      await authAxios.post('/friends/action', { request_id: requestId, action });
      toast.success(`Friend request ${action}ed!`);
      fetchFriendRequests();
      fetchFriends();
      fetchStories();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-500 to-amber-400 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/90 to-amber-800/90 backdrop-blur-sm rounded-2xl p-6 md:p-10 mb-8 shadow-2xl border-2 border-amber-700" data-testid="page-header">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Scroll className="w-12 h-12 text-amber-200" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Acta Diurna
                </h1>
                <p className="text-amber-200 text-lg italic" style={{ fontFamily: 'Merriweather, serif' }}>
                  "Daily Acts" - Chronicles of Life
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-medium" data-testid="user-greeting">Welcome, {user.username}!</span>
              <Button
                onClick={handleLogout}
                data-testid="logout-btn"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Create Story Card */}
          <Card className="shadow-xl border-2 border-amber-900/20 backdrop-blur-sm" data-testid="create-story-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <PenTool className="w-6 h-6" />
                Share Your Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStory} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    data-testid="story-title-input"
                    placeholder="Give your story a title..."
                    value={newStory.title}
                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                    className="border-amber-200 focus:border-amber-500"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Your Story</Label>
                  <Textarea
                    id="content"
                    data-testid="story-content-input"
                    placeholder="Write your story here..."
                    value={newStory.content}
                    onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                    rows={5}
                    className="border-amber-200 focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <Label>Photos</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      data-testid="upload-photo-btn"
                      variant="outline"
                      onClick={() => document.getElementById('photo-upload').click()}
                      disabled={uploadingImage}
                      className="border-2 border-dashed border-amber-500 hover:bg-amber-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Add Photo'}
                    </Button>
                  </div>

                  {newStory.photos.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap" data-testid="photo-preview-container">
                      {newStory.photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`Upload ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-amber-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  data-testid="publish-story-btn"
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-6 rounded-xl"
                >
                  Publish Story
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Friends Card */}
          <Card className="shadow-xl border-2 border-amber-900/20" data-testid="friends-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Users className="w-6 h-6" />
                Friends ({friends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendFriendRequest} className="mb-4">
                <Label htmlFor="friend-email">Invite Friend by Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="friend-email"
                    data-testid="friend-email-input"
                    type="email"
                    placeholder="friend@email.com"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className="border-amber-200 focus:border-amber-500"
                  />
                  <Button
                    type="submit"
                    data-testid="send-friend-request-btn"
                    className="bg-amber-700 hover:bg-amber-800"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              </form>

              {friendRequests.length > 0 && (
                <div className="mb-4" data-testid="friend-requests-section">
                  <Label className="text-amber-900 font-semibold mb-2 block">Pending Requests</Label>
                  <ScrollArea className="h-32 border rounded-lg">
                    {friendRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                        <span className="font-medium">{req.from_username}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleFriendRequestAction(req.id, 'accept')}
                            data-testid={`accept-request-${req.id}`}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleFriendRequestAction(req.id, 'reject')}
                            data-testid={`reject-request-${req.id}`}
                            variant="destructive"
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              <ScrollArea className="h-48 border rounded-lg">
                {friends.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No friends yet. Invite someone to get started!</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div>
                        <p className="font-semibold text-amber-900">{friend.username}</p>
                        <p className="text-sm text-green-600">{friend.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Stories Section */}
        <Card className="shadow-xl border-2 border-amber-900/20" data-testid="stories-section">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <BookOpen className="w-6 h-6" />
              Stories from Friends
            </CardTitle>
            <Button
              onClick={() => setShowFlipbook(true)}
              data-testid="open-flipbook-btn"
              className="bg-amber-700 hover:bg-amber-800"
            >
              <Scroll className="w-4 h-4 mr-2" />
              Open Flipbook
            </Button>
          </CardHeader>
          <CardContent>
            {stories.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No stories yet</p>
                <p className="text-sm">Add friends and start sharing stories!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    data-testid={`story-${story.id}`}
                    className="border-2 border-amber-200 rounded-xl p-6 bg-amber-50/50"
                  >
                    <h3 className="text-xl font-bold text-amber-900 mb-2">{story.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      By {story.username} • {new Date(story.created_at).toLocaleDateString()}
                    </p>
                    <Separator className="mb-3" />
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed mb-4">{story.content}</p>
                    {story.photos.length > 0 && (
                      <div className="flex gap-3 flex-wrap">
                        {story.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Story ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-amber-300"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FlipbookModal
        open={showFlipbook}
        onClose={() => setShowFlipbook(false)}
        stories={stories}
      />
    </div>
  );
};

export default HomePage;