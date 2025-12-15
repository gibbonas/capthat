import React, { useState, useEffect } from 'react';

export default function CapThatPopup() {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [urlFilter, setUrlFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch images from the current tab when component mounts
  useEffect(() => {
    loadImages();
  }, []);

  // Filter images when urlFilter or images change
  useEffect(() => {
    if (!urlFilter.trim()) {
      setFilteredImages(images);
    } else {
      const filter = urlFilter.toLowerCase();
      setFilteredImages(
        images.filter(img => 
          img.url.toLowerCase().includes(filter) ||
          img.alt.toLowerCase().includes(filter) ||
          img.title.toLowerCase().includes(filter)
        )
      );
    }
  }, [urlFilter, images]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.id) {
        throw new Error('Could not access current tab');
      }

      // Check if we can access the tab (some pages like chrome:// are restricted)
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://'))) {
        throw new Error('Cannot scrape images from Chrome internal pages. Please navigate to a regular website.');
      }

      // Send message to content script to scrape images
      // The content script is automatically injected via manifest.json
      let results;
      try {
        results = await chrome.tabs.sendMessage(tab.id, { action: 'scrapeImages' });
      } catch (messageError) {
        // If message fails, the content script might not be ready
        // Try injecting it manually as fallback
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['inject.js']
          });
          // Wait for script to initialize
          await new Promise(resolve => setTimeout(resolve, 200));
          results = await chrome.tabs.sendMessage(tab.id, { action: 'scrapeImages' });
        } catch (injectError) {
          throw new Error('Failed to access page content. Please refresh the page and try again.');
        }
      }
      
      if (results && results.success) {
        setImages(results.images);
        setFilteredImages(results.images);
      } else {
        throw new Error(results?.error || 'Failed to scrape images');
      }
    } catch (err) {
      setError(err.message || 'Failed to load images. Make sure you are on a valid webpage.');
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSelection = (imageId) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const selectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img.id)));
    }
  };

  const copyImageUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const downloadImage = async (image) => {
    try {
      const filename = `capture/${image.url.split('/').pop().split('?')[0] || `image-${Date.now()}.jpg`}`;
      await chrome.runtime.sendMessage({
        action: 'downloadImage',
        url: image.url,
        filename: filename
      });
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  const downloadSelected = async () => {
    if (selectedImages.size === 0) return;

    const selected = filteredImages.filter(img => selectedImages.has(img.id));
    const urls = selected.map(img => img.url);
    const filenames = selected.map(img => 
      `capture/${img.url.split('/').pop().split('?')[0] || `image-${Date.now()}.jpg`}`
    );

    try {
      await chrome.runtime.sendMessage({
        action: 'downloadMultiple',
        urls: urls,
        filenames: filenames
      });
      setSelectedImages(new Set());
    } catch (err) {
      console.error('Failed to download images:', err);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDimensions = (width, height) => {
    if (width && height) {
      return `${width} × ${height}`;
    }
    return 'Unknown';
  };

  return (
    <div className="w-[600px] max-h-[700px] bg-soft-sand flex flex-col">
      {/* Header */}
      <div className="bg-midnight-navy text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">CapThat!</h1>
            <p className="text-sm text-gray-300">Capture. Compare. Create.</p>
          </div>
          <button
            onClick={loadImages}
            className="px-4 py-2 bg-electric-teal text-midnight-navy rounded-lg font-semibold hover:bg-teal-400 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            placeholder="Filter by URL, alt text, or title..."
            value={urlFilter}
            onChange={(e) => setUrlFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-teal"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-sm bg-gray-100 text-midnight-navy rounded-lg hover:bg-gray-200 transition-colors"
            >
              {selectedImages.size === filteredImages.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-gray-600">
              {selectedImages.size > 0 && `${selectedImages.size} selected`}
            </span>
          </div>
          <button
            onClick={downloadSelected}
            disabled={selectedImages.size === 0}
            className="px-4 py-2 bg-electric-teal text-midnight-navy rounded-lg font-semibold hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download Selected ({selectedImages.size})
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-teal mx-auto mb-4"></div>
              <p className="text-gray-600">Scraping images...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-accent-coral/10 border border-accent-coral text-accent-coral p-4 rounded-lg mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={loadImages}
              className="mt-2 px-3 py-1 bg-accent-coral text-white rounded text-sm hover:bg-pink-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredImages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-semibold mb-2">No images found</p>
            <p className="text-sm">Try refreshing or check if the page has loaded completely.</p>
          </div>
        )}

        {!loading && !error && filteredImages.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`bg-white rounded-lg border-2 overflow-hidden transition-all ${
                  selectedImages.has(image.id)
                    ? 'border-electric-teal shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Image Preview */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.alt || 'Captured image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {/* Selection Checkbox */}
                  <div className="absolute top-1 right-1">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      className="w-4 h-4 text-electric-teal rounded border-gray-300 focus:ring-electric-teal"
                    />
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-2">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 block mb-1">
                      {formatDimensions(image.naturalWidth || image.width, image.naturalHeight || image.height)}
                    </span>
                    <p 
                      className="text-xs text-gray-600 truncate" 
                      title={image.url}
                    >
                      {image.url}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => copyImageUrl(image.url)}
                      className="flex-1 px-1.5 py-1 text-xs bg-gray-100 text-midnight-navy rounded hover:bg-gray-200 transition-colors"
                      title="Copy URL"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => downloadImage(image)}
                      className="flex-1 px-1.5 py-1 text-xs bg-electric-teal text-midnight-navy rounded hover:bg-teal-400 transition-colors font-semibold"
                      title="Download"
                    >
                      Cap!
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-3 text-center text-xs text-gray-500">
        <p>Found {images.length} image{images.length !== 1 ? 's' : ''}</p>
        {urlFilter && (
          <p>Showing {filteredImages.length} after filtering</p>
        )}
      </div>
    </div>
  );
}

