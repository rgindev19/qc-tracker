import styles from '@/app/(app)/page.module.css';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
// CRUCIAL: Forces the page to fetch fresh data and recalculate time on every single load
export const dynamic = 'force-dynamic';

// Helper function to format the database status strings for the UI
const formatStatus = (status: string) => {
  switch (status) {
    case 'in_progress': return 'In Progress';
    case 'passed': return 'Passed';
    case 'rejected': return 'Rejected';
    case 'rework': return 'Rework Required';
    default: return 'Pending';
  }
};

export default async function QCDashboard() {
  
  // 1. Initialize Payload
  const payload = await getPayload({ config: configPromise });

  // 2. Fetch all inspections from the database, newest first
  const { docs: inspections } = await payload.find({
    collection: 'inspections' as any,
    sort: '-timeReceived', 
    limit: 100, 
  });

  // 3. Grab the exact server time right now for TAT math
  const now = new Date().getTime();

  return (
    <main className={styles.container}>
      
<header className={styles.header}>
        <div>
          <h1 className={styles.title}>QC Control Center</h1>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#4b5563', marginTop: '8px' }}>
            ISO-9001 Turnaround Time Tracker
          </p>
        </div>
        
        {/* The new button group wrapper */}
        <div className={styles.buttonGroup}>
          <Link href="/analytics" className={styles.analyticsButton}>
            📊 View Monthly Report
          </Link>
          
          <Link href="/log-part" className={styles.logButton}>
            + Log Incoming Part
          </Link>
        </div>
      </header>

      <section className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>QC ID / Job No.</th>
              <th className={styles.th}>Part Description</th>
              <th className={styles.th}>Qty</th>
              <th className={styles.th}>Elapsed / Target TAT</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {inspections.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                  No parts currently in the QC queue.
                </td>
              </tr>
            ) : (
              inspections.map((item: any) => {
                // --- ISO-9001 TAT CALCULATION LOGIC ---
                const receivedTime = new Date(item.timeReceived).getTime();
                let elapsedHours = 0;
                
                // If finished, calculate based on when it ended.
                // If pending/in progress, calculate based on time right now.
                if (item.status === 'passed' || item.status === 'rejected') {
                  const completedTime = item.timeCompleted ? new Date(item.timeCompleted).getTime() : now;
                  elapsedHours = (completedTime - receivedTime) / (1000 * 60 * 60);
                } else {
                  elapsedHours = (now - receivedTime) / (1000 * 60 * 60);
                }
                
                const formattedElapsed = elapsedHours.toFixed(1);
                
                // Critical if elapsed time > target AND it hasn't been finished
                const isCritical = elapsedHours > item.targetTatHours && item.status !== 'passed' && item.status !== 'rejected';
                // ---------------------------------------

                return (
                  <tr key={item.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 900 }}>{item.jobNo}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>ID: {item.id}</div>
                    </td>
                    <td className={styles.td}>{item.partName}</td>
                    <td className={styles.td}>{item.quantity}</td>
                    
                    <td className={styles.td}>
                      <span style={{ 
                        color: isCritical ? '#dc2626' : 'inherit', 
                        fontWeight: isCritical ? 900 : 600,
                        backgroundColor: isCritical ? '#fee2e2' : 'transparent',
                        padding: isCritical ? '4px 8px' : '0',
                        border: isCritical ? '2px solid #dc2626' : 'none'
                      }}>
                        {formattedElapsed}h
                      </span> 
                      {' '}/ {item.targetTatHours}h
                    </td>
                    
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${
                        isCritical ? styles.critical :
                        item.status === 'pending' ? styles.pending : 
                        item.status === 'passed' ? styles.passed : 
                        item.status === 'rejected' ? styles.rejected : 
                        styles.inProgress
                      }`}>
                        {isCritical ? 'TAT BREACH' : formatStatus(item.status)}
                      </span>
                    </td>
                    
                    <td className={styles.td}>
                      <Link 
                        href={`/inspect/${item.id}`} 
                        style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'underline' }}
                      >
                        {item.status === 'pending' ? 'Start Inspection' : 
                         item.status === 'passed' || item.status === 'rejected' ? 'View Report' : 
                         'Continue'}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

    </main>
  );
}