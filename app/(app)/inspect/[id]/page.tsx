import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import InspectForm from './InspectForm';
import styles from './Inspect.module.css';
import LiveTimer from './LiveTimer';


// Ensure the ID resolves correctly in Next.js 15
export default async function InspectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const payload = await getPayload({ config: configPromise });

 // 1. Add ": any" to tell TypeScript not to worry about the shape of this object
  let inspection: any; 
  try {
    inspection = await payload.findByID({
      // 2. Add "as any" to force TypeScript to accept this collection name
      collection: 'inspections' as any, 
      id: id,
    });
  } catch (error) {
    return notFound(); 
  }

  // Format the dates securely on the server
  const receivedFormatted = new Date(inspection.timeReceived).toLocaleString();
  const isCompleted = inspection.status === 'passed' || inspection.status === 'rejected';

  return (
    <main className={styles.container}>
      <Link href="/" className={styles.backLink}>
        ← Back to Dashboard
      </Link>

      {/* 2. Drop the timer right here, above the data card */}
      <LiveTimer 
        timeReceived={inspection.timeReceived}
        targetTatHours={inspection.targetTatHours}
        isCompleted={isCompleted}
        timeCompleted={inspection.timeCompleted}
      />

      <div className={styles.header}>
        <h1 className={styles.title}>Inspection Report</h1>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#4b5563', marginTop: '8px' }}>
          Job Number: {inspection.jobNo}
        </p>
      </div>

      {/* Read-Only Top Data Card */}
      <div className={styles.dataCard}>
        <div>
          <div className={styles.dataLabel}>Part Description</div>
          <div className={styles.dataValue}>{inspection.partName}</div>
        </div>
        <div>
          <div className={styles.dataLabel}>Lot Quantity</div>
          <div className={styles.dataValue}>{inspection.quantity} units</div>
        </div>
        <div>
          <div className={styles.dataLabel}>Time Received</div>
          <div className={styles.dataValue} style={{ fontSize: '1.25rem' }}>{receivedFormatted}</div>
        </div>
        <div>
          <div className={styles.dataLabel}>Target TAT</div>
          <div className={styles.dataValue}>{inspection.targetTatHours} Hours</div>
        </div>
      </div>

      {/* Interactive Form Component */}
      <InspectForm 
        inspectionId={inspection.id} 
        initialNotes={inspection.qcNotes} 
        isCompleted={isCompleted} 
      />

    </main>
  );
}