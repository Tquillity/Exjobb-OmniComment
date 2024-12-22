// Frontend/webapp/src/utils/helpers.js
export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString();
}