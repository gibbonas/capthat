// Background service worker for CapThat extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('CapThat! extension installed');
});

// Handle download requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadImage') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId: downloadId });
      }
    });
    return true; // Keep the message channel open
  }
  
  if (request.action === 'downloadMultiple') {
    const downloads = request.urls.map((url, index) => {
      const filename = `capture/${request.filenames[index] || `image-${Date.now()}-${index}.jpg`}`;
      return new Promise((resolve) => {
        chrome.downloads.download({
          url: url,
          filename: filename,
          saveAs: false
        }, (downloadId) => {
          resolve({ success: !chrome.runtime.lastError, downloadId, error: chrome.runtime.lastError?.message });
        });
      });
    });
    
    Promise.all(downloads).then(results => {
      sendResponse({ success: true, results });
    });
    
    return true; // Keep the message channel open
  }
});

