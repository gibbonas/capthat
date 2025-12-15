// Content script to scrape images from the current page
(function() {
  'use strict';

  // Function to extract all images from the page
  function scrapeImages() {
    const images = [];
    const imgElements = document.querySelectorAll('img');
    const pictureElements = document.querySelectorAll('picture source');
    const backgroundImages = [];
    
    // Get all img elements
    imgElements.forEach((img, index) => {
      let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.currentSrc;
      
      // Skip data URLs and very small images (likely icons)
      if (src && !src.startsWith('data:') && src.startsWith('http')) {
        const rect = img.getBoundingClientRect();
        const width = img.naturalWidth || rect.width;
        const height = img.naturalHeight || rect.height;
        
        // Only include images that are reasonably sized (filter out tiny icons)
        if (width > 50 && height > 50) {
          images.push({
            id: `img-${index}`,
            url: src,
            alt: img.alt || '',
            width: width,
            height: height,
            naturalWidth: img.naturalWidth || width,
            naturalHeight: img.naturalHeight || height,
            title: img.title || img.alt || ''
          });
        }
      }
    });

    // Get images from picture/source elements
    pictureElements.forEach((source, index) => {
      const srcset = source.srcset;
      if (srcset) {
        const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
        urls.forEach(url => {
          if (url && url.startsWith('http') && !url.startsWith('data:')) {
            if (!images.find(img => img.url === url)) {
              images.push({
                id: `source-${index}`,
                url: url,
                alt: '',
                width: 0,
                height: 0,
                naturalWidth: 0,
                naturalHeight: 0,
                title: ''
              });
            }
          }
        });
      }
    });

    // Get background images from CSS
    const allElements = document.querySelectorAll('*');
    allElements.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
          const url = urlMatch[1];
          if (url.startsWith('http') && !url.startsWith('data:')) {
            if (!images.find(img => img.url === url)) {
              const rect = el.getBoundingClientRect();
              images.push({
                id: `bg-${index}`,
                url: url,
                alt: '',
                width: rect.width,
                height: rect.height,
                naturalWidth: rect.width,
                naturalHeight: rect.height,
                title: ''
              });
            }
          }
        }
      }
    });

    // Remove duplicates
    const uniqueImages = [];
    const seenUrls = new Set();
    images.forEach(img => {
      if (!seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        uniqueImages.push(img);
      }
    });

    return uniqueImages;
  }

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrapeImages') {
      try {
        const images = scrapeImages();
        sendResponse({ success: true, images: images });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      return true; // Keep the message channel open for async response
    }
  });
})();
