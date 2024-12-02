// src/content.js
console.log('OmniComment content script loaded');

// Create and inject the container
const container = document.createElement('div');
container.id = 'omnicomment-root';
document.body.appendChild(container);

// Create and inject the toggle button
const toggleButton = document.createElement('button');
toggleButton.id = 'omnicomment-toggle';
toggleButton.className = 'fixed bottom-5 right-5 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50';
toggleButton.innerHTML = '💬';
document.body.appendChild(toggleButton);

// Add click handler to toggle button
toggleButton.addEventListener('click', () => {
  const sidebar = document.getElementById('omnicomment-root');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_COMMENTS') {
    const sidebar = document.getElementById('omnicomment-root');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  }
});