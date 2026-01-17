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
  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialStory) {
      // Convert HTML back to markdown for editing
      const markdownContent = htmlToMarkdown(initialStory.content);
      setStory({ ...initialStory, content: markdownContent });
    }
  }, [initialStory]);

  // Convert HTML to markdown for editing
  const htmlToMarkdown = (html) => {
    if (!html) return '';
    return html
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<u>(.*?)<\/u>/g, '__$1__');
  };

  // Convert markdown to HTML for saving
  const markdownToHtml = (markdown) => {
    if (!markdown) return '';
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>');
  };

  const insertFormatting = (formatType) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formatChars = '';
    switch (formatType) {
      case 'bold':
        formatChars = '**';
        break;
      case 'italic':
        formatChars = '*';
        break;
      case 'underline':
        formatChars = '__';
        break;
      default:
        return;
    }
    
    let newText;
    if (selectedText) {
      // Wrap selected text
      newText = textarea.value.substring(0, start) + 
                formatChars + selectedText + formatChars + 
                textarea.value.substring(end);
    } else {
      // Insert formatting markers at cursor
      newText = textarea.value.substring(0, start) + 
                formatChars + formatChars + 
                textarea.value.substring(end);
    }
    
    setStory({ ...story, content: newText });
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + formatChars.length, end + formatChars.length);
      } else {
        textarea.setSelectionRange(start + formatChars.length, start + formatChars.length);
      }
    }, 0);
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
      // Convert markdown to HTML before saving
      const htmlContent = markdownToHtml(story.content);
      
      if (story.id) {
        // Update existing story
        await authAxios.put(`/stories/${story.id}`, {
          title: story.title,
          content: htmlContent,
          photos: story.photos
        });
        toast.success('Story updated!');
      } else {
        // Create new story
        await authAxios.post('/stories', {
          title: story.title,
          content: htmlContent,
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
            
            {/* Formatting Toolbar */}
            <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-t-lg flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertFormatting('bold')}
                className="hover:bg-amber-200"
                data-testid="bold-btn"
                title="Bold (**text**)"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertFormatting('italic')}
                className="hover:bg-amber-200"
                data-testid="italic-btn"
                title="Italic (*text*)"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertFormatting('underline')}
                className="hover:bg-amber-200"
                data-testid="underline-btn"
                title="Underline (__text__)"
              >
                <Underline className="w-4 h-4" />
              </Button>
              <span className="text-xs text-amber-700 ml-2 self-center">
                Use **bold**, *italic*, __underline__ - formatting shows when published
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Write (with markdown):</Label>
                <Textarea
                  ref={textareaRef}
                  data-testid="story-content-input"
                  placeholder="Write your story here... Use **bold**, *italic*, __underline__ for formatting"
                  value={story.content}
                  onChange={(e) => setStory({ ...story, content: e.target.value })}
                  rows={15}
                  className="border-amber-200 focus:border-amber-500 resize-none font-mono text-sm"
                />
              </div>
              
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Preview (how it will look):</Label>
                <div 
                  className="min-h-[300px] p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto prose prose-amber max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(story.content) || '<p class="text-gray-400 italic">Your formatted text will appear here...</p>' }}
                />
              </div>
            </div>
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