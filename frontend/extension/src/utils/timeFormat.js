// src/utils/timeFormat.js

export const formatTimestamp = (timestamp, format = 'both') => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Relative time format with progressive detail
  const getRelativeTime = () => {
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else {
      // For anything over 24 hours, return the date and time
      return date.toLocaleString();
    }
  };

  // Absolute time format
  const getAbsoluteTime = () => {
    return date.toLocaleString();
  };

  // Return based on format preference
  switch (format) {
    case 'relative':
      return getRelativeTime();
    case 'absolute':
      return getAbsoluteTime();
    case 'both':
      if (diffInSeconds < 86400) {
        // Less than 24 hours - show relative time
        return getRelativeTime();
      } else {
        // More than 24 hours - show date and time
        return getAbsoluteTime();
      }
    default:
      return getRelativeTime();
  }
};