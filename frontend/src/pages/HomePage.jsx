import { useState, useEffect } from 'react';
import { authAxios } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Scroll, Users, BookOpen, LogOut, UserPlus, Check, XIcon, Maximize2, Edit, Trash2 } from 'lucide-react';
import FlipbookModal from '@/components/FlipbookModal';
import StoryEditorModal from '@/components/StoryEditorModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HomePage = ({ user, setUser }) => {
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [showMyFlipbook, setShowMyFlipbook] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [deletingStory, setDeletingStory] = useState(null);

  useEffect(() => {
    fetchStories();
    fetchMyStories();
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

  const fetchMyStories = async () => {
    try {
      const res = await authAxios.get('/stories/my');
      setMyStories(res.data);
    } catch (error) {
      console.error('Failed to fetch my stories', error);
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

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendEmail.trim()) return;

    try {
      await authAxios.post('/friends/request', { to_email: friendEmail });
      toast.success('Friend request sent!');
      setFriendEmail('');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to send friend request';
      if (error.response?.status === 404) {
        // User not registered yet - show info message instead of error
        toast.info(errorMsg, { duration: 5000 });
      } else {
        toast.error(errorMsg);
      }
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

  const handleEditStory = (story) => {
    setEditingStory(story);
    setShowEditor(true);
  };

  const handleDeleteStory = async () => {
    if (!deletingStory) return;

    try {
      await authAxios.delete(`/stories/${deletingStory.id}`);
      toast.success('Story deleted');
      setDeletingStory(null);
      fetchMyStories();
      fetchStories();
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  const handleEditorSuccess = () => {
    fetchStories();
    fetchMyStories();
    setEditingStory(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const renderStory = (story, showActions = false) => (
    <div
      key={story.id}
      data-testid={`story-${story.id}`}
      className="border-2 border-amber-200 rounded-xl p-6 bg-amber-50/50"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-bold text-amber-900 flex-1">{story.title}</h3>
        {showActions && (
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditStory(story)}
              data-testid={`edit-story-${story.id}`}
              className="border-amber-400 hover:bg-amber-50"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeletingStory(story)}
              data-testid={`delete-story-${story.id}`}
              className="border-red-300 hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-3">
        By {story.username} • {new Date(story.created_at).toLocaleDateString()}
      </p>
      <Separator className="mb-3" />
      <div
        className="text-gray-800 leading-relaxed mb-4 prose prose-amber max-w-none"
        dangerouslySetInnerHTML={{ __html: story.content }}
      />
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
  );

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

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => {
              setEditingStory(null);
              setShowEditor(true);
            }}
            data-testid="open-editor-btn"
            className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-6 px-8 rounded-xl shadow-lg"
          >
            <Maximize2 className="w-5 h-5 mr-2" />
            Write a Story
          </Button>
          <Button
            onClick={() => setShowFlipbook(true)}
            data-testid="open-flipbook-btn"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-6 px-8 rounded-xl shadow-lg"
          >
            <Scroll className="w-5 h-5 mr-2" />
            Open Flipbook
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Friends Sidebar */}
          <div className="lg:col-span-1">
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

                <ScrollArea className="h-64 border rounded-lg">
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
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-2 border-amber-900/20" data-testid="stories-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <BookOpen className="w-6 h-6" />
                  Stories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="feed" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="feed" data-testid="feed-tab">Friends' Stories</TabsTrigger>
                    <TabsTrigger value="my" data-testid="my-stories-tab">My Stories ({myStories.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="feed" data-testid="feed-content">
                    {stories.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No stories yet</p>
                        <p className="text-sm">Add friends and start sharing stories!</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          {stories.map((story) => renderStory(story, false))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  <TabsContent value="my" data-testid="my-stories-content">
                    {myStories.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">You haven't written any stories yet</p>
                        <p className="text-sm">Click "Write a Story" to get started!</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          {myStories.map((story) => renderStory(story, true))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FlipbookModal
        open={showFlipbook}
        onClose={() => setShowFlipbook(false)}
        stories={stories}
      />

      <StoryEditorModal
        open={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingStory(null);
        }}
        onSuccess={handleEditorSuccess}
        initialStory={editingStory}
      />

      <AlertDialog open={!!deletingStory} onOpenChange={() => setDeletingStory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingStory?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStory}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HomePage;