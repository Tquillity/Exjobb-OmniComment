// src/content.js
// This script runs in the context of web pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_URL') {
    sendResponse({ url: window.location.href });
  }
});