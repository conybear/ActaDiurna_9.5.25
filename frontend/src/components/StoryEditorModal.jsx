import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { authAxios } from '@/App';
import { toast } from 'sonner';
import { Upload, X, Save, Bold, Italic, Underline } from 'lucide-react';

const StoryEditorModal = ({ open, onClose, onSuccess, initialStory = null }) => {
  const [story, setStory] = useState(
    initialStory || { id: null, title: '', content: '', photos: [] }
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialStory) {
      setStory(initialStory);
    }
  }, [initialStory]);

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
      setStory({ ...story, photos: [...story.photos, res.data.url] });
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Image upload failed. Please add Cloudinary credentials.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removePhoto = (index) => {
    setStory({
      ...story,
      photos: story.photos.filter((_, i) => i !== index)
    });
  };

  const handleSave = async () => {
    if (!story.title.trim() || !story.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    setSaving(true);
    try {
      if (story.id) {
        // Update existing story
        await authAxios.put(`/stories/${story.id}`, {
          title: story.title,
          content: story.content,
          photos: story.photos
        });
        toast.success('Story updated!');
      } else {
        // Create new story
        await authAxios.post('/stories', {
          title: story.title,
          content: story.content,
          photos: story.photos
        });
        toast.success('Story published!');
      }
      onSuccess();
      onClose();
      setStory({ id: null, title: '', content: '', photos: [] });
    } catch (error) {
      toast.error('Failed to save story');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="story-editor-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-amber-900">
            {story.id ? 'Edit Story' : 'Write Your Story'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title-modal">Title</Label>
            <Input
              id="title-modal"
              data-testid="story-title-modal-input"
              placeholder="Give your story a title..."
              value={story.title}
              onChange={(e) => setStory({ ...story, title: e.target.value })}
              className="border-amber-200 focus:border-amber-500 text-lg"
            />
          </div>

          <div>
            <Label>Your Story</Label>
            <Textarea
              data-testid="story-content-input"
              placeholder="Write your story here..."
              value={story.content}
              onChange={(e) => setStory({ ...story, content: e.target.value })}
              rows={15}
              className="border-amber-200 focus:border-amber-500 resize-none"
            />
          </div>

          <div>
            <Label>Photos</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="photo-upload-modal"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                data-testid="upload-photo-modal-btn"
                variant="outline"
                onClick={() => document.getElementById('photo-upload-modal').click()}
                disabled={uploadingImage}
                className="border-2 border-dashed border-amber-500 hover:bg-amber-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingImage ? 'Uploading...' : 'Add Photo'}
              </Button>
            </div>

            {story.photos.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap" data-testid="photo-preview-modal">
                {story.photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo}
                      alt={`Upload ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-amber-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              data-testid="save-story-btn"
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold py-6 rounded-xl"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : story.id ? 'Update Story' : 'Publish Story'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="px-8"
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryEditorModal;