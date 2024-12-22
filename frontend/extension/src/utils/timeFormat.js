// Frontend/extension/src/utils/timeFormat.js

// Constants for time intervals in milliseconds
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Format a timestamp based on user preferences
 * @param {string|number|Date} timestamp - The timestamp to format
 * @param {string} format - The desired format ('relative', 'absolute', or 'both')
 * @param {Object} options - Additional formatting options
 * @returns {string} The formatted timestamp
 */
export const formatTimestamp = (timestamp, format = 'both', options = {}) => {
  const {
    includeTime = true,
    shortFormat = false,
    useUTC = false
  } = options;

  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;

  // Handle invalid dates
  if (isNaN(date.getTime())) {
    console.error('Invalid timestamp provided:', timestamp);
    return 'Invalid date';
  }

  // Get relative time string
  const getRelativeTime = () => {
    if (diffInMs < MINUTE) {
      return 'just now';
    } else if (diffInMs < HOUR) {
      const minutes = Math.floor(diffInMs / MINUTE);
      return shortFormat ? `${minutes}m` : `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMs < DAY) {
      const hours = Math.floor(diffInMs / HOUR);
      return shortFormat ? `${hours}h` : `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInMs < WEEK) {
      const days = Math.floor(diffInMs / DAY);
      return shortFormat ? `${days}d` : `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (diffInMs < MONTH) {
      const weeks = Math.floor(diffInMs / WEEK);
      return shortFormat ? `${weeks}w` : `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (diffInMs < YEAR) {
      const months = Math.floor(diffInMs / MONTH);
      return shortFormat ? `${months}mo` : `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInMs / YEAR);
      return shortFormat ? `${years}y` : `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  };

  // Get absolute time string
  const getAbsoluteTime = () => {
    const formatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && {
        hour: 'numeric',
        minute: 'numeric'
      }),
      ...(useUTC && { timeZone: 'UTC' })
    };

    return new Intl.DateTimeFormat(undefined, formatOptions).format(date);
  };

  // Return based on format preference
  switch (format) {
    case 'relative':
      return getRelativeTime();
    case 'absolute':
      return getAbsoluteTime();
    case 'both':
      // Use relative for recent times, absolute for older
      if (diffInMs < DAY) {
        return getRelativeTime();
      } else if (diffInMs < WEEK) {
        return `${getRelativeTime()} (${getAbsoluteTime()})`;
      } else {
        return getAbsoluteTime();
      }
    default:
      console.warn('Invalid format specified:', format);
      return getAbsoluteTime();
  }
};

/**
 * Format a duration in milliseconds to human readable string
 * @param {number} duration - Duration in milliseconds
 * @param {boolean} shortFormat - Whether to use short format
 * @returns {string} Formatted duration string
 */
export const formatDuration = (duration, shortFormat = false) => {
  if (duration < MINUTE) {
    return 'less than a minute';
  }

  const parts = [];
  const addPart = (value, unit, shortUnit) => {
    if (value === 0) return;
    if (shortFormat) {
      parts.push(`${value}${shortUnit}`);
    } else {
      parts.push(`${value} ${unit}${value !== 1 ? 's' : ''}`);
    }
  };

  const hours = Math.floor(duration / HOUR);
  const minutes = Math.floor((duration % HOUR) / MINUTE);

  addPart(hours, 'hour', 'h');
  addPart(minutes, 'minute', 'm');

  return parts.join(shortFormat ? ' ' : ' and ');
};

/**
 * Get a readable timestamp for the current timezone
 * @param {string|number|Date} timestamp - The timestamp to format
 * @returns {string} Formatted date and time
 */
export const getLocalTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short'
  }).format(date);
};