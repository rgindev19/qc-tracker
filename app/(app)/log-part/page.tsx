"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
// If you built the server action earlier, uncomment the line below:
import { createInspection } from './actions'; 
import styles from './LogPart.module.css';
import { saveToOfflineQueue } from '../offlineSync';

export default function LogPartPage() {
  const router = useRouter();

  const handleLogPart = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  // 1. Grab the raw form data
  const formData = new FormData(e.currentTarget);
  
  // 2. Convert it into a clean JavaScript object so it can be saved/sent easily
  const reportData = Object.fromEntries(formData.entries());

  // 3. The Offline Check: Is the factory Wi-Fi down?
  if (!navigator.onLine) {
    await saveToOfflineQueue(reportData);
    alert("You are offline! Report saved to your device and will sync later.");
    
    // Reset the form so they can enter the next part
    e.currentTarget.reset(); 
    return;
  }

  // 4. The Online Attempt: Try sending it to the server
  try {
    // NOTE: If you are using Payload CMS local API or Server Actions, 
    // you might replace this fetch with your specific server function!
    const response = await fetch('/api/tat-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) throw new Error("Server rejected the submission");
    
    alert("Report submitted successfully!");
    
    // Redirect the inspector back to the main dashboard or reset the form
    router.push('/'); 

  } catch (error) {
    // 5. The Failsafe: If the Wi-Fi drops the exact millisecond they hit submit
    await saveToOfflineQueue(reportData);
    alert("Network error! Report saved to your device and will sync later.");
    e.currentTarget.reset();
  }
};

  return (
    <main className={styles.container}>
      <Link href="/" className={styles.backLink}>
        ← Back to Dashboard
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Log Incoming Part</h1>
        <p className={styles.subtitle}>Dyna Micro Precision Toolings & Fab. Inc. — QC Receiving</p>
      </div>

      <form className={styles.formBox} onSubmit={handleLogPart}>
        
        <div className={styles.inputGroup}>
          <label htmlFor="jobNo" className={styles.label}>TCN NO#</label>
          <input 
            type="text" 
            id="jobNo" 
            name="jobNo" 
            className={styles.input} 
            placeholder="e.g. J-8842" 
            required 
            autoFocus
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="partName" className={styles.label}>Part Description</label>
          <input 
            type="text" 
            id="partName" 
            name="partName" 
            className={styles.input} 
            placeholder="e.g. Main Housing Bracket" 
            required 
          />
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="quantity" className={styles.label}>Lot Quantity</label>
            <input 
              type="number" 
              id="quantity" 
              name="quantity" 
              className={styles.input} 
              min="1" 
              placeholder="e.g. 150" 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="targetTatHours" className={styles.label}>Target TAT</label>
            <select 
              id="targetTatHours" 
              name="targetTatHours" 
              className={styles.select} 
              defaultValue="2"
              required
            >
              <option value="2">2 Hours (Default / Rush)</option>
              <option value="4">4 Hours (Standard)</option>
              <option value="8">8 Hours (Full Shift)</option>
              <option value="24">24 Hours (Next Day)</option>
            </select>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Start the Clock
        </button>

      </form>
    </main>
  );
}