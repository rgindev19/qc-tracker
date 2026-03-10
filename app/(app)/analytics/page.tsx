import { getPayload } from 'payload';
import configPromise from '@payload-config';
import Link from 'next/link';
import TATChart from './TATChart';
import styles from './Analytics.module.css';
import DownloadPdfButton from './DownloadPdfButton';

export const dynamic = 'force-dynamic';

export default async function AnalyticsHub() {
  const payload = await getPayload({ config: configPromise });

  // 1. Fetch ALL completed inspections (Passed or Rejected)
  const { docs: inspections } = await payload.find({
    collection: 'inspections' as any,
    where: {
      or: [
        { status: { equals: 'passed' } },
        { status: { equals: 'rejected' } }
      ]
    },
    limit: 500, // Fetch enough for a monthly report
  });

  // 2. Perform the ISO-9001 Computation
  let totalCompleted = 0;
  let metTargetCount = 0;
  let totalElapsedHours = 0;
  const chartData: any[] = [];

  inspections.forEach((item: any) => {
    // Math: Convert timestamps to hours
    const start = new Date(item.timeReceived).getTime();
    const end = new Date(item.timeCompleted).getTime();
    const hours = (end - start) / (1000 * 60 * 60);

    totalCompleted++;
    totalElapsedHours += hours;

    // Check if the TAT breached the assigned target limit
    if (hours <= item.targetTatHours) {
      metTargetCount++;
    }

    // Push data to the chart array
    chartData.push({
      job: item.jobNo,
      tat: parseFloat(hours.toFixed(1)),
      target: item.targetTatHours
    });
  });

  // Calculate final dashboard metrics
  const complianceRate = totalCompleted > 0 ? ((metTargetCount / totalCompleted) * 100).toFixed(1) : "0";
  const averageTat = totalCompleted > 0 ? (totalElapsedHours / totalCompleted).toFixed(1) : "0";
  
  // Is the 98% target met?
  const isTargetMet = parseFloat(complianceRate) >= 98;

  // Get current month for the report title
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <main className={styles.container}>
      <DownloadPdfButton />
      {/* Navigation and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      </div>

      <Link href="/" className={styles.backLink}>
        ← Back to Dashboard
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>ISO-9001 Performance Report</h1>
        <p className={styles.subtitle}>
          Dyna Micro Precision Toolings & Fab. Inc. — {currentMonth}
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Inspections</div>
          <div className={styles.statValue}>{totalCompleted}</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Average TAT</div>
          <div className={styles.statValue}>{averageTat}h</div>
        </div>

        <div className={`${styles.statCard} ${isTargetMet ? styles.targetMet : styles.targetFailed}`}>
          <div className={styles.statLabel} style={{ color: '#111827' }}>
            Compliance Rate (Target: 98%)
          </div>
          <div className={styles.statValue}>{complianceRate}%</div>
          <div style={{ fontWeight: 900, textTransform: 'uppercase', marginTop: 'auto' }}>
            {isTargetMet ? "✓ TARGET MET" : "⚠ TARGET FAILED"}
          </div>
        </div>
      </div>

      <div className={styles.chartBox}>
        <div className={styles.chartHeader}>Turnaround Time vs Target (Recent Jobs)</div>
        <div style={{ height: 'calc(100% - 40px)' }}>
          <TATChart data={chartData} />
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#f3f4f6', border: '4px solid #111827' }}>
        <h3 style={{ textTransform: 'uppercase', fontWeight: 900, marginTop: 0 }}>Calculation Methodology</h3>
        <p style={{ fontWeight: 600, color: '#4b5563' }}>
          <strong>Turnaround Time (TAT)</strong> is automatically computed by the server exactly when an inspection is marked as PASSED or REJECTED. It is calculated as <code>(Time Completed - Time Received)</code>. 
          <br/><br/>
          <strong>Compliance Rate</strong> represents the percentage of completed inspections that were finalized under their respective Target TAT limit.
        </p>
      </div>

    </main>
  );
}