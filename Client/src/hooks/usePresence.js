import { useEffect } from 'react';
import { apiClient } from '../services/api';

/**
 * Custom hook to manage user presence/heartbeat
 * Sends periodic pings to the server to update lastSeenAt
 * @param {number} interval - Interval in milliseconds between pings (default: 5 minutes = 300000ms)
 * @param {boolean} enabled - Whether the hook should be active (default: true)
 */
const usePresence = (interval = 300000, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const sendPing = async () => {
      try {
        await apiClient.post('/presence/ping');
      } catch (error) {
        console.warn('Failed to send presence ping:', error);
        // Don't throw - presence ping failure shouldn't break the app
      }
    };

    // Send ping immediately on mount
    sendPing();

    // Then send ping periodically
    const intervalId = setInterval(sendPing, interval);

    return () => clearInterval(intervalId);
  }, [interval, enabled]);
};

export default usePresence;
