"use client";

import { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function QueueStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    // 1. Set initial online status the moment the component loads
    setIsOnline(navigator.onLine);

    // 2. Set up listeners for Wi-Fi drops and reconnects
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Create a silent loop that checks the offline queue every 2 seconds
    const checkQueue = async () => {
      try {
        const queue: any[] = (await localforage.getItem('offlineQueue')) || [];
        setQueueCount(queue.length);
      } catch (error) {
        console.error("Error checking queue", error);
      }
    };

    const interval = setInterval(checkQueue, 2000);
    checkQueue(); // Run immediately on mount

    // Cleanup when leaving the page
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // STATE 1: Online and all data is synced
  if (isOnline && queueCount === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '900', color: '#16a34a' }}>
        <span style={{ width: '12px', height: '12px', backgroundColor: '#16a34a', borderRadius: '50%', border: '2px solid #111827' }}></span>
        ONLINE
      </div>
    );
  }

  // STATE 2: Offline or actively holding pending reports
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '900', color: '#dc2626' }}>
      <span style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', borderRadius: '50%', border: '2px solid #111827' }}></span>
      {isOnline ? `SYNCING... (${queueCount})` : `OFFLINE: ${queueCount} PENDING`}
    </div>
  );
}