import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { authAxios } from '@/App';
import { toast } from 'sonner';
import { Upload, X, Save, Bold, Italic, Underline, Heading1, Heading2 } from 'lucide-react';

const StoryEditorModal = ({ open, onClose, onSuccess, initialStory = null }) => {
  const [story, setStory] = useState(
    initialStory || { id: null, title: '', content: '', photos: [] }
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (initialStory) {
      setStory(initialStory);
      // Set content in editor when story loads
      if (editorRef.current && initialStory.content) {
        editorRef.current.innerHTML = initialStory.content;
      }
    }
  }, [initialStory]);

  useEffect(() => {
    // Set content when editor opens
    if (editorRef.current && open) {
      if (story.content) {
        editorRef.current.innerHTML = story.content;
      }
      // Ensure focus and proper setup
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          updateToolbarState(); // Initialize toolbar state
        }
      }, 100);
    }
  }, [open, story.id]);

  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Use execCommand for simple formatting
    document.execCommand(command, false, value);
    
    // Force update content after command
    setTimeout(() => {
      handleContentChange();
      updateToolbarState(); // Update button active states
    }, 10);
  };

  const [toolbarState, setToolbarState] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  const updateToolbarState = () => {
    if (!editorRef.current) return;
    
    setToolbarState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setStory({ ...story, content: editorRef.current.innerHTML });
    }
  };

  // Update toolbar state when selection changes
  const handleSelectionChange = () => {
    updateToolbarState();
  };

  // Auto-save draft every 3 seconds
  useEffect(() => {
    if (!story.title && !story.content) return;
    
    const autoSave = setTimeout(() => {
      saveDraft();
    }, 3000);
    
    return () => clearTimeout(autoSave);
  }, [story.title, story.content, story.photos]); // Add photos to dependencies

  const saveDraft = async () => {
    if (!story.title.trim() && !story.content.trim()) return;
    
    try {
      const draftData = {
        title: story.title || 'Untitled Draft',
        content: story.content,
        photos: story.photos,
        is_draft: true
      };
      
      console.log('Saving draft:', draftData); // Debug log
      
      if (story.id) {
        // Update existing draft
        await authAxios.put(`/stories/${story.id}`, draftData);
        console.log('Draft updated successfully'); // Debug log
      } else {
        // Create new draft
        const res = await authAxios.post('/stories', draftData);
        console.log('Draft created successfully:', res.data); // Debug log
        setStory(prev => ({ ...prev, id: res.data.id }));
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
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
      setStory({ ...story, photos: [...story.photos, res.data.url] });
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Image upload failed');
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

  const handleSave = async (isDraft = false) => {
    if (!story.title.trim() || !story.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    setSaving(true);
    try {
      const storyData = {
        title: story.title,
        content: story.content,
        photos: story.photos,
        is_draft: isDraft
      };

      if (story.id) {
        // Update existing story
        await authAxios.put(`/stories/${story.id}`, storyData);
        toast.success(isDraft ? 'Draft saved!' : 'Story updated!');
      } else {
        // Create new story
        const res = await authAxios.post('/stories', storyData);
        if (isDraft) {
          toast.success('Draft saved!');
        } else {
          toast.success('Story published!');
        }
        setStory({ ...story, id: res.data.id });
      }
      
      if (!isDraft) {
        onSuccess();
        onClose();
        // Reset form only if publishing
        setStory({ id: null, title: '', content: '', photos: [] });
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      }
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
              tabIndex={1}
            />
          </div>

          <div>
            <Label>Your Story</Label>
            <div className="bg-white rounded-lg border-2 border-amber-200 overflow-hidden" data-testid="rich-text-editor">
              {/* Toolbar */}
              <div className="bg-amber-50 p-2 border-b-2 border-amber-200 flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand('bold')}
                  className={`hover:bg-amber-200 ${toolbarState.bold ? 'bg-amber-300 text-amber-900' : ''}`}
                  data-testid="bold-btn"
                  tabIndex={-1}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand('italic')}
                  className={`hover:bg-amber-200 ${toolbarState.italic ? 'bg-amber-300 text-amber-900' : ''}`}
                  data-testid="italic-btn"
                  tabIndex={-1}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand('underline')}
                  className={`hover:bg-amber-200 ${toolbarState.underline ? 'bg-amber-300 text-amber-900' : ''}`}
                  data-testid="underline-btn"
                  tabIndex={-1}
                >
                  <Underline className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand('formatBlock', '<h2>')}
                  className="hover:bg-amber-200"
                  data-testid="heading1-btn"
                  tabIndex={-1}
                >
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand('formatBlock', '<h3>')}
                  className="hover:bg-amber-200"
                  data-testid="heading2-btn"
                  tabIndex={-1}
                >
                  <Heading2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable={true}
                onInput={handleContentChange}
                onMouseUp={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                onPaste={(e) => {
                  // Handle paste to maintain formatting
                  setTimeout(() => handleContentChange(), 10);
                }}
                data-testid="content-editor"
                tabIndex={2}
                className="min-h-[400px] p-6 focus:outline-none bg-white border-0"
                style={{ 
                  direction: 'ltr',
                  textAlign: 'left',
                  outline: 'none',
                  fontFamily: 'Merriweather, Georgia, serif',
                  fontSize: '16px',
                  lineHeight: '1.6'
                }}
                suppressContentEditableWarning={true}
              />
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
              onClick={() => handleSave(false)}
              data-testid="save-story-btn"
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold py-6 rounded-xl"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : story.id ? 'Update Story' : 'Publish Story'}
            </Button>
            <Button
              onClick={() => handleSave(true)}
              variant="outline"
              className="px-8"
              disabled={saving}
              data-testid="save-draft-btn"
            >
              Save Draft
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