import localforage from 'localforage';

// Configure the database name for the device
localforage.config({
  name: 'QCTrackerOfflineDB',
  storeName: 'tat_reports_queue'
});

// Function to save a failed submission to the device
export async function saveToOfflineQueue(reportData: any) {
  try {
    // Get existing queued items, or start an empty array
    const existingQueue: any[] = (await localforage.getItem('offlineQueue')) || [];
    
    // Add the new report to the list
    existingQueue.push(reportData);
    
    // Save it back to the device's storage
    await localforage.setItem('offlineQueue', existingQueue);
    console.log("Report saved offline. It will sync when connection returns.");
  } catch (err) {
    console.error("Failed to save to offline queue", err);
  }
}

// Function to try syncing all saved items back to Payload CMS
export async function syncOfflineQueue() {
  try {
    const queue: any[] = (await localforage.getItem('offlineQueue')) || [];
    
    if (queue.length === 0) return; // Nothing to sync!

    console.log(`Attempting to sync ${queue.length} offline reports...`);

    // Loop through the queue and send them to your Payload CMS API
    for (let i = 0; i < queue.length; i++) {
      const report = queue[i];
      
      const response = await fetch('/api/Inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error("Server rejected the sync.");
      }
    }

    // If we make it here without throwing an error, all items synced successfully!
    // Clear the offline queue.
    await localforage.removeItem('offlineQueue');
    console.log("All offline reports synced successfully!");
    
  } catch (err) {
    console.error("Sync failed, keeping items in offline queue for later.", err);
  }
}