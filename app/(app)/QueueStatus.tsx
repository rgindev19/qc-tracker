"use client";

import { useState, useEffect } from 'react';

export default function QueueStatus() {
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    // Function to check how many items are in local storage
    const checkStorage = () => {
      const data = JSON.parse(localStorage.getItem('qc_reports') || '[]');
      setSavedCount(data.length);
    };

    // Check immediately when the page loads
    checkStorage();

    // Check every 1 second to keep the number perfectly accurate
    const interval = setInterval(checkStorage, 1000);

    return () => clearInterval(interval);
  }, []);

  // Displays a nice blue indicator with the total number of saved reports
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '900', color: '#3b82f6' }}>
      <span style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '50%', border: '2px solid #111827' }}></span>
      {savedCount} REPORTS SAVED LOCALLY
    </div>
  );
}