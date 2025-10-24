import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const FlipbookModal = ({ open, onClose, stories }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < stories.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentStory = stories[currentPage];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" data-testid="flipbook-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-amber-900">
            <BookOpen className="w-6 h-6" />
            Story Flipbook
          </DialogTitle>
        </DialogHeader>

        {stories.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No stories to display</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Page Content */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 min-h-[400px] border-2 border-amber-200 shadow-inner">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {currentStory.title}
                </h2>
                <p className="text-sm text-gray-600">
                  By {currentStory.username} • {new Date(currentStory.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="prose prose-amber max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">
                  {currentStory.content}
                </p>
              </div>

              {currentStory.photos.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentStory.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Story ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg border-2 border-amber-300 shadow-md"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                onClick={prevPage}
                data-testid="flipbook-prev-btn"
                disabled={currentPage === 0}
                variant="outline"
                className="border-amber-300 hover:bg-amber-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <span className="text-sm text-gray-600" data-testid="flipbook-page-indicator">
                Page {currentPage + 1} of {stories.length}
              </span>

              <Button
                onClick={nextPage}
                data-testid="flipbook-next-btn"
                disabled={currentPage === stories.length - 1}
                variant="outline"
                className="border-amber-300 hover:bg-amber-50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FlipbookModal;